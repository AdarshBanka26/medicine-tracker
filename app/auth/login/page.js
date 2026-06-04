'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [tab, setTab]         = useState('signin');
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
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F8FAFF',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Left branding panel */}
      <div style={{
        width: '42%', minWidth: '320px',
        background: '#fff', borderRight: '1px solid #E8EDFF',
        display: 'flex', flexDirection: 'column',
        padding: '48px 40px', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>⚗️</div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Alchemist Suite</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', lineHeight: 1.2, marginBottom: '12px' }}>
            Your professional gateway to the arcane arts of health and productivity.
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, maxWidth: '320px' }}>
            Track medications, consult the AI Oracle, and maintain perfect adherence — all in one mystical command centre.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { icon: '⚗️', label: 'Elixir Tracking' },
            { icon: '✦',  label: 'AI Oracle Insights' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#F1F5FF', borderRadius: '8px', padding: '8px 12px',
            }}>
              <span style={{ fontSize: '14px' }}>{f.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>{f.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '16px' }}>
          © 1892 Mystical Circus Elixirs & Co.
        </p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: '#fff', border: '1.5px solid #E8EDFF',
          borderRadius: '18px', padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(37,99,235,0.08)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Alchemist Portal</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Welcome back, Master Alchemist</div>
              </div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: '#F1F5FF', borderRadius: '8px', padding: '3px' }}>
                {[['signin','Sign In'],['signup','Sign Up']].map(([t, label]) => (
                  <button key={t} onClick={() => { if (t === 'signup') router.push('/auth/register'); else setTab(t); }} style={{
                    padding: '5px 12px', borderRadius: '6px', border: 'none',
                    background: tab === t ? '#2563EB' : 'transparent',
                    color: tab === t ? '#fff' : '#64748B',
                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Manager Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px' }}>@</span>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="alchemist@realm.com"
                  style={{
                    width: '100%', padding: '10px 12px 10px 30px',
                    border: '1.5px solid #E8EDFF', borderRadius: '8px',
                    fontSize: '13px', color: '#0F172A', background: '#F8FAFF', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secret Sign
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </span>
                <input type="password" required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 12px 10px 34px',
                    border: '1.5px solid #E8EDFF', borderRadius: '8px',
                    fontSize: '13px', color: '#0F172A', background: '#F8FAFF', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#2563EB' }} />
                Remember my essence
              </label>
              <a href="#" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>Forgot Pass?</a>
            </div>

            {error && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: loading ? '#93C5FD' : '#2563EB', border: 'none',
              color: '#fff', fontSize: '13px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              transition: 'all 0.15s',
            }}>
              {loading ? 'Opening Portal…' : 'Open the Alchemist Portal ⚡'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E8EDFF' }} />
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>CONNECT ASTRAL EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: '#E8EDFF' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {['G', 'M', '⚡'].map((icon, i) => (
                <button key={i} style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  border: '1.5px solid #E8EDFF', background: '#F8FAFF',
                  fontSize: '14px', cursor: 'pointer', fontWeight: '700',
                  color: '#475569',
                }}>{icon}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
