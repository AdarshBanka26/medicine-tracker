'use client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = {
  Taken: '#10b981',
  Missed: '#ef4444',
  Pending: '#6b7280',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      style={{
        background: '#1a0f2e',
        border: '1px solid #4c1d95',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.82rem',
        color: '#f5e6c8',
      }}
    >
      <span style={{ color: COLORS[name] }}>{name}: </span>
      <strong>{value}</strong>
    </div>
  );
}

function CustomLabel({ cx, cy, taken, total }) {
  const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.3em" fontSize="20" fontWeight="700" fill="#d4af37">
        {rate}%
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize="10" fill="#c9b88a">
        wellness
      </tspan>
    </text>
  );
}

export default function WellnessPieChart({ taken = 0, missed = 0, pending = 0 }) {
  const total = taken + missed + pending;

  if (total === 0) {
    return (
      <div
        style={{
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '0.85rem',
        }}
      >
        No doses scheduled today.
      </div>
    );
  }

  const data = [
    { name: 'Taken', value: taken },
    { name: 'Missed', value: missed },
    { name: 'Pending', value: pending },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={<CustomLabel taken={taken} total={total} />}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.75rem', color: '#c9b88a' }}
          formatter={(value) => <span style={{ color: COLORS[value] }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
