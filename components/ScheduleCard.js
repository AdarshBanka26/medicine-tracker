'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const frequencyLabels = {
  daily: 'Daily',
  'twice-daily': 'Twice Daily',
  'thrice-daily': 'Thrice Daily',
  weekly: 'Weekly',
  'as-needed': 'As Needed',
};

export default function ScheduleCard({ schedule, onDelete }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Remove "${schedule.elixirName}" from the Grimoire?`)) return;
    await fetch(`/api/schedules/${schedule._id}`, { method: 'DELETE' });
    onDelete(schedule._id);
  }

  return (
    <div className="grimoire-card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚗️</span>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: '700',
                color: '#d4af37',
                letterSpacing: '0.02em',
              }}
            >
              {schedule.elixirName}
            </h3>
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '0.8rem',
              color: '#c9b88a',
              letterSpacing: '0.04em',
            }}
          >
            {frequencyLabels[schedule.frequency] || schedule.frequency}
          </div>
        </div>
        <div
          style={{
            background: schedule.isActive
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(107, 114, 128, 0.15)',
            border: `1px solid ${schedule.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '0.7rem',
            color: schedule.isActive ? '#6ee7b7' : '#9ca3af',
            letterSpacing: '0.05em',
            fontWeight: '600',
          }}
        >
          {schedule.isActive ? '● Active' : '○ Inactive'}
        </div>
      </div>

      <hr className="magic-divider" style={{ margin: '0.75rem 0' }} />

      {/* Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '0.82rem',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <span style={{ color: '#c9b88a' }}>Dosage</span>
          <div style={{ color: '#f5e6c8', fontWeight: '600' }}>{schedule.dosage}</div>
        </div>
        <div>
          <span style={{ color: '#c9b88a' }}>Times</span>
          <div style={{ color: '#f5e6c8', fontWeight: '600' }}>
            {schedule.times.length > 0 ? schedule.times.join(', ') : '—'}
          </div>
        </div>
      </div>

      {schedule.notes && (
        <div
          style={{
            fontSize: '0.78rem',
            color: '#9ca3af',
            fontStyle: 'italic',
            marginBottom: '0.75rem',
          }}
        >
          {schedule.notes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link
          href={`/schedules/${schedule._id}/edit`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '7px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#fbbf24',
            background: 'rgba(76, 29, 149, 0.3)',
            border: '1px solid #4c1d95',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          Edit
        </Link>
        <button
          className="btn-danger"
          style={{ flex: 1, fontSize: '0.8rem', padding: '7px' }}
          onClick={handleDelete}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
