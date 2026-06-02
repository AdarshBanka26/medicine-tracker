'use client';
import { useState, useEffect } from 'react';

const RISK_CONFIG = {
  low: { color: '#10b981', label: 'Low Risk', emoji: '🟢' },
  moderate: { color: '#f59e0b', label: 'Moderate Risk', emoji: '🟡' },
  high: { color: '#ef4444', label: 'High Risk', emoji: '🔴' },
};

export default function PredictionCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchPrediction() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/predict');
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Prediction failed');
      }
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPrediction(); }, []);

  const risk = data ? (RISK_CONFIG[data.overallRisk] || RISK_CONFIG.low) : null;

  return (
    <div
      className="grimoire-card"
      style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(26,15,46,0.9), rgba(76,29,149,0.1))',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔮</span>
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#d4af37',
              letterSpacing: '0.05em',
            }}
          >
            Mystic Fortune Teller
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              background: 'rgba(124,58,237,0.3)',
              border: '1px solid #7c3aed',
              borderRadius: '4px',
              padding: '1px 6px',
              color: '#a78bfa',
              letterSpacing: '0.08em',
            }}
          >
            AI
          </span>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #4c1d95',
            borderRadius: '6px',
            color: '#c9b88a',
            padding: '4px 10px',
            fontSize: '0.75rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Gazing...' : '↺ Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c9b88a', fontSize: '0.875rem' }}>
          <PulsingDot />
          The Fortune Teller is reading the stars...
        </div>
      ) : error ? (
        <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
          {error.includes('GEMINI_API_KEY') || error.includes('API_KEY')
            ? 'Add your GEMINI_API_KEY to .env.local to enable AI predictions.'
            : `Oracle error: ${error}`}
        </div>
      ) : data ? (
        <div>
          {/* Nudge message */}
          <div
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#f5e6c8',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            "{data.nudgeMessage}"
          </div>

          {/* Overall risk + summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem' }}>{risk.emoji}</span>
            <span style={{ fontSize: '0.82rem', color: risk.color, fontWeight: '700' }}>
              {risk.label}
            </span>
            {data.summary && (
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>— {data.summary}</span>
            )}
          </div>

          {/* High-risk time slots */}
          {data.highRiskTimes?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#c9b88a',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                High-Risk Patterns Detected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.highRiskTimes.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      background: 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span>⚠️</span>
                    <div>
                      <span style={{ color: '#fca5a5', fontWeight: '600' }}>
                        {item.elixir} ({item.timeOfDay})
                      </span>
                      {' — '}
                      <span style={{ color: '#ef4444', fontWeight: '700' }}>{item.missRate}% miss rate</span>
                      {item.reason && (
                        <div style={{ color: '#9ca3af', marginTop: '2px', fontSize: '0.75rem' }}>
                          {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PulsingDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#7c3aed',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}
