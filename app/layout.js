import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: "Alchemist Suite — Grand Grimoire",
  description: 'The mystical medicine tracker for circus performers',
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <AppShell>
            {children}
          </AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
