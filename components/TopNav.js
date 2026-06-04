'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const PAGE_CONFIG = {
  '/dashboard':      { title: 'Dashboard',    section: 'Dashboard' },
  '/schedules':      { title: 'Inventory',    section: 'Inventory' },
  '/schedules/new':  { title: 'New Elixir',   section: 'Inventory' },
  '/logs':           { title: 'Town Crier',   section: 'Archive' },
  '/calendar':       { title: 'Calendar',     section: 'Calendar' },
  '/fortune-teller': { title: 'Oracle',       section: 'Oracle' },
  '/settings':       { title: 'Settings',     section: 'Settings' },
};

const NAV_TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/schedules', label: 'Inventory' },
  { href: '/logs',      label: 'Archive' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const cfg = PAGE_CONFIG[pathname] ??
    (pathname.includes('/edit') ? { title: 'Edit Elixir', section: 'Inventory' } : { title: 'Alchemist Suite', section: '' });

  const initials = (session?.user?.name || 'MA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 300,
      height: 'var(--topnav-h)',
      background: 'rgba(248,250,255,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px', gap: '16px',
    }}>
      {/* Left: breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alchemist Suite</span>
        {cfg.section && (
          <>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{cfg.section}</span>
          </>
        )}
      </div>

      {/* Center: tab nav */}
      <div style={{ display: 'flex', gap: '2px', background: '#F1F5FF', borderRadius: '10px', padding: '3px' }}>
        {NAV_TABS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              padding: '5px 16px', borderRadius: '7px',
              background: active ? '#2563EB' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: active ? '700' : '500',
              textDecoration: 'none', transition: 'all 0.15s',
              boxShadow: active ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
            }}>{label}</Link>
          );
        })}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Link href="/schedules/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '6px 14px', borderRadius: '8px',
          background: '#2563EB', color: '#fff',
          fontSize: '12px', fontWeight: '700', textDecoration: 'none',
          boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
        }}>
          + New Elixir
        </Link>

        <IconBtn title="Notifications">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </IconBtn>

        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <IconBtn title="Settings">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </IconBtn>
        </Link>

        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
        }}>{initials}</div>
      </div>
    </header>
  );
}

function IconBtn({ children, title }) {
  return (
    <button title={title} style={{
      width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff', border: '1.5px solid var(--border)',
      borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >{children}</button>
  );
}
