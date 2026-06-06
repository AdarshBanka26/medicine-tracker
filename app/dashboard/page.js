'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ── Simple bar chart using CSS ────────────────────────────────────────────── */
const BAR_COLORS = ['#BFDBFE','#93C5FD','#60A5FA','#3B82F6','#2563EB','#1D4ED8','#1E40AF'];

function AdherenceBarChart({ history }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
        {history.map((d, i) => {
          const pct = d.total > 0 ? (d.taken / d.total) : 0;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', height: `${Math.max(pct * 100, 4)}px`,
                background: BAR_COLORS[i % BAR_COLORS.length],
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
                minHeight: '4px',
              }} />
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px' }} />
    </div>
  );
}

/* ── Performer card ────────────────────────────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg,#1E3A8A,#2563EB)',
  'linear-gradient(135deg,#7C3AED,#A855F7)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
];

function PerformerCard({ log, index }) {
  return (
    <div style={{
      background: GRADIENTS[index % GRADIENTS.length],
      borderRadius: '14px', padding: '16px', color: '#fff',
      position: 'relative', overflow: 'hidden', minHeight: '120px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />
      <div>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{log.elixirName}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)' }}>{log.dosage}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px',
          background: log.status === 'taken' ? 'rgba(16,185,129,0.3)' : log.status === 'missed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
          color: '#fff',
        }}>
          {log.status === 'taken' ? 'Taken' : log.status === 'missed' ? 'Missed' : 'Pending'}
        </span>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
          {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

/* ── Crier alert row ───────────────────────────────────────────────────────── */
function CrierAlert({ log }) {
  const isMissed = log.status === 'missed';
  return (
    <div style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, paddingRight: '8px' }}>
          {log.elixirName} — {log.dosage}
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', flexShrink: 0,
          background: isMissed ? '#FEE2E2' : '#FEF3C7',
          color: isMissed ? '#991B1B' : '#92400E',
        }}>
          {isMissed ? 'Irregular' : 'Due Soon'}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {isMissed ? 'Missed dose — immediate attention required' : `Scheduled ${new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </div>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [logs, setLogs]       = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock]     = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [logsRes, histRes] = await Promise.all([
      fetch('/api/logs').then(r => r.ok ? r.json() : []),
      fetch('/api/logs/history?days=7').then(r => r.ok ? r.json() : []),
    ]);
    setLogs(Array.isArray(logsRes) ? logsRes : []);
    setHistory(Array.isArray(histRes) ? histRes : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    function tick() { setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const taken   = logs.filter(l => l.status === 'taken').length;
  const missed  = logs.filter(l => l.status === 'missed').length;
  const pending = logs.filter(l => l.status === 'pending').length;
  const total   = logs.length;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  const alertLogs    = logs.filter(l => l.status === 'missed' || l.status === 'pending').slice(0, 5);
  const ensembleLogs = logs.slice(0, 4);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading wellness data…</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '2px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Here's your medication overview for today.
          </p>
        </div>
        {clock && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '8px 16px', textAlign: 'right',
            boxShadow: '0 1px 4px rgba(37,99,235,0.06)',
          }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--blue)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {clock}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Local Time</div>
          </div>
        )}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '20px' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Wellness Adherence chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Wellness Adherence</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Performance-matched vitality score — 7 seasons
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--blue)' }}>{adherence}%</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>adherence</div>
              </div>
            </div>
            <AdherenceBarChart history={history} />
          </div>

          {/* The Celestial Ensemble */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>Today's Medications</div>
              <Link href="/schedules" style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none', fontWeight: '600' }}>
                View All →
              </Link>
            </div>
            {ensembleLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No doses scheduled yet.{' '}
                <Link href="/schedules/new" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: '600' }}>Add your first medication →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '12px' }}>
                {ensembleLogs.map((log, i) => <PerformerCard key={log._id} log={log} index={i} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Crier Alerts */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Alerts</div>
            {missed > 0 && (
              <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#991B1B', borderRadius: '20px', padding: '2px 8px', fontWeight: '700' }}>
                {missed} Irregular
              </span>
            )}
          </div>

          {alertLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
              ✅ All doses accounted for
            </div>
          ) : (
            alertLogs.map(log => <CrierAlert key={log._id} log={log} />)
          )}

          <Link href="/logs" style={{
            display: 'block', marginTop: '8px', padding: '9px',
            background: 'var(--bg-app)', border: '1px solid var(--border)',
            borderRadius: '8px', textAlign: 'center',
            fontSize: '12px', color: 'var(--blue)', fontWeight: '600', textDecoration: 'none',
          }}>
            View All Performers →
          </Link>

          {/* Quick stats */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Total', val: total,   color: 'var(--text-primary)' },
              { label: 'Taken', val: taken,   color: '#10B981' },
              { label: 'Missed', val: missed, color: '#EF4444' },
              { label: 'Pending', val: pending, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-app)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Master of Potions CTA */}
      <div style={{
        background: 'linear-gradient(135deg,#1E3A8A,#2563EB 60%,#7C3AED)',
        borderRadius: '16px', padding: '28px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>✦</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Stay on Track</div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', lineHeight: 1.6 }}>
            Add your medications and let AI-powered insights help you maintain perfect adherence every day.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/schedules/new" style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
          }}>New Medication</Link>
          <Link href="/fortune-teller" style={{
            padding: '10px 20px', borderRadius: '10px',
            background: '#fff', color: '#2563EB',
            fontSize: '13px', fontWeight: '700', textDecoration: 'none',
          }}>Ask AI</Link>
        </div>
      </div>
    </div>
  );
}
