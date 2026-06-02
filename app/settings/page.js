'use client';
import { useState, useEffect } from 'react';
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
  const [dbStatus, setDbStatus]       = useState(null);
  const [scheduleCount, setScheduleCount] = useState(null);
  const [emailSending, setEmailSending]   = useState(false);
  const [emailResult, setEmailResult]     = useState('');

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setDbStatus).catch(() => setDbStatus({ status: 'error', error: 'Could not reach server' }));
    fetch('/api/schedules').then(r => r.json()).then(d => setScheduleCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
  }, []);

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

  const ENV_VARS = [
    { label: 'MongoDB URI',      key: 'MONGODB_URI',          required: true  },
    { label: 'Gemini API Key',   key: 'GEMINI_API_KEY',       required: true  },
    { label: 'Email From',       key: 'EMAIL_FROM',           required: false },
    { label: 'Email Password',   key: 'EMAIL_PASS',           required: false },
    { label: 'Email To',         key: 'EMAIL_TO',             required: false },
    { label: 'Google Client ID', key: 'GOOGLE_CLIENT_ID',     required: false },
    { label: 'Base URL',         key: 'NEXT_PUBLIC_BASE_URL', required: false },
  ];

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System status and configuration for the Alchemist Suite</p>
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
          value={scheduleCount !== null ? `${scheduleCount} schedule(s) in Grimoire` : 'Loading…'}
          ok={scheduleCount !== null}
        />
        <StatusRow
          label="AI Model"
          value="gemini-2.5-flash"
          ok={true}
        />
      </Section>

      {/* Email Reminders */}
      <Section title="Email Reminders" emoji="📧">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Uses Gmail SMTP with an App Password.
          Go to <strong>Google Account → Security → 2-Step Verification → App Passwords</strong> to generate one,
          then set <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>EMAIL_PASS</code> in <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>.env.local</code>.
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
            { href: '/',               label: '💊 Wellness Dashboard' },
            { href: '/schedules',      label: '⚗️ Elixir Log' },
            { href: '/logs',           label: '🔔 Circus Crier' },
            { href: '/calendar',       label: '📅 Sky Calendar' },
            { href: '/fortune-teller', label: '✦ Fortune Teller' },
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
