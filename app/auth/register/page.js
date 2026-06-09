'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

/* Shared layout constants — must match login/page.js exactly */
const LEFT_W   = '340px';
const CARD_W   = '420px';
const FONT     = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const BG       = '#F8FAFF';
const BORDER   = '#E8EDFF';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const res  = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error || 'Registration failed.'); return; }
    const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.error) router.push('/auth/login');
    else { router.push('/dashboard'); router.refresh(); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT, overflow: 'hidden' }}>

      {/* ── Left branding panel ── */}
      <div style={{
        width: LEFT_W, flexShrink: 0,
        background: '#fff', borderRight: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', padding: '48px 36px', justifyContent: 'space-between',
        overflowY: 'auto',
      }}>
        <div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px', textDecoration: 'none' }}>
            <Logo size={40} />
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Pillora</span>
          </Link>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', lineHeight: 1.25, marginBottom: '12px' }}>
            Start tracking your medications today.
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7 }}>
            Create your account, add your medications, and let AI guide your adherence from day one.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[{ icon: '⚗️', label: 'Medication Tracking' }, { icon: '✦', label: 'AI Insights' }].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#F1F5FF', borderRadius: '8px', padding: '8px 12px',
              }}>
                <span style={{ fontSize: '14px' }}>{f.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>{f.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#CBD5E1' }}>© 1892 Mystical Circus Elixirs &amp; Co.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{
          width: '100%', maxWidth: CARD_W,
          background: '#fff', border: `1.5px solid ${BORDER}`,
          borderRadius: '18px', padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(37,99,235,0.08)',
        }}>
          {/* Header + tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Create Account</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Create your account</div>
            </div>
            <div style={{ display: 'flex', gap: '3px', background: '#F1F5FF', borderRadius: '8px', padding: '3px' }}>
              {[['signin','Sign In'],['signup','Sign Up']].map(([t, label]) => (
                <button key={t} onClick={() => { if (t === 'signin') router.push('/auth/login'); }} style={{
                  padding: '5px 13px', borderRadius: '6px', border: 'none',
                  background: t === 'signup' ? '#2563EB' : 'transparent',
                  color: t === 'signup' ? '#fff' : '#64748B',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'Your name',      icon: '✦' },
              { key: 'email',    label: 'Email',            type: 'email',    placeholder: 'you@example.com', icon: '@' },
              { key: 'password', label: 'Password',         type: 'password', placeholder: '8+ characters',  icon: '🔒' },
              { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: '••••••••',        icon: '🔒' },
            ].map(({ key, label, type, placeholder, icon }) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>{icon}</span>
                  <input type={type} required value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    minLength={key === 'password' || key === 'confirm' ? 8 : undefined}
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}

            {error && <ErrorBox>{error}</ErrorBox>}

            <button type="submit" disabled={loading} style={{ ...submitStyle(loading), marginTop: '8px' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const iconStyle  = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '10px 12px 10px 30px', border: '1.5px solid #E8EDFF', borderRadius: '8px', fontSize: '13px', color: '#0F172A', background: '#F8FAFF', outline: 'none' };
const submitStyle = (loading) => ({
  width: '100%', padding: '12px', borderRadius: '10px',
  background: loading ? '#93C5FD' : '#2563EB', border: 'none',
  color: '#fff', fontSize: '13px', fontWeight: '700',
  cursor: loading ? 'not-allowed' : 'pointer',
  boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.15s',
});

function ErrorBox({ children }) {
  return (
    <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px' }}>
      {children}
    </div>
  );
}
