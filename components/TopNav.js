'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_CONFIG = {
  '/dashboard':      { title: 'Wellness Altar Dashboard', section: 'Wellness' },
  '/schedules':      { title: 'Grand Elixir Log',         section: 'Elixir Log' },
  '/schedules/new':  { title: 'New Elixir Entry',         section: 'Elixir Log' },
  '/logs':           { title: 'Circus Crier Reminders',   section: 'Circus Crier' },
  '/calendar':       { title: 'Sky Calendar',             section: 'Sky Calendar' },
  '/fortune-teller': { title: "Oracle AI Assistant",      section: 'Fortune Teller' },
  '/settings':       { title: 'Settings',                 section: 'Settings' },
};

export default function TopNav() {
  const pathname = usePathname();

  const cfg = PAGE_CONFIG[pathname] ??
    (pathname.includes('/edit')
      ? { title: 'Edit Elixir', section: 'Elixir Log' }
      : { title: 'Alchemist Suite', section: '' });

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 300,
      height: 'var(--topnav-h)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: '16px',
    }}>
      {/* Left: breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alchemist Suite</span>
        {cfg.section && (
          <>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>{cfg.section}</span>
          </>
        )}
      </div>

      {/* Center: search */}
      <div className="search-bar" style={{ width: '300px', flex: '0 1 300px' }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input placeholder="Search elixirs, performers, or status..." />
      </div>

      {/* Right: icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Notification bell */}
        <IconBtn title="Notifications">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </IconBtn>
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <IconBtn title="Settings">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </IconBtn>
        </Link>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
          flexShrink: 0,
        }}>MA</div>
      </div>
    </header>
  );
}

function IconBtn({ children, title }) {
  return (
    <button title={title} style={{
      width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', border: '1px solid var(--border)',
      borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {children}
    </button>
  );
}
