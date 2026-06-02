import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import ChatBot from '@/components/ChatBot';

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
          <div className="app-shell">
            <Sidebar />
            <div className="app-main">
              <TopNav />
              <div className="app-content">
                {children}
              </div>
              <footer className="app-footer">
                <span>Alchemist Suite &copy; 2024 Circus Alchemist Corp. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#">Legal</a>
                  <a href="#">Privacy Policy</a>
                  <a href="#">Support</a>
                  <a href="#">Documentation</a>
                </div>
              </footer>
            </div>
          </div>
          <ChatBot />
        </SessionProvider>
      </body>
    </html>
  );
}
