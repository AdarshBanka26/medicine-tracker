import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: "Pillora",
  description: 'Medication tracker with AI-powered adherence insights',
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
