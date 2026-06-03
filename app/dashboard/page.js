'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ── Circular gauge ────────────────────────────────────────────────────────── */
function CircularGauge({ pct = 0, color = '#2563EB', label, sub }) {
  const r = 44, sw = 9;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{pct}%</text>
        <text x="55" y="66" textAnchor="middle" fontSize="10" fill="#6B7280">{sub}</text>
      </svg>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function WiBar({ pct }) {
  const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="wi-bar">
      <div className="wi-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function FortuneTellerBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '14px', flexShrink: 0,
        }}>✦</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700' }}>Mystic Fortune Teller</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ask the Oracle about risks, patterns, or elixir compositions.</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          className="field-input"
          placeholder="Seek wisdom from the oracle..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && query.trim()) router.push('/fortune-teller'); }}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" style={{ padding: '9px 16px', flexShrink: 0, fontSize: '12px' }}
          onClick={() => router.push('/fortune-teller')}>
          Query Oracle ▶
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [logs, setLogs]       = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday]     = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [logsRes, histRes] = await Promise.all([
      fetch('/api/logs').then(r => r.ok ? r.json() : []),
      fetch('/api/logs/history?days=7').then(r => r.ok ? r.json() : []),
    ]);
    setLogs(logsRes);
    setHistory(histRes);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const taken   = logs.filter(l => l.status === 'taken').length;
  const missed  = logs.filter(l => l.status === 'missed').length;
  const pending = logs.filter(l => l.status === 'pending').length;
  const total   = logs.length;
  const wellnessPct = total > 0 ? Math.round((taken / total) * 100) : 0;

  const histTotals = history.reduce((a, d) => ({ t: a.t + d.taken, tot: a.tot + d.total }), { t: 0, tot: 0 });
  const weekAvg    = histTotals.tot > 0 ? Math.round((histTotals.t / histTotals.tot) * 100) : 0;

  const upcoming = [...logs]
    .filter(l => l.status === 'pending')
    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    .slice(0, 4);

  const highRisk = logs.filter(l => l.status === 'missed').slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading wellness data…</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Wellness Altar</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Real-time daily metrics for the troupe{today ? ` — ${today}` : ''}
        </p>
      </div>

      {/* Row 1: Vitality + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Troupe Vitality</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}>⋯</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
            <CircularGauge pct={wellnessPct} color="#2563EB" label="Today's Rate"  sub="today" />
            <CircularGauge pct={weekAvg}     color="#F59E0B" label="7-Day Average" sub="week"  />
            <CircularGauge
              pct={total > 0 ? Math.round(((total - pending) / total) * 100) : 0}
              color="#10B981" label="Completed" sub="doses"
            />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Upcoming Rituals</span>
            <Link href="/schedules" style={{ color: 'var(--text-muted)', display: 'flex' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>All doses accounted for</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcoming.map(log => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>⚗️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.elixirName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {log.dosage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {upcoming.length > 0 && (
            <Link href="/calendar" style={{
              display: 'block', marginTop: '14px', padding: '8px',
              background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px',
              textAlign: 'center', fontSize: '12px', color: '#0284C7', fontWeight: '600', textDecoration: 'none',
            }}>
              View Altar Schedule →
            </Link>
          )}
        </div>
      </div>

      {/* Row 2: Performer Pulse */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Performer Pulse</span>
            {missed > 0 && <span className="badge badge-red">⚠ ADVERSE ALERT</span>}
          </div>
          <Link href="/schedules" style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none' }}>View All Registry →</Link>
        </div>
        {highRisk.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No missed doses today — excellent adherence!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>ELIXIR</th><th>ROLE</th><th>CURRENT PACE</th><th>RISK LEVEL</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {highRisk.map(log => (
                <tr key={log._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚗️</div>
                      <span style={{ fontWeight: '500' }}>{log.elixirName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Lead The Steather</td>
                  <td><WiBar pct={0} /></td>
                  <td><span className="badge badge-red">CRITICAL</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href="/logs"          style={{ fontSize: '11px', color: '#EF4444', textDecoration: 'none', fontWeight: '600' }}>Heal Race</Link>
                      <Link href="/fortune-teller" style={{ fontSize: '11px', color: 'var(--blue)', textDecoration: 'none', fontWeight: '600' }}>Consult Mystic</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Row 3: Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { label: 'Total Scheduled', val: total,   icon: '📋', color: '#2563EB' },
          { label: 'Administered',    val: taken,   icon: '✅', color: '#10B981' },
          { label: 'Missed',          val: missed,  icon: '❌', color: '#EF4444' },
          { label: 'Pending',         val: pending, icon: '⏳', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <FortuneTellerBar />
    </div>
  );
}
