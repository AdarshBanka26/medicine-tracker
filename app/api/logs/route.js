import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { seedTodayLogs } from '@/lib/seedLogs';

export async function GET(request) {
  const session = await auth();
  const userId  = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const date  = searchParams.get('date');
  const today = new Date().toISOString().slice(0, 10);

  if (!date || date === today) {
    await seedTodayLogs(userId);
  }

  const query = { userId, date: date || today };
  const logs  = await AdherenceLog.find(query).sort({ scheduledTime: 1 });
  return NextResponse.json(logs);
}
