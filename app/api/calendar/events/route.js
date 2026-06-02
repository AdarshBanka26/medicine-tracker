import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import Schedule from '@/lib/models/Schedule';

const STATUS_STYLE = {
  taken:   { backgroundColor: '#10b981', borderColor: '#059669', textColor: '#ffffff' },
  missed:  { backgroundColor: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff' },
  pending: { backgroundColor: '#4c1d95', borderColor: '#7c3aed', textColor: '#fbbf24' },
  future:  { backgroundColor: '#1a0f2e', borderColor: '#4c1d95', textColor: '#c9b88a' },
};

const STATUS_EMOJI = { taken: '✅', missed: '❌', pending: '⏳', future: '📅' };

function dateStr(date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    // FullCalendar sends ISO strings; fall back to 30-day window
    const rangeStart = searchParams.get('start')
      ? new Date(searchParams.get('start'))
      : (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d; })();
    const rangeEnd = searchParams.get('end')
      ? new Date(searchParams.get('end'))
      : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })();

    const startStr = dateStr(rangeStart);
    const endStr   = dateStr(rangeEnd);
    const today    = dateStr(new Date());

    // ── 1. Logged events (have an AdherenceLog entry) ─────────────────────
    const logs = await AdherenceLog.find({
      date: { $gte: startStr, $lte: endStr },
    }).lean();

    const logEvents = logs.map((log) => {
      const start = new Date(log.scheduledTime);
      const end   = new Date(start.getTime() + 15 * 60_000);
      const style = STATUS_STYLE[log.status] ?? STATUS_STYLE.pending;
      const emoji = STATUS_EMOJI[log.status] ?? '⏳';

      return {
        id: `log-${log._id}`,
        title: `${emoji} ${log.elixirName} (${log.dosage})`,
        start: start.toISOString(),
        end:   end.toISOString(),
        ...style,
        extendedProps: {
          type: 'log',
          logId: String(log._id),
          status: log.status,
          elixirName: log.elixirName,
          dosage: log.dosage,
          takenAt: log.takenAt,
        },
      };
    });

    // Build a set of (scheduleId + date) pairs that already have a log
    const loggedKeys = new Set(logs.map((l) => `${l.scheduleId}-${l.date}`));

    // ── 2. Future ghost events from active schedules (no log yet) ─────────
    const schedules = await Schedule.find({ isActive: true, frequency: { $ne: 'as-needed' } }).lean();
    const ghostEvents = [];

    const cursor = new Date(Math.max(rangeStart.getTime(), new Date().getTime()));
    cursor.setHours(0, 0, 0, 0);
    const limit = new Date(rangeEnd);

    while (cursor <= limit) {
      const ds = dateStr(cursor);
      if (ds <= today) { cursor.setDate(cursor.getDate() + 1); continue; } // only future

      for (const sched of schedules) {
        for (const timeStr of sched.times) {
          const key = `${sched._id}-${ds}`;
          if (loggedKeys.has(key)) continue; // already logged

          const [h, m] = timeStr.split(':').map(Number);
          const start = new Date(cursor);
          start.setHours(h, m, 0, 0);
          const end = new Date(start.getTime() + 15 * 60_000);

          ghostEvents.push({
            id: `ghost-${sched._id}-${ds}-${timeStr}`,
            title: `📅 ${sched.elixirName} (${sched.dosage})`,
            start: start.toISOString(),
            end:   end.toISOString(),
            ...STATUS_STYLE.future,
            extendedProps: {
              type: 'scheduled',
              scheduleId: String(sched._id),
              elixirName: sched.elixirName,
              dosage: sched.dosage,
              frequency: sched.frequency,
            },
          });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json([...logEvents, ...ghostEvents]);
  } catch (err) {
    console.error('Calendar events error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
