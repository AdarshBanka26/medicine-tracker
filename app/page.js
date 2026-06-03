import Link from 'next/link';

const features = [
  {
    icon: '⚗️',
    title: 'Elixir Log',
    desc: 'Track every medication with dosage, frequency, and schedules. Add, edit, and manage your full prescription history.',
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    desc: 'Never miss a dose. Browser notifications and email alerts keep every performer on schedule around the clock.',
  },
  {
    icon: '📅',
    title: 'Sky Calendar',
    desc: 'Visualise your full dosing calendar by day, week, or month. Sync with Google Calendar for seamless planning.',
  },
  {
    icon: '✦',
    title: 'Oracle AI Assistant',
    desc: 'Ask the Gemini-powered Oracle about adherence patterns, missed dose risks, and personalised health insights.',
  },
  {
    icon: '📊',
    title: 'Wellness Analytics',
    desc: 'Live adherence gauges, 7-day trend charts, and risk-level alerts give you an instant snapshot of your health.',
  },
  {
    icon: '👥',
    title: 'Multi-User',
    desc: 'Each account has a fully isolated workspace. Families, clinics, or teams — everyone sees only their own data.',
  },
];

const steps = [
  { n: '01', title: 'Create Your Account', desc: 'Sign up in seconds with your name and email. No credit card required.' },
  { n: '02', title: 'Add Your Elixirs',    desc: 'Enter each medication — name, dosage, frequency, and daily times.' },
  { n: '03', title: 'Stay On Track',       desc: 'Receive reminders, log doses, and let the Oracle surface patterns you might miss.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>⚗️</div>
          <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em' }}>Alchemist Suite</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/auth/login" style={{
            padding: '8px 18px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500',
            textDecoration: 'none', transition: 'all 0.15s',
          }}>
            Sign In
          </Link>
          <Link href="/auth/register" style={{
            padding: '8px 18px', borderRadius: '8px',
            background: '#2563EB', border: '1px solid #2563EB',
            color: '#fff', fontSize: '13px', fontWeight: '600',
            textDecoration: 'none',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '100px 5% 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.25), transparent)',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.35)',
          borderRadius: '20px', padding: '5px 14px', marginBottom: '28px',
          fontSize: '12px', color: '#93C5FD', fontWeight: '600', letterSpacing: '0.04em',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
          NOW WITH AI-POWERED ADHERENCE INSIGHTS
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px',
        }}>
          Your Personal
          <span style={{
            display: 'block',
            background: 'linear-gradient(90deg, #60A5FA, #A78BFA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Medicine Tracker
          </span>
        </h1>

        <p style={{
          fontSize: '17px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
          maxWidth: '560px', margin: '0 auto 40px',
        }}>
          The Alchemist Suite brings together schedules, reminders, analytics, and an AI Oracle into one mystical command centre — so you never miss a dose again.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '10px',
            background: '#2563EB', color: '#fff',
            fontSize: '14px', fontWeight: '700', textDecoration: 'none',
            boxShadow: '0 0 24px rgba(37,99,235,0.4)',
            transition: 'all 0.15s',
          }}>
            Start for Free →
          </Link>
          <Link href="/auth/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
          }}>
            Sign In to Dashboard
          </Link>
        </div>

        {/* Hero stats */}
        <div style={{
          display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '64px',
          flexWrap: 'wrap',
        }}>
          {[
            { val: '100%', label: 'Data Isolation' },
            { val: 'AI',   label: 'Oracle Insights' },
            { val: '∞',    label: 'Elixirs Tracked' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#60A5FA', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', color: '#818CF8', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            FEATURES
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '14px' }}>
            Everything you need, nothing you don't
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Six powerful modules working in harmony to keep your health rituals on track.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px', maxWidth: '1100px', margin: '0 auto',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '24px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '16px',
              }}>{f.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 5%',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(37,99,235,0.04)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', color: '#818CF8', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Up and running in minutes
          </h2>
        </div>

        <div style={{
          display: 'flex', gap: '20px', maxWidth: '900px', margin: '0 auto',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              flex: '1 1 240px', maxWidth: '280px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '28px 24px',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '11px', fontWeight: '800', color: '#3B82F6',
                letterSpacing: '0.06em', marginBottom: '14px',
              }}>{s.n}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{s.title}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{s.desc}</div>
              {i < steps.length - 1 && (
                <div style={{
                  display: 'none', // hidden on mobile, could show on desktop
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 5%',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(37,99,235,0.2), transparent)',
      }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Ready to take control of your health?
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.7 }}>
          Join the Alchemist Suite and transform your medication routine into a seamless ritual.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register" style={{
            padding: '13px 32px', borderRadius: '10px',
            background: '#2563EB', color: '#fff',
            fontSize: '14px', fontWeight: '700', textDecoration: 'none',
            boxShadow: '0 0 24px rgba(37,99,235,0.4)',
          }}>
            Create Free Account
          </Link>
          <Link href="/auth/login" style={{
            padding: '13px 28px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
          }}>
            I already have an account
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚗️</span>
          <span>Alchemist Suite &copy; 2024. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Support'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
