import { NextResponse } from 'next/server';
import { getAuthorizedClient, deleteTokens, getOAuthClient } from '@/lib/googleCalendar';

export async function POST() {
  try {
    const auth = await getAuthorizedClient();

    if (auth) {
      // Revoke the token on Google's side
      const client = getOAuthClient();
      try {
        const tokens = auth.credentials;
        if (tokens?.access_token) {
          await client.revokeToken(tokens.access_token);
        }
      } catch {
        // Revoke failure is non-fatal — we still clear local tokens
      }
    }

    await deleteTokens();
    return NextResponse.json({ disconnected: true });
  } catch (err) {
    console.error('Disconnect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
