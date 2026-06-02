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
    prompt: 'consent', // force refresh_token to be returned
  });
}

// ── Token persistence ─────────────────────────────────────────────────────────

export async function saveTokens(tokens) {
  await dbConnect();
  await Settings.findOneAndUpdate(
    { key: 'googleTokens' },
    { key: 'googleTokens', value: tokens, updatedAt: new Date() },
    { upsert: true }
  );
}

export async function loadTokens() {
  await dbConnect();
  const doc = await Settings.findOne({ key: 'googleTokens' });
  return doc?.value ?? null;
}

export async function deleteTokens() {
  await dbConnect();
  await Settings.deleteOne({ key: 'googleTokens' });
  await Settings.deleteOne({ key: 'googleCalendarId' });
}

export async function isConnected() {
  const tokens = await loadTokens();
  return tokens !== null;
}

// ── Authorized client helper ──────────────────────────────────────────────────

export async function getAuthorizedClient() {
  const tokens = await loadTokens();
  if (!tokens) return null;

  const client = getOAuthClient();
  client.setCredentials(tokens);

  // Auto-refresh if the token has expired
  client.on('tokens', async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await saveTokens(merged);
  });

  return client;
}

// ── Grand Grimoire Calendar ID ────────────────────────────────────────────────

async function getGrimoireCalendarId(auth) {
  await dbConnect();

  // Return cached ID if available
  const cached = await Settings.findOne({ key: 'googleCalendarId' });
  if (cached?.value) return cached.value;

  // Create a new secondary calendar named "Grand Grimoire"
  const calendar = google.calendar({ version: 'v3', auth });
  const { data } = await calendar.calendars.insert({
    requestBody: {
      summary: '⚗️ Grand Grimoire',
      description: 'Alchemist\'s medicine schedule — managed by the Grand Grimoire app',
      timeZone: 'UTC',
    },
  });

  await Settings.findOneAndUpdate(
    { key: 'googleCalendarId' },
    { key: 'googleCalendarId', value: data.id, updatedAt: new Date() },
    { upsert: true }
  );

  return data.id;
}

// ── Event helpers ─────────────────────────────────────────────────────────────

function buildEventBody(log, status = 'pending') {
  const start = new Date(log.scheduledTime);
  const end = new Date(start.getTime() + 15 * 60_000); // 15-minute slot

  const statusPrefix = status === 'taken' ? '✅ ' : status === 'missed' ? '❌ ' : '⏳ ';
  const colorId = status === 'taken' ? '10' : status === 'missed' ? '11' : '7'; // green / red / peacock-blue

  return {
    summary: `${statusPrefix}⚗️ ${log.elixirName} (${log.dosage})`,
    description: `Grand Grimoire medication reminder\nElixir: ${log.elixirName}\nDosage: ${log.dosage}\nScheduled: ${start.toLocaleString()}`,
    start: { dateTime: start.toISOString(), timeZone: 'UTC' },
    end: { dateTime: end.toISOString(), timeZone: 'UTC' },
    colorId,
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 10 }],
    },
  };
}

// Creates a Calendar event for a single AdherenceLog entry.
// Returns the event ID, or null on failure.
export async function createCalendarEvent(auth, log) {
  try {
    const calendarId = await getGrimoireCalendarId(auth);
    const calendar = google.calendar({ version: 'v3', auth });
    const { data } = await calendar.events.insert({
      calendarId,
      requestBody: buildEventBody(log, log.status),
    });
    return data.id;
  } catch (err) {
    console.error('createCalendarEvent failed:', err.message);
    return null;
  }
}

// Updates an existing Calendar event when a dose status changes.
export async function updateCalendarEvent(auth, eventId, log) {
  if (!eventId) return;
  try {
    const calendarId = await getGrimoireCalendarId(auth);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: buildEventBody(log, log.status),
    });
  } catch (err) {
    console.error('updateCalendarEvent failed:', err.message);
  }
}

// Syncs all provided AdherenceLog documents to Google Calendar.
// Updates calendarEventId on each log in-place.
export async function syncLogsToCalendar(auth, logs) {
  const results = [];
  for (const log of logs) {
    if (log.calendarEventId) {
      // Already has an event — just update status
      await updateCalendarEvent(auth, log.calendarEventId, log);
      results.push({ logId: log._id, action: 'updated' });
    } else {
      const eventId = await createCalendarEvent(auth, log);
      if (eventId) {
        log.calendarEventId = eventId;
        await log.save();
        results.push({ logId: log._id, action: 'created', eventId });
      }
    }
  }
  return results;
}
