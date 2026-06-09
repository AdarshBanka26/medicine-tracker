import ScheduleForm from '@/components/ScheduleForm';
import Link from 'next/link';

export const metadata = { title: 'Edit Medication — Pillora' };

async function getSchedule(id) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/schedules/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditSchedulePage({ params }) {
  const { id } = await params;
  const schedule = await getSchedule(id);

  if (!schedule) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Medication not found.</p>
        <Link href="/schedules" style={{ color: 'var(--blue)' }}>Return to Medications</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Link href="/schedules" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Medications</Link>
          {' / '}Edit
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Edit Medication</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Updating <strong>{schedule.elixirName}</strong>
        </p>
      </div>
      <div className="card">
        <ScheduleForm initialData={schedule} />
      </div>
    </div>
  );
}
