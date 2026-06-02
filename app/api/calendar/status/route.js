import { NextResponse } from 'next/server';
import { isConnected, loadTokens } from '@/lib/googleCalendar';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    const connected = await isConnected();

    if (!connected) {
      return NextResponse.json({ connected: false });
    }

    const calendarDoc = await Settings.findOne({ key: 'googleCalendarId' });
    return NextResponse.json({
      connected: true,
      calendarId: calendarDoc?.value ?? null,
    });
  } catch (err) {
    return NextResponse.json({ connected: false, error: err.message });
  }
}
