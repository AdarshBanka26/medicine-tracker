import Link from 'next/link';
import Logo from '@/components/Logo';

const features = [
  { icon: '⚗️', title: 'Medication Log',  desc: 'Track every medication with dosage, frequency, and full schedule history.' },
  { icon: '🔔', title: 'Smart Reminders', desc: 'Browser notifications and email alerts so you never miss a dose.' },
  { icon: '📅', title: 'Calendar',        desc: 'Visualise your full dosing schedule and sync with Google Calendar.' },
  { icon: '✦',  title: 'AI Assistant',    desc: 'Gemini-powered insights surface adherence patterns and personalised nudges.' },
  { icon: '📊', title: 'Analytics',       desc: 'Live gauges, 7-day trends, and risk-level alerts at a glance.' },
  { icon: '👥', title: 'Multi-User',      desc: 'Fully isolated workspaces — each account sees only their own data.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', color: '#0F172A', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,250,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E8EDFF',
        padding: '0 6%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size={32} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Alchemist Suite</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/auth/login" style={{
            padding: '7px 16px', borderRadius: '8px', border: '1.5px solid #E8EDFF',
            color: '#475569', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
            background: '#fff',
          }}>Sign In</Link>
          <Link href="/auth/register" style={{
            padding: '7px 16px', borderRadius: '8px',
            background: '#2563EB', color: '#fff',
            fontSize: '13px', fontWeight: '600', textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
          }}>Get Started →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 6% 60px', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: '20px', padding: '5px 14px', marginBottom: '24px',
          fontSize: '11px', color: '#2563EB', fontWeight: '700', letterSpacing: '0.05em',
        }}>
          ✦ NOW WITH GEMINI AI ORACLE INSIGHTS
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 66px)', fontWeight: '800',
          lineHeight: 1.08, letterSpacing: '-0.03em',
          color: '#0F172A', marginBottom: '20px',
        }}>
          Master the Elixirs<br />
          <span style={{ background: 'linear-gradient(90deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            of the Arena.
          </span>
        </h1>

        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 36px' }}>
          The Alchemist Suite combines schedules, smart reminders, AI-powered analytics, and a multi-user vault — so your health rituals never slip.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <Link href="/auth/register" style={{
            padding: '12px 28px', borderRadius: '10px', background: '#2563EB', color: '#fff',
            fontSize: '14px', fontWeight: '700', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          }}>Create Free Account →</Link>
          <Link href="/auth/login" style={{
            padding: '12px 24px', borderRadius: '10px',
            border: '1.5px solid #E8EDFF', background: '#fff',
            color: '#475569', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
          }}>Sign In ⚡</Link>
        </div>

        {/* App mockup */}
        <div style={{
          background: '#fff', border: '1.5px solid #E8EDFF', borderRadius: '16px',
          padding: '20px', boxShadow: '0 8px 40px rgba(37,99,235,0.1)',
          maxWidth: '800px', margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            {['#EF4444','#F59E0B','#10B981'].map(c => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{ flex: 1, height: '20px', background: '#F1F5F9', borderRadius: '6px', marginLeft: '8px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', height: '200px' }}>
            <div style={{ background: '#F8FAFF', borderRadius: '10px', padding: '12px' }}>
              <div style={{ height: '8px', background: '#DBEAFE', borderRadius: '4px', marginBottom: '8px' }} />
              {['#2563EB','#E2E8F0','#E2E8F0','#E2E8F0','#E2E8F0'].map((bg,i) => (
                <div key={i} style={{ height: '28px', background: bg, borderRadius: '6px', marginBottom: '4px', opacity: i === 0 ? 1 : 0.6 }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ height: '10px', background: '#DBEAFE', borderRadius: '4px', width: '40%' }} />
              <div style={{ flex: 1, display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                {[55,70,45,80,65,90,72,60].map((h,i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? '#2563EB' : '#DBEAFE', borderRadius: '4px 4px 0 0' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '70px 6%', background: '#fff', borderTop: '1px solid #E8EDFF', borderBottom: '1px solid #E8EDFF' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '1100px', margin: '0 auto 48px' }}>
          <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>ARCANE CAPABILITIES</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: '800', letterSpacing: '-0.02em', color: '#0F172A' }}>
            Everything you need to manage your medications<br />
            <span style={{ color: '#2563EB' }}>and stay on schedule</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: '#F8FAFF', border: '1.5px solid #E8EDFF', borderRadius: '14px', padding: '22px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)',
                border: '1px solid #DBEAFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '14px',
              }}>{f.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#0F172A' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        padding: '70px 6%', textAlign: 'center',
        background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 50%,#7C3AED 100%)',
        color: '#fff',
      }}>
        <div style={{ fontSize: '22px', marginBottom: '12px' }}>✦</div>
        <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Step into the Arena
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.7 }}>
          Create your account and start tracking your medications in minutes. AI-powered insights help you build lasting adherence habits.
        </p>
        <Link href="/auth/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '12px 28px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
          color: '#fff', fontSize: '14px', fontWeight: '700', textDecoration: 'none',
          backdropFilter: 'blur(4px)',
        }}>
          Create Account →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #E8EDFF', padding: '20px 6%', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚗️</span>
          <span>© 1892 Mystical Circus & Co.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/auth/login" style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          <span style={{ color: '#E8EDFF' }}>|</span>
          <Link href="/auth/register" style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
