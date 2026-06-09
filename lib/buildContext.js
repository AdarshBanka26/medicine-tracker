import mongoose from 'mongoose';
import dbConnect from './mongodb';
import Schedule from './models/Schedule';
import AdherenceLog from './models/AdherenceLog';

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function buildContext({ historyDays = 14, userId } = {}) {
  await dbConnect();

  const userOid = userId
    ? (typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId)
    : null;

  const scheduleQuery = userOid ? { isActive: true, userId: userOid } : { isActive: true };
  const logQuery      = {
    date: { $gte: dateStr(-(historyDays - 1)), $lte: dateStr(0) },
    ...(userOid ? { userId: userOid } : {}),
  };

  const [schedules, recentLogs] = await Promise.all([
    Schedule.find(scheduleQuery).lean(),
    AdherenceLog.find(logQuery).sort({ scheduledTime: 1 }).lean(),
  ]);

  const today = dateStr(0);
  const yesterday = dateStr(-1);
  const todayLogs     = recentLogs.filter((l) => l.date === today);
  const yesterdayLogs = recentLogs.filter((l) => l.date === yesterday);

  const scheduleLines = schedules.map(
    (s) => `  • ${s.elixirName} — ${s.dosage}, ${s.frequency}${s.times.length ? ` at ${s.times.join(', ')}` : ''}`
  );

  const todayLines = todayLogs.map(
    (l) => `  • ${l.elixirName} (${l.dosage}) @ ${fmtTime(l.scheduledTime)} → ${l.status.toUpperCase()}${l.takenAt ? ` (taken ${fmtTime(l.takenAt)})` : ''}`
  );

  const yTaken   = yesterdayLogs.filter((l) => l.status === 'taken').length;
  const yMissed  = yesterdayLogs.filter((l) => l.status === 'missed').length;
  const yPending = yesterdayLogs.filter((l) => l.status === 'pending').length;

  const patternMap = {};
  for (const log of recentLogs) {
    const hour   = new Date(log.scheduledTime).getHours();
    const bucket = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const key    = `${log.elixirName}|${bucket}`;
    if (!patternMap[key]) patternMap[key] = { taken: 0, missed: 0, pending: 0 };
    patternMap[key][log.status]++;
  }
  const patternLines = Object.entries(patternMap).map(([key, v]) => {
    const total    = v.taken + v.missed + v.pending;
    const missRate = total > 0 ? Math.round((v.missed / total) * 100) : 0;
    return `  • ${key.replace('|', ' ')} — ${missRate}% miss rate (${v.taken} taken, ${v.missed} missed of ${total})`;
  });

  return `
=== PILLORA — AI CONTEXT ===
Today: ${today}

ACTIVE MEDICATION SCHEDULES (${schedules.length}):
${scheduleLines.join('\n') || '  (none)'}

TODAY'S DOSES (${todayLogs.length} total):
${todayLines.join('\n') || '  (none yet)'}

YESTERDAY SUMMARY: ${yTaken} taken, ${yMissed} missed, ${yPending} pending

LAST ${historyDays}-DAY MISS PATTERNS:
${patternLines.join('\n') || '  (no history yet)'}
`.trim();
}
