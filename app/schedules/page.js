'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FREQ_LABEL = {
  daily: 'Daily', 'twice-daily': 'Twice Daily', 'thrice-daily': 'Thrice Daily',
  weekly: 'Weekly', 'as-needed': 'As Needed',
};

const ELIXIR_COLORS = ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FCE7F3', '#FEE2E2'];
const ELIXIR_TEXT   = ['#1D4ED8', '#065F46', '#92400E', '#5B21B6', '#9D174D', '#991B1B'];

function ElixirIcon({ index }) {
  const bg   = ELIXIR_COLORS[index % ELIXIR_COLORS.length];
  const text = ELIXIR_TEXT[index % ELIXIR_TEXT.length];
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', flexShrink: 0, color: text, fontWeight: '700',
    }}>⚗</div>
  );
}

function StatusBadge({ isActive }) {
  return isActive
    ? <span className="badge badge-green">ACTIVE</span>
    : <span className="badge badge-gray">INACTIVE</span>;
}

export default function ElixirLogPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [prediction, setPrediction] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    fetch('/api/schedules')
      .then(r => r.json())
      .then(d => { setSchedules(Array.isArray(d) ? d : []); setLoading(false); });
    fetch('/api/predict')
      .then(r => r.ok ? r.json() : null)
      .then(setPrediction)
      .catch(() => {});
  }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Remove "${name}" from the Grimoire?`)) return;
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s._id !== id));
  }

  const filtered = schedules.filter(s => {
    if (filterStatus === 'active')   return s.isActive;
    if (filterStatus === 'inactive') return !s.isActive;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount   = schedules.filter(s => s.isActive).length;
  const activePct     = schedules.length > 0 ? Math.round((activeCount / schedules.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px' }}>Grand Elixir Log</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Precision monitoring for metabolic enhancement and alchemical synchronization.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline" style={{ fontSize: '12px' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Archive
          </button>
          <button className="btn-outline" style={{ fontSize: '12px' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View History
          </button>
          <Link href="/schedules/new" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
            + New Entry
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-card-value">{schedules.length.toLocaleString()}</div>
          <div className="stat-card-label">Total Elixirs</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>All time entries</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <div className="stat-card-value" style={{ color: '#10B981' }}>{activePct}%</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Active Pathway</div>
          </div>
          <div className="stat-card-label">Adherence Rate</div>
          <div style={{ marginTop: '8px', height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#10B981', borderRadius: '2px', width: `${activePct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="stat-card-value" style={{ fontSize: '20px' }}>
              {activeCount > 0 ? '●' : '○'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: activeCount > 0 ? '#10B981' : 'var(--text-muted)' }}>
                {activeCount > 0 ? 'Optimal' : 'No Data'}
              </div>
              <div className="stat-card-label" style={{ margin: 0 }}>Sync Walks</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{activeCount} active elixirs tracked</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filter:</span>
        {['all', 'active', 'inactive'].map(f => (
          <button key={f} onClick={() => { setFilterStatus(f); setPage(1); }} style={{
            padding: '5px 14px',
            borderRadius: '20px',
            border: '1px solid',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            background: filterStatus === f ? '#EFF6FF' : '#fff',
            borderColor: filterStatus === f ? 'var(--blue)' : 'var(--border)',
            color: filterStatus === f ? 'var(--blue)' : 'var(--text-secondary)',
          }}>
            {f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0, marginBottom: '20px', marginTop: '12px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Active Prescriptions
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}>
              ≡ Filter
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '2px 4px', borderRadius: '4px' }}>
              ⋯
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading elixir log…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No elixirs recorded yet.</p>
            <Link href="/schedules/new" className="btn-primary" style={{ textDecoration: 'none' }}>+ New Entry</Link>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ELIXIR NAME</th>
                  <th>PERFORMER</th>
                  <th>DOSAGE</th>
                  <th>FREQUENCY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s, idx) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ElixirIcon index={idx} />
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{s.elixirName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {s.times?.length > 0 ? s.times.join(', ') : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Grand Alchemist</td>
                    <td style={{ color: 'var(--blue)', fontWeight: '600' }}>{s.dosage}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{FREQ_LABEL[s.frequency] || s.frequency}</td>
                    <td><StatusBadge isActive={s.isActive} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => router.push(`/schedules/${s._id}/edit`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: '11px', fontWeight: '600', padding: '2px 4px' }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(s._id, s.elixirName)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '11px', fontWeight: '600', padding: '2px 4px' }}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '12px' }}
                >‹</button>
                <span style={{ padding: '4px 10px', background: 'var(--blue)', color: '#fff', borderRadius: '6px', fontSize: '12px' }}>{page}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '12px' }}
                >›</button>
              </div>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div style={{
                padding: '10px',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px', color: 'var(--blue)', fontWeight: '600' }}
                >
                  View {Math.max(0, filtered.length - page * PAGE_SIZE)} More Elixirs →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom row: AI Insight + Compliance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '16px' }}>
        {/* Mystic Insight */}
        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg,#1E3A8A,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>🔮</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: '700' }}>✦ Mystic Insight</span>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>AI</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              {prediction?.nudgeMessage || 'The oracle is gathering patterns from your adherence history. Keep logging elixirs to unlock personalized insights.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/fortune-teller" className="btn-primary" style={{ textDecoration: 'none', fontSize: '12px' }}>
                Apply Recommendation
              </Link>
              <Link href="/fortune-teller" style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Read Detailed Analysis →
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Compliance */}
        <div style={{
          background: 'var(--blue-navy)',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#93C5FD', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Today's Compliance
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
            {schedules.length === 0 ? '—' : `${activePct}%`}
          </div>
          <div style={{ marginTop: '12px', width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#60A5FA', borderRadius: '2px', width: `${activePct}%` }} />
          </div>
          <div style={{ fontSize: '11px', color: '#93C5FD', marginTop: '6px' }}>
            {activeCount} active elixirs
          </div>
          <Link href="/schedules/new" style={{
            marginTop: '14px', padding: '8px 16px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.15s',
          }}>
            Adjust Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
