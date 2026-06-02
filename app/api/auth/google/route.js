import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleCalendar';

export async function GET() {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured in .env.local' },
        { status: 503 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
