'use client';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function shortDate(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a0f2e',
        border: '1px solid #4c1d95',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '0.82rem',
        color: '#f5e6c8',
      }}
    >
      <div style={{ fontWeight: '700', color: '#d4af37', marginBottom: '4px' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function AdherenceTrendChart({ days = 7 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/logs/history?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((raw) => {
        if (!Array.isArray(raw)) throw new Error('Unexpected response format');
        setData(
          raw.map((d) => ({
            date: shortDate(d.date),
            Taken: d.taken,
            Missed: d.missed,
            Pending: d.pending,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('History fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [days]);

  if (loading) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9b88a', fontSize: '0.85rem' }}>
        Summoning chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5', fontSize: '0.82rem' }}>
        Could not load chart: {error}
      </div>
    );
  }

  const hasData = data.some((d) => d.Taken + d.Missed + d.Pending > 0);

  if (!hasData) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
        No data yet — start logging your elixirs.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(76, 29, 149, 0.3)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#c9b88a', fontSize: 11 }}
          axisLine={{ stroke: '#4c1d95' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#c9b88a', fontSize: 11 }}
          axisLine={{ stroke: '#4c1d95' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.78rem', color: '#c9b88a', paddingTop: '8px' }}
        />
        <Line
          type="monotone"
          dataKey="Taken"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Missed"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Pending"
          stroke="#6b7280"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={{ fill: '#6b7280', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
