'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function Section({ title, emoji, children }) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '16px' }}>{emoji}</span>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatusRow({ label, value, ok }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: '600', color: ok ? '#10B981' : '#EF4444' }}>
        {ok ? '✅ ' : '❌ '}{value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();

  const [dbStatus, setDbStatus]           = useState(null);
  const [scheduleCount, setScheduleCount] = useState(null);
  const [emailSending, setEmailSending]   = useState(false);
  const [emailResult, setEmailResult]     = useState('');
  const [calStatus, setCalStatus]         = useState(null);
  const [calWorking, setCalWorking]       = useState(false);
  const [calMsg, setCalMsg]               = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json()).then(setDbStatus)
      .catch(() => setDbStatus({ status: 'error', error: 'Could not reach server' }));

    fetch('/api/schedules')
      .then(r => r.json()).then(d => setScheduleCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});

    fetch('/api/calendar/status')
      .then(r => r.json()).then(setCalStatus)
      .catch(() => setCalStatus({ connected: false }));

    // Show toast if redirected back from Google OAuth
    const calParam = searchParams.get('calendar');
    if (calParam === 'connected') setCalMsg('✅ Google Calendar connected successfully!');
    else if (calParam === 'denied')    setCalMsg('⚠️ Google Calendar access was denied.');
    else if (calParam === 'error')     setCalMsg('❌ Google Calendar connection failed. Try again.');
  }, [searchParams]);

  async function sendTestEmail(type) {
    setEmailSending(true);
    setEmailResult('');
    try {
      const res  = await fetch('/api/reminders/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
      const data = await res.json();
      setEmailResult(res.ok ? `✅ ${data.sent ? `Email sent to ${data.to}` : data.message}` : `❌ ${data.error}`);
    } catch { setEmailResult('❌ Network error'); }
    finally  { setEmailSending(false); }
  }

  async function connectCalendar() {
    window.location.href = '/api/auth/google';
  }

  async function disconnectCalendar() {
    setCalWorking(true);
    setCalMsg('');
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' });
      if (res.ok) {
        setCalStatus({ connected: false });
        setCalMsg('✅ Google Calendar disconnected.');
      } else {
        const d = await res.json();
        setCalMsg(`❌ ${d.error}`);
      }
    } catch { setCalMsg('❌ Network error'); }
    finally  { setCalWorking(false); }
  }

  async function syncCalendar() {
    setCalWorking(true);
    setCalMsg('');
    try {
      const res  = await fetch('/api/calendar/sync', { method: 'POST' });
      const data = await res.json();
      setCalMsg(res.ok ? `✅ Synced ${data.synced} event(s) to Google Calendar.` : `❌ ${data.error}`);
    } catch { setCalMsg('❌ Network error'); }
    finally  { setCalWorking(false); }
  }

  const ENV_VARS = [
    { label: 'MongoDB URI',        key: 'MONGODB_URI',          required: true  },
    { label: 'Auth Secret',        key: 'AUTH_SECRET',          required: true  },
    { label: 'Gemini API Key',     key: 'GEMINI_API_KEY',       required: true  },
    { label: 'Email From',         key: 'EMAIL_FROM',           required: false },
    { label: 'Email Password',     key: 'EMAIL_PASS',           required: false },
    { label: 'Email To',           key: 'EMAIL_TO',             required: false },
    { label: 'Google Client ID',   key: 'GOOGLE_CLIENT_ID',     required: false },
    { label: 'Google Client Secret', key: 'GOOGLE_CLIENT_SECRET', required: false },
    { label: 'Base URL',           key: 'NEXT_PUBLIC_BASE_URL', required: true  },
  ];

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System status and configuration for the Pillora</p>
      </div>

      {/* System Status */}
      <Section title="System Status" emoji="🔍">
        <StatusRow
          label="MongoDB Connection"
          value={dbStatus === null ? 'Checking…' : dbStatus.status === 'ok' ? `Connected (${dbStatus.dbName})` : (dbStatus.error || 'Error')}
          ok={dbStatus?.status === 'ok'}
        />
        <StatusRow
          label="Active Schedules"
          value={scheduleCount !== null ? `${scheduleCount} schedule(s)` : 'Loading…'}
          ok={scheduleCount !== null}
        />
        <StatusRow
          label="AI Assistant"
          value="Available"
          ok={true}
        />
      </Section>

      {/* Google Calendar */}
      <Section title="Google Calendar Sync" emoji="📅">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Connect your Google account to sync your medication schedules and dose status to a dedicated <strong>Pillora</strong> calendar.
          Requires <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_CLIENT_ID</code> and{' '}
          <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>GOOGLE_CLIENT_SECRET</code> in{' '}
          <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>.env.local</code>.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: calStatus?.connected ? '#10B981' : '#9CA3AF',
          }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {calStatus === null ? 'Checking…' : calStatus.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {!calStatus?.connected ? (
            <button className="btn-primary" style={{ fontSize: '13px' }} onClick={connectCalendar} disabled={calWorking}>
              🔗 Connect Google Calendar
            </button>
          ) : (
            <>
              <button className="btn-primary" style={{ fontSize: '13px' }} onClick={syncCalendar} disabled={calWorking}>
                {calWorking ? 'Working…' : '🔄 Sync Now (7 days)'}
              </button>
              <button className="btn-outline" style={{ fontSize: '13px', color: '#EF4444', borderColor: '#EF4444' }} onClick={disconnectCalendar} disabled={calWorking}>
                {calWorking ? 'Working…' : '🔌 Disconnect'}
              </button>
            </>
          )}
        </div>

        {calMsg && (
          <div style={{
            padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
            background: calMsg.startsWith('✅') ? '#D1FAE5' : calMsg.startsWith('⚠️') ? '#FEF3C7' : '#FEE2E2',
            border: `1px solid ${calMsg.startsWith('✅') ? '#A7F3D0' : calMsg.startsWith('⚠️') ? '#FDE68A' : '#FECACA'}`,
            color: calMsg.startsWith('✅') ? '#065F46' : calMsg.startsWith('⚠️') ? '#92400E' : '#991B1B',
          }}>
            {calMsg}
          </div>
        )}
      </Section>

      {/* Email Reminders */}
      <Section title="Email Reminders" emoji="📧">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Uses Gmail SMTP with an App Password.
          Go to <strong>Google Account → Security → 2-Step Verification → App Passwords</strong> to generate one,
          then set <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>EMAIL_PASS</code> in{' '}
          <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>.env.local</code>.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => sendTestEmail('daily-digest')} disabled={emailSending}>
            {emailSending ? 'Sending…' : '📬 Send Daily Digest'}
          </button>
          <button className="btn-outline" style={{ fontSize: '13px' }} onClick={() => sendTestEmail('pending-now')} disabled={emailSending}>
            {emailSending ? 'Sending…' : '⚡ Pending-Now Alert'}
          </button>
        </div>
        {emailResult && (
          <div style={{
            padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
            background: emailResult.startsWith('✅') ? '#D1FAE5' : '#FEE2E2',
            border: `1px solid ${emailResult.startsWith('✅') ? '#A7F3D0' : '#FECACA'}`,
            color: emailResult.startsWith('✅') ? '#065F46' : '#991B1B',
          }}>
            {emailResult}
          </div>
        )}
      </Section>

      {/* Quick Nav */}
      <Section title="Quick Navigation" emoji="🧭">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { href: '/dashboard',      label: '💊 Dashboard' },
            { href: '/schedules',      label: '⚗️ Medications' },
            { href: '/logs',           label: '🔔 Reminders' },
            { href: '/calendar',       label: '📅 Calendar' },
            { href: '/fortune-teller', label: '✦ AI Assistant' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '10px 14px', borderRadius: '8px',
              background: 'var(--bg-table-head)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', textDecoration: 'none', fontSize: '13px',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </Section>

      {/* Env Vars */}
      <Section title="Environment Variables" emoji="🔑">
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          All secrets live in <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px' }}>.env.local</code> at the project root.
          Never commit this file to git.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ENV_VARS.map(({ label, key, required }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {label}
                {required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
              </span>
              <code style={{ fontSize: '11px', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', color: '#6B7280' }}>{key}</code>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span style={{ color: '#EF4444' }}>*</span> Required for core functionality
        </p>
      </Section>
    </div>
  );
}
