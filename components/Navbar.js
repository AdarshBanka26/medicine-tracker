'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const links = [
  { href: '/',          label: 'Dashboard',    emoji: '📜' },
  { href: '/schedules', label: 'Schedules',    emoji: '⚗️' },
  { href: '/logs',      label: 'Log',          emoji: '📋' },
  { href: '/calendar',  label: 'Calendar',     emoji: '📅' },
  { href: '/settings',  label: 'Settings',     emoji: '⚙️' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @media (min-width: 640px) { .nav-mobile-menu { display: none !important; } }
        @media (max-width: 639px) { .nav-desktop-links { display: none !important; } }
      `}</style>

      <nav style={{
        background: 'linear-gradient(90deg, #0d0a1a, #1a0f2e, #0d0a1a)',
        borderBottom: '1px solid #4c1d95',
        boxShadow: '0 2px 20px rgba(124, 58, 237, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 500,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.4rem' }}>⚗️</span>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#d4af37',
              textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
              letterSpacing: '0.05em',
            }}>
              Grand Grimoire
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop-links" style={{ display: 'flex', gap: '2px' }}>
            {links.map(({ href, label, emoji }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontFamily: 'Georgia, serif',
                  color: active ? '#fbbf24' : '#c9b88a',
                  background: active ? 'rgba(76, 29, 149, 0.4)' : 'transparent',
                  border: active ? '1px solid #4c1d95' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>{emoji}</span> {label}
                </Link>
              );
            })}
          </div>

          {/* Hamburger button (mobile) */}
          <button
            className="nav-mobile-menu"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{
              background: menuOpen ? 'rgba(76,29,149,0.4)' : 'transparent',
              border: '1px solid #4c1d95',
              borderRadius: '8px',
              color: '#d4af37',
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
            aria-label="Toggle navigation"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="nav-mobile-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: '1px solid #4c1d95',
              background: '#0d0a1a',
              padding: '8px 1rem 12px',
            }}
          >
            {links.map(({ href, label, emoji }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  background: active ? 'rgba(76,29,149,0.35)' : 'transparent',
                  color: active ? '#fbbf24' : '#c9b88a',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontFamily: 'Georgia, serif',
                  borderLeft: active ? '3px solid #d4af37' : '3px solid transparent',
                }}>
                  <span>{emoji}</span> {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
