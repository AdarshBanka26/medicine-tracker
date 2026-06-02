import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/lib/models/Schedule';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { seedTodayLogs } from '@/lib/seedLogs';
import { getAuthorizedClient, syncLogsToCalendar, isConnected } from '@/lib/googleCalendar';

async function getUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const schedules = await Schedule.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(schedules);
}

export async function POST(request) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const schedule = await Schedule.create({ ...body, userId });

  await seedTodayLogs(userId);

  if (await isConnected()) {
    const authClient = await getAuthorizedClient();
    if (authClient) {
      const today = new Date().toISOString().slice(0, 10);
      const logs = await AdherenceLog.find({ userId, scheduleId: schedule._id, date: today });
      syncLogsToCalendar(authClient, logs).catch((err) =>
        console.error('Calendar sync after schedule create:', err.message)
      );
    }
  }

  return NextResponse.json(schedule, { status: 201 });
}
