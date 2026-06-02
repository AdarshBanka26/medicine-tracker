import { NextResponse } from 'next/server';
import { getOAuthClient, saveTokens } from '@/lib/googleCalendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${base}/?calendar=denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${base}/?calendar=error`);
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    await saveTokens(tokens);
    return NextResponse.redirect(`${base}/?calendar=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${base}/?calendar=error`);
  }
}
