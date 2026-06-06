'use client';
import { useState, useEffect, useCallback } from 'react';

/* ── Countdown timer ───────────────────────────────────────────────────────── */
function Countdown({ scheduledTime, status }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function update() {
      if (!scheduledTime) { setLabel(''); return; }
      const diff = new Date(scheduledTime).getTime() - Date.now();
      if (status === 'missed') {
        const ago = Math.abs(Math.round(diff / 60000));
        setLabel(ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`);
      } else {
        if (diff <= 0) { setLabel('Expiring now'); return; }
        const mins = Math.round(diff / 60000);
        setLabel(mins < 60 ? `Expiring in ${mins}m` : `Expiring in ${Math.round(mins / 60)}h`);
      }
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [scheduledTime, status]);

  return label ? (
    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</span>
  ) : null;
}

/* ── Urgency config ────────────────────────────────────────────────────────── */
function getUrgency(log) {
  if (log.status === 'missed') return { level: 'CRITICAL', cls: 'urgency-critical', cardCls: 'alert-critical', color: '#EF4444' };
  const diff = log.scheduledTime ? (new Date(log.scheduledTime).getTime() - Date.now()) / 60000 : 999;
  if (diff < 15) return { level: 'MODERATE', cls: 'urgency-moderate', cardCls: 'alert-warning', color: '#F59E0B' };
  return { level: 'LOW', cls: 'urgency-low', cardCls: 'alert-low', color: '#10B981' };
}

/* ── AlertCard ─────────────────────────────────────────────────────────────── */
function AlertCard({ log, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const urgency = getUrgency(log);

  async function updateStatus(status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onStatusChange(await res.json());
    } catch (err) {
      console.error('updateStatus error:', err);
    } finally {
      setLoading(false);
    }
  }

  const scheduledDate = log.scheduledTime ? new Date(log.scheduledTime) : null;
  const time = scheduledDate ? scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className={`alert-card ${urgency.cardCls}`} style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge" style={{ fontSize: '10px', ...urgencyBadgeStyle(urgency) }}>
            URGENCY: {urgency.level}
          </span>
          <Countdown scheduledTime={log.scheduledTime} status={log.status} />
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: urgency.color, flexShrink: 0, marginTop: '4px' }} />
      </div>
      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>
        {log.elixirName}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
        {log.status === 'missed'
          ? `Dose of ${log.dosage} was scheduled for ${time}. Immediate scheduling chart required.`
          : `${log.dosage} scheduled for ${time}. Please take when ready.`}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
          onClick={() => updateStatus('taken')}
          disabled={loading}
        >
          {log.status === 'missed' ? 'Acknowledge' : 'Mark Taken'}
        </button>
        {log.status !== 'missed' && (
          <button
            className="btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => updateStatus('missed')}
            disabled={loading}
          >
            Review
          </button>
        )}
        <button
          className="btn-outline"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          onClick={() => updateStatus(log.status === 'pending' ? 'missed' : 'pending')}
          disabled={loading}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function urgencyBadgeStyle(urgency) {
  return {
    background: urgency.level === 'CRITICAL' ? '#FEE2E2' : urgency.level === 'MODERATE' ? '#FEF3C7' : '#D1FAE5',
    color: urgency.level === 'CRITICAL' ? '#991B1B' : urgency.level === 'MODERATE' ? '#92400E' : '#065F46',
    border: `1px solid ${urgency.level === 'CRITICAL' ? '#FECACA' : urgency.level === 'MODERATE' ? '#FDE68A' : '#A7F3D0'}`,
    borderRadius: '20px', padding: '2px 8px', fontWeight: '700', letterSpacing: '0.04em',
  };
}

/* ── NudgeCard ─────────────────────────────────────────────────────────────── */
function NudgeCard({ log, onAction }) {
  const [busy, setBusy] = useState(false);
  const scheduledDate = log.scheduledTime ? new Date(log.scheduledTime) : null;
  const time = scheduledDate ? scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  async function act(status) {
    setBusy(true);
    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onAction(await res.json());
    } catch (err) {
      console.error('NudgeCard action error:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      background: '#F8FAFF', border: '1px solid #DBEAFE',
      borderRadius: '8px', padding: '12px',
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: '#fff', fontSize: '11px', fontWeight: '700',
        }}>✦</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {log.elixirName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.dosage} · {time}</div>
        </div>
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#92400E', marginBottom: '4px' }}>
        Optimal Dosing
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
        {log.status === 'missed'
          ? 'This medication was missed. Take it now if appropriate, or mark as skipped.'
          : `Due at ${time}. Prepare your dose for optimal absorption.`}
      </p>
      <button
        className="btn-primary"
        style={{ fontSize: '11px', padding: '5px 14px', width: '100%', justifyContent: 'center' }}
        onClick={() => act('taken')}
        disabled={busy}
      >
        Apply Schedule
      </button>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function RemindersPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [sending, setSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  const fetchLogs = useCallback(async (date) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`/api/logs?date=${date}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(selectedDate); }, [selectedDate, fetchLogs]);

  function handleStatusChange(updated) {
    setLogs(prev => prev.map(l => l._id === updated._id ? updated : l));
  }

  async function sendEmailAlert() {
    setSending(true);
    setEmailMsg('');
    try {
      const res = await fetch('/api/reminders/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pending-now' }),
      });
      const data = await res.json();
      setEmailMsg(res.ok
        ? `✅ ${data.message || `Email sent to ${data.to}`}`
        : `❌ ${data.error || 'Failed to send'}`);
    } catch (err) {
      setEmailMsg(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  const alertLogs = logs.filter(l => l.status === 'missed' || l.status === 'pending');
  const archive   = logs.filter(l => l.status === 'taken');
  const isToday   = selectedDate === today;
  const criticalCount = logs.filter(l => l.status === 'missed').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Reminders</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage your dose alerts and notification preferences.
        </p>
      </div>

      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <ToggleItem label="Browser Notifications" sub="Real-time dose alerts" on />
        <ToggleItem label="Push Notifications" sub="External push alerts" on={false} />
      </div>

      {/* Controls bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            className="field-input"
            style={{ width: 'auto' }}
          />
          {!isToday && (
            <button className="btn-outline" style={{ fontSize: '12px' }} onClick={() => setSelectedDate(today)}>
              Today
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {criticalCount > 0 && (
            <span className="badge badge-red">{criticalCount} CRITICAL</span>
          )}
          {alertLogs.length > 0 && (
            <span className="badge badge-orange">{alertLogs.length} ALERT{alertLogs.length !== 1 ? 'S' : ''}</span>
          )}
          <button className="btn-outline" style={{ fontSize: '12px' }} onClick={sendEmailAlert} disabled={sending}>
            {sending ? 'Sending…' : '📧 Email Alert'}
          </button>
        </div>
      </div>

      {emailMsg && (
        <div style={{
          fontSize: '12px', marginBottom: '12px', padding: '8px 12px', borderRadius: '8px',
          background: emailMsg.startsWith('✅') ? '#D1FAE5' : '#FEE2E2',
          color: emailMsg.startsWith('✅') ? '#065F46' : '#991B1B',
          border: `1px solid ${emailMsg.startsWith('✅') ? '#A7F3D0' : '#FECACA'}`,
        }}>
          {emailMsg}
        </div>
      )}

      {fetchError && (
        <div style={{
          fontSize: '12px', marginBottom: '12px', padding: '8px 12px', borderRadius: '8px',
          background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
        }}>
          Could not load logs: {fetchError}
        </div>
      )}

      {/* Two-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: '20px' }}>
        {/* Left: Active Alerts + Archive */}
        <div style={{ minWidth: 0 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Active Alerts</span>
              {alertLogs.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  ({alertLogs.length})
                </span>
              )}
              {criticalCount > 0 && (
                <span className="badge badge-red" style={{ fontSize: '10px' }}>⚠ {criticalCount} CRITICAL</span>
              )}
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading alerts…</p>
            ) : alertLogs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {isToday ? 'No active alerts — all medications accounted for.' : 'No alerts for this date.'}
                </p>
              </div>
            ) : (
              alertLogs
                .sort((a, b) => {
                  const order = { missed: 0, pending: 1 };
                  return (order[a.status] ?? 2) - (order[b.status] ?? 2);
                })
                .map(log => (
                  <AlertCard key={log._id} log={log} onStatusChange={handleStatusChange} />
                ))
            )}
          </div>

          {/* Archive */}
          {archive.length > 0 && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Recent Incidents
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>MEDICATION</th>
                      <th>DOSAGE</th>
                      <th>DELAY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archive.map(log => {
                      const scheduled = log.scheduledTime ? new Date(log.scheduledTime) : null;
                      const taken     = log.takenAt ? new Date(log.takenAt) : scheduled;
                      const diffMin   = scheduled && taken
                        ? Math.round((taken.getTime() - scheduled.getTime()) / 60000)
                        : null;
                      return (
                        <tr key={log._id}>
                          <td>
                            <div style={{ fontWeight: '500' }}>{log.elixirName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {scheduled ? scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{log.dosage}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {diffMin !== null ? (diffMin >= 0 ? `+${diffMin}m` : `${diffMin}m`) : '—'}
                          </td>
                          <td><span className="badge badge-green">Resolved</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Nudges */}
        <div style={{ minWidth: 0 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--blue)' }}>✦ AI Nudges</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alertLogs.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No nudges — all clear for now.
                </p>
              ) : (
                alertLogs.slice(0, 3).map(log => (
                  <NudgeCard key={log._id} log={log} onAction={handleStatusChange} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Toggle widget ─────────────────────────────────────────────────────────── */
function ToggleItem({ label, sub, on }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      <div style={{
        width: '40px', height: '22px', borderRadius: '11px',
        background: on ? 'var(--blue)' : '#D1D5DB',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s', cursor: 'pointer',
      }}>
        <div style={{
          position: 'absolute',
          left: on ? '20px' : '2px', top: '3px',
          width: '16px', height: '16px',
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}
