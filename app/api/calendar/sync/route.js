import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { getAuthorizedClient, syncLogsToCalendar, isConnected } from '@/lib/googleCalendar';
import { seedTodayLogs } from '@/lib/seedLogs';

export async function POST() {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    if (!(await isConnected(userId))) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 });
    }

    const authClient = await getAuthorizedClient(userId);
    if (!authClient) {
      return NextResponse.json({ error: 'Could not get authorized client' }, { status: 401 });
    }

    await seedTodayLogs(userId);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const logs    = await AdherenceLog.find({ userId, date: { $in: dates } });
    const results = await syncLogsToCalendar(authClient, logs, userId);

    return NextResponse.json({ synced: results.length, details: results });
  } catch (err) {
    console.error('Calendar sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
