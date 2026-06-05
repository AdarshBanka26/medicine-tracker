import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { getAuthorizedClient, updateCalendarEvent, isConnected } from '@/lib/googleCalendar';

export async function PUT(request, { params }) {
  const session = await auth();
  const userId  = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id }     = await params;
  const { status } = await request.json();

  if (!['taken', 'missed', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const update = { status, takenAt: status === 'taken' ? new Date() : null };
  const log    = await AdherenceLog.findOneAndUpdate({ _id: id, userId }, update, { new: true });
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (log.calendarEventId && (await isConnected(userId))) {
    const authClient = await getAuthorizedClient(userId);
    if (authClient) {
      updateCalendarEvent(authClient, log.calendarEventId, log, userId).catch((err) =>
        console.error('Calendar update after status change:', err.message)
      );
    }
  }

  return NextResponse.json(log);
}
