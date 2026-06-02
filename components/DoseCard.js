'use client';
import { useState } from 'react';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DoseCard({ log, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onStatusChange(updated);
      }
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    taken: { label: 'Taken', class: 'badge-taken', emoji: '✅' },
    missed: { label: 'Missed', class: 'badge-missed', emoji: '❌' },
    pending: { label: 'Pending', class: 'badge-pending', emoji: '⏳' },
  };
  const cfg = statusConfig[log.status];

  return (
    <div
      className="grimoire-card"
      style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🧪</span>
          <span
            style={{
              fontWeight: '700',
              color: '#d4af37',
              fontSize: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            {log.elixirName}
          </span>
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: '#c9b88a',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span>Dosage: <strong style={{ color: '#f5e6c8' }}>{log.dosage}</strong></span>
          <span>Scheduled: <strong style={{ color: '#f5e6c8' }}>{formatTime(log.scheduledTime)}</strong></span>
        </div>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span className={cfg.class}>
          {cfg.emoji} {cfg.label}
        </span>

        {log.status !== 'taken' && (
          <button
            className="btn-magic"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => updateStatus('taken')}
            disabled={loading}
          >
            Mark Taken
          </button>
        )}
        {log.status !== 'missed' && (
          <button
            className="btn-danger"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => updateStatus('missed')}
            disabled={loading}
          >
            Mark Missed
          </button>
        )}
        {log.status !== 'pending' && (
          <button
            style={{
              background: 'rgba(107, 114, 128, 0.2)',
              color: '#d1d5db',
              border: '1px solid rgba(107, 114, 128, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            onClick={() => updateStatus('pending')}
            disabled={loading}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
