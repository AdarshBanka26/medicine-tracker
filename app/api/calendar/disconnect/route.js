import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAuthorizedClient, deleteTokens, getOAuthClient } from '@/lib/googleCalendar';

export async function POST() {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authClient = await getAuthorizedClient(userId);

    if (authClient) {
      const client = getOAuthClient();
      try {
        const tokens = authClient.credentials;
        if (tokens?.access_token) {
          await client.revokeToken(tokens.access_token);
        }
      } catch {
        // Revoke failure is non-fatal — we still clear local tokens
      }
    }

    await deleteTokens(userId);
    return NextResponse.json({ disconnected: true });
  } catch (err) {
    console.error('Disconnect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
