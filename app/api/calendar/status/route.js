import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isConnected } from '@/lib/googleCalendar';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const connected = await isConnected(userId);

    if (!connected) {
      return NextResponse.json({ connected: false });
    }

    const calendarDoc = await Settings.findOne({ key: `googleCalendarId_${userId}` });
    return NextResponse.json({
      connected: true,
      calendarId: calendarDoc?.value ?? null,
    });
  } catch (err) {
    return NextResponse.json({ connected: false, error: err.message });
  }
}
