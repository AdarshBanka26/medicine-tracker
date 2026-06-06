'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

/* Shared layout constants — must match register/page.js exactly */
const LEFT_W   = '340px';
const CARD_W   = '420px';
const FONT     = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const BG       = '#F8FAFF';
const BORDER   = '#E8EDFF';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid email or password.');
    else { router.push(callbackUrl); router.refresh(); }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>⚗️</div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Alchemist Suite</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', lineHeight: 1.25, marginBottom: '12px' }}>
            Your professional gateway to the arcane arts of health and productivity.
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7 }}>
            Track medications, consult the AI Oracle, and maintain perfect adherence — all in one mystical command centre.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[{ icon: '⚗️', label: 'Elixir Tracking' }, { icon: '✦', label: 'AI Oracle Insights' }].map(f => (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Alchemist Portal</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Welcome back, Master Alchemist</div>
            </div>
            <div style={{ display: 'flex', gap: '3px', background: '#F1F5FF', borderRadius: '8px', padding: '3px' }}>
              {[['signin','Sign In'],['signup','Sign Up']].map(([t, label]) => (
                <button key={t} onClick={() => { if (t === 'signup') router.push('/auth/register'); }} style={{
                  padding: '5px 13px', borderRadius: '6px', border: 'none',
                  background: t === 'signin' ? '#2563EB' : 'transparent',
                  color: t === 'signin' ? '#fff' : '#64748B',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Manager Email</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>@</span>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="alchemist@realm.com" style={inputStyle} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Secret Sign</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>🔒</span>
                <input type="password" required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }} />

            {error && <ErrorBox>{error}</ErrorBox>}

            <button type="submit" disabled={loading} style={submitStyle(loading)}>
              {loading ? 'Opening Portal…' : 'Open the Alchemist Portal ⚡'}
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
    <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px' }}>
      {children}
    </div>
  );
}

