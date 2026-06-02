'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Registration failed.');
      return;
    }

    // Auto sign-in after successful registration
    const signInRes = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push('/auth/login');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div style={{
      width: '100%', maxWidth: '420px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '36px 32px',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', margin: '0 auto 12px',
        }}>⚗️</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Alchemist Suite</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Create your account</div>
      </div>

      <form onSubmit={handleSubmit}>
        {[
          { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Master Alchemist' },
          { key: 'email',    label: 'Email',            type: 'email',    placeholder: 'you@example.com' },
          { key: 'password', label: 'Password',         type: 'password', placeholder: '8+ characters' },
          { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {label}
            </label>
            <input
              type={type}
              required
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              minLength={key === 'password' || key === 'confirm' ? 8 : undefined}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '14px', outline: 'none',
              }}
            />
          </div>
        ))}

        {error && (
          <div style={{
            marginTop: '4px', padding: '10px 14px', borderRadius: '8px',
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
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: '#93C5FD', fontWeight: '600', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
