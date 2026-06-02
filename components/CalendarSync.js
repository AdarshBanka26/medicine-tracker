'use client';
import { useState, useEffect } from 'react';

export default function CalendarSync() {
  const [status, setStatus] = useState(null); // null = loading
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState('');

  // Read ?calendar= query param set by the OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('calendar');
    if (result === 'connected') setMessage('✅ Google Calendar connected successfully!');
    if (result === 'denied') setMessage('⚠️ Calendar access was denied.');
    if (result === 'error') setMessage('❌ Something went wrong during Google sign-in.');
    // Clean the query param from the URL without a reload
    if (result) {
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    }
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/calendar/status');
      if (res.ok) setStatus(await res.json());
    } catch {
      setStatus({ connected: false });
    }
  }

  useEffect(() => { fetchStatus(); }, []);

  async function handleSync() {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Synced ${data.synced} dose${data.synced !== 1 ? 's' : ''} to Google Calendar.`);
      } else {
        setMessage(`❌ Sync failed: ${data.error}`);
      }
    } catch {
      setMessage('❌ Sync request failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Google Calendar from the Grimoire?')) return;
    setDisconnecting(true);
    setMessage('');
    try {
      await fetch('/api/calendar/disconnect', { method: 'POST' });
      setStatus({ connected: false });
      setMessage('Disconnected from Google Calendar.');
    } catch {
      setMessage('❌ Disconnect failed.');
    } finally {
      setDisconnecting(false);
    }
  }

  // Don't render until status is loaded (avoids layout shift)
  if (status === null) return null;

  const credsMissing =
    !process.env.NEXT_PUBLIC_BASE_URL &&
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost';

  return (
    <div
      className="grimoire-card"
      style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Left: icon + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
          <div>
            <div
              style={{ fontSize: '0.88rem', fontWeight: '700', color: '#d4af37', letterSpacing: '0.03em' }}
            >
              Great Sky Calendar
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1px' }}>
              {status.connected
                ? 'Your elixir schedules sync to Google Calendar automatically.'
                : 'Connect to sync schedules directly to Google Calendar.'}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {status.connected ? (
            <>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  color: '#6ee7b7',
                  fontWeight: '600',
                }}
              >
                ● Connected
              </span>
              <button
                className="btn-magic"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing…' : '↺ Sync Now'}
              </button>
              <button
                className="btn-danger"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                Disconnect
              </button>
            </>
          ) : (
            <a
              href="/api/auth/google"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                border: '1px solid #d4af37',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.82rem',
                color: '#fbbf24',
                fontWeight: '600',
                textDecoration: 'none',
                letterSpacing: '0.03em',
              }}
            >
              <GoogleIcon />
              Connect Google Calendar
            </a>
          )}
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: message.startsWith('✅') ? '#6ee7b7' : message.startsWith('⚠️') ? '#fbbf24' : '#fca5a5',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(76,29,149,0.3)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
