import { google } from 'googleapis';
import dbConnect from './mongodb';
import Settings from './models/Settings';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar'];

// ── OAuth client ──────────────────────────────────────────────────────────────

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

export function getAuthUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

// ── Per-user token persistence ────────────────────────────────────────────────

function tokensKey(userId)   { return `googleTokens_${userId}`; }
function calendarKey(userId) { return `googleCalendarId_${userId}`; }

export async function saveTokens(userId, tokens) {
  await dbConnect();
  const key = tokensKey(userId);
  await Settings.findOneAndUpdate(
    { key },
    { key, value: tokens, updatedAt: new Date() },
    { upsert: true }
  );
}

export async function loadTokens(userId) {
  await dbConnect();
  const doc = await Settings.findOne({ key: tokensKey(userId) });
  return doc?.value ?? null;
}

export async function deleteTokens(userId) {
  await dbConnect();
  await Settings.deleteOne({ key: tokensKey(userId) });
  await Settings.deleteOne({ key: calendarKey(userId) });
}

export async function isConnected(userId) {
  const tokens = await loadTokens(userId);
  return tokens !== null;
}

// ── Authorized client helper ──────────────────────────────────────────────────

export async function getAuthorizedClient(userId) {
  const tokens = await loadTokens(userId);
  if (!tokens) return null;

  const client = getOAuthClient();
  client.setCredentials(tokens);

  client.on('tokens', async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await saveTokens(userId, merged);
  });

  return client;
}

// ── Per-user Calendar ID ──────────────────────────────────────────────────────

async function getGrimoireCalendarId(auth, userId) {
  await dbConnect();

  const cached = await Settings.findOne({ key: calendarKey(userId) });
  if (cached?.value) return cached.value;

  const calendar = google.calendar({ version: 'v3', auth });
  const { data } = await calendar.calendars.insert({
    requestBody: {
      summary: '⚗️ Grand Grimoire',
      description: "Alchemist's medicine schedule — managed by the Grand Grimoire app",
      timeZone: 'UTC',
    },
  });

  await Settings.findOneAndUpdate(
    { key: calendarKey(userId) },
    { key: calendarKey(userId), value: data.id, updatedAt: new Date() },
    { upsert: true }
  );

  return data.id;
}

// ── Event helpers ─────────────────────────────────────────────────────────────

function buildEventBody(log, status = 'pending') {
  const start = new Date(log.scheduledTime);
  const end   = new Date(start.getTime() + 15 * 60_000);

  const statusPrefix = status === 'taken' ? '✅ ' : status === 'missed' ? '❌ ' : '⏳ ';
  const colorId      = status === 'taken' ? '10' : status === 'missed' ? '11' : '7';

  return {
    summary: `${statusPrefix}⚗️ ${log.elixirName} (${log.dosage})`,
    description: `Grand Grimoire medication reminder\nElixir: ${log.elixirName}\nDosage: ${log.dosage}\nScheduled: ${start.toLocaleString()}`,
    start: { dateTime: start.toISOString(), timeZone: 'UTC' },
    end:   { dateTime: end.toISOString(),   timeZone: 'UTC' },
    colorId,
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 10 }],
    },
  };
}

export async function createCalendarEvent(auth, log, userId) {
  try {
    const calendarId = await getGrimoireCalendarId(auth, userId);
    const calendar   = google.calendar({ version: 'v3', auth });
    const { data }   = await calendar.events.insert({
      calendarId,
      requestBody: buildEventBody(log, log.status),
    });
    return data.id;
  } catch (err) {
    console.error('createCalendarEvent failed:', err.message);
    return null;
  }
}

export async function updateCalendarEvent(auth, eventId, log, userId) {
  if (!eventId) return;
  try {
    const calendarId = await getGrimoireCalendarId(auth, userId);
    const calendar   = google.calendar({ version: 'v3', auth });
    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: buildEventBody(log, log.status),
    });
  } catch (err) {
    console.error('updateCalendarEvent failed:', err.message);
  }
}

export async function syncLogsToCalendar(auth, logs, userId) {
  const results = [];
  for (const log of logs) {
    if (log.calendarEventId) {
      await updateCalendarEvent(auth, log.calendarEventId, log, userId);
      results.push({ logId: log._id, action: 'updated' });
    } else {
      const eventId = await createCalendarEvent(auth, log, userId);
      if (eventId) {
        log.calendarEventId = eventId;
        await log.save();
        results.push({ logId: log._id, action: 'created', eventId });
      }
    }
  }
  return results;
}
