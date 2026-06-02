import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';

export async function GET(request) {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const logs = await AdherenceLog.find({ userId, date: { $in: dates } }).sort({ scheduledTime: 1 });

    const byDate = {};
    for (const date of dates) {
      byDate[date] = { date, taken: 0, missed: 0, pending: 0, total: 0 };
    }
    for (const log of logs) {
      if (byDate[log.date]) {
        byDate[log.date][log.status]++;
        byDate[log.date].total++;
      }
    }

    return NextResponse.json(Object.values(byDate));
  } catch (err) {
    console.error('History route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
