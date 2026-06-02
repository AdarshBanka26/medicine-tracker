import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { getAuthorizedClient, syncLogsToCalendar, isConnected } from '@/lib/googleCalendar';
import { seedTodayLogs } from '@/lib/seedLogs';

// Syncs today's + next-7-days logs to Google Calendar.
export async function POST() {
  try {
    await dbConnect();

    if (!(await isConnected())) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 });
    }

    const auth = await getAuthorizedClient();
    if (!auth) {
      return NextResponse.json({ error: 'Could not get authorized client' }, { status: 401 });
    }

    // Seed today's logs so we have entries to sync
    await seedTodayLogs();

    // Sync the next 7 days (today included)
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const logs = await AdherenceLog.find({ date: { $in: dates } });
    const results = await syncLogsToCalendar(auth, logs);

    return NextResponse.json({ synced: results.length, details: results });
  } catch (err) {
    console.error('Calendar sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
