'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ChatBot from './ChatBot';

// Routes that render WITHOUT the sidebar/topnav
const PUBLIC_PATHS = ['/'];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth');
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopNav />
        <div className="app-content">
          {children}
        </div>
        <footer className="app-footer">
          <span>Pillora &copy; 2024. All rights reserved.</span>
        </footer>
      </div>
      <ChatBot />
    </div>
  );
}
