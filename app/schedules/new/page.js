import ScheduleForm from '@/components/ScheduleForm';
import Link from 'next/link';

export const metadata = { title: 'New Medication — Alchemist Suite' };

export default function NewSchedulePage() {
  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Link href="/schedules" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Medications</Link>
          {' / '}New
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>New Medication</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Add a new medication to your schedule.</p>
      </div>
      <div className="card">
        <ScheduleForm />
      </div>
    </div>
  );
}
