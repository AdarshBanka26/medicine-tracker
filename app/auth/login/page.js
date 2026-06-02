'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password.');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div style={{
      width: '100%', maxWidth: '400px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '36px 32px',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', margin: '0 auto 12px',
        }}>⚗️</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Alchemist Suite</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Sign in to your account</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Password
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        {error && (
          <div style={{
            marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#FCA5A5', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', marginTop: '20px', padding: '11px',
            background: loading ? 'rgba(37,99,235,0.5)' : '#2563EB',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
        No account?{' '}
        <Link href="/auth/register" style={{ color: '#93C5FD', fontWeight: '600', textDecoration: 'none' }}>
          Create one
        </Link>
      </p>
    </div>
  );
}
