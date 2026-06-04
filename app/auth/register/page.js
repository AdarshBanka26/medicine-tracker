'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
            Begin your alchemical journey today.
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, maxWidth: '320px' }}>
            Create your isolated workspace, add your elixirs, and let the Oracle guide your adherence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ icon: '⚗️', label: 'Elixir Tracking' }, { icon: '✦', label: 'AI Oracle' }].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5FF', borderRadius: '8px', padding: '8px 12px' }}>
              <span style={{ fontSize: '14px' }}>{f.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>{f.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '16px' }}>© 1892 Mystical Circus Elixirs & Co.</p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: '#fff', border: '1.5px solid #E8EDFF',
          borderRadius: '18px', padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(37,99,235,0.08)',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Alchemist Portal</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Create your account</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: '#F1F5FF', borderRadius: '8px', padding: '3px' }}>
                {[['signin','Sign In'],['signup','Sign Up']].map(([t, label]) => (
                  <button key={t} onClick={() => { if (t === 'signin') router.push('/auth/login'); }} style={{
                    padding: '5px 12px', borderRadius: '6px', border: 'none',
                    background: t === 'signup' ? '#2563EB' : 'transparent',
                    color: t === 'signup' ? '#fff' : '#64748B',
                    fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Master Alchemist', icon: '✦' },
              { key: 'email',    label: 'Manager Email',   type: 'email',    placeholder: 'alchemist@realm.com', icon: '@' },
              { key: 'password', label: 'Secret Sign',     type: 'password', placeholder: '8+ characters', icon: '🔒' },
              { key: 'confirm',  label: 'Confirm Sign',    type: 'password', placeholder: '••••••••', icon: '🔒' },
            ].map(({ key, label, type, placeholder, icon }) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' }}>{icon}</span>
                  <input type={type} required value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    minLength={key === 'password' || key === 'confirm' ? 8 : undefined}
                    style={{
                      width: '100%', padding: '9px 12px 9px 30px',
                      border: '1.5px solid #E8EDFF', borderRadius: '8px',
                      fontSize: '13px', color: '#0F172A', background: '#F8FAFF', outline: 'none',
                    }}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: '8px', padding: '12px', borderRadius: '10px',
              background: loading ? '#93C5FD' : '#2563EB', border: 'none',
              color: '#fff', fontSize: '13px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>
              {loading ? 'Creating account…' : 'Open the Alchemist Portal ⚡'}
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
                  fontSize: '14px', cursor: 'pointer', fontWeight: '700', color: '#475569',
                }}>{icon}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
