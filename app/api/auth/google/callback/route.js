import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOAuthClient, saveTokens } from '@/lib/googleCalendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (error) return NextResponse.redirect(`${base}/settings?calendar=denied`);
  if (!code) return NextResponse.redirect(`${base}/settings?calendar=error`);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(`${base}/auth/login`);
    }

    const client       = getOAuthClient();
    const { tokens }   = await client.getToken(code);
    await saveTokens(session.user.id, tokens);

    return NextResponse.redirect(`${base}/settings?calendar=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${base}/settings?calendar=error`);
  }
}
