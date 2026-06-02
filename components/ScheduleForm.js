'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FREQUENCY_OPTIONS = [
  { value: 'daily',        label: 'Daily (Once a day)' },
  { value: 'twice-daily',  label: 'Twice Daily' },
  { value: 'thrice-daily', label: 'Thrice Daily' },
  { value: 'weekly',       label: 'Weekly' },
  { value: 'as-needed',    label: 'As Needed' },
];

const DEFAULT_TIMES = {
  daily:        ['08:00'],
  'twice-daily':['08:00', '20:00'],
  'thrice-daily':['08:00', '14:00', '20:00'],
  weekly:       ['08:00'],
  'as-needed':  [],
};

export default function ScheduleForm({ initialData = null }) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    elixirName: initialData?.elixirName || '',
    dosage:     initialData?.dosage     || '',
    frequency:  initialData?.frequency  || 'daily',
    times:      initialData?.times      || ['08:00'],
    notes:      initialData?.notes      || '',
    isActive:   initialData?.isActive   ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  function handleFreq(freq) {
    setForm(p => ({ ...p, frequency: freq, times: DEFAULT_TIMES[freq] || ['08:00'] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.elixirName.trim()) { setError('Elixir name is required.'); return; }
    if (!form.dosage.trim())     { setError('Dosage is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/schedules/${initialData._id}` : '/api/schedules',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }
      );
      if (!res.ok) { setError((await res.json()).error || 'Something went wrong.'); return; }
      router.push('/schedules');
      router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', color: '#991B1B', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <Field label="Elixir Name" required>
        <input className="field-input" type="text" placeholder="e.g. Morning Vitamin C"
          value={form.elixirName} onChange={e => set('elixirName', e.target.value)} />
      </Field>

      <Field label="Dosage" required>
        <input className="field-input" type="text" placeholder="e.g. 500mg, 2 capsules"
          value={form.dosage} onChange={e => set('dosage', e.target.value)} />
      </Field>

      <Field label="Frequency">
        <select className="field-input" value={form.frequency} onChange={e => handleFreq(e.target.value)}>
          {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      {form.frequency !== 'as-needed' && (
        <Field label="Scheduled Times">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {form.times.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input className="field-input" type="time" value={t}
                  onChange={e => { const ts = [...form.times]; ts[i] = e.target.value; set('times', ts); }}
                  style={{ flex: 1 }} />
                {form.times.length > 1 && (
                  <button type="button" className="btn-danger"
                    onClick={() => set('times', form.times.filter((_, j) => j !== i))}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline" style={{ fontSize: '12px' }}
              onClick={() => set('times', [...form.times, '08:00'])}>
              + Add time
            </button>
          </div>
        </Field>
      )}

      <Field label="Notes (optional)">
        <textarea className="field-input" rows={3} placeholder="Take with food, etc."
          value={form.notes} onChange={e => set('notes', e.target.value)}
          style={{ resize: 'vertical' }} />
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button type="button" onClick={() => set('isActive', !form.isActive)} style={{
          width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
          background: form.isActive ? 'var(--blue)' : '#D1D5DB',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute', top: '3px', width: '16px', height: '16px',
            borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            left: form.isActive ? '21px' : '3px', transition: 'left 0.2s',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {form.isActive ? 'Active — included in daily reminders' : 'Inactive — paused'}
        </span>
      </div>

      <hr className="divider" />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update Elixir' : '+ Add to Grimoire'}
        </button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="field-label">{label}{required && <span style={{ color: '#EF4444' }}> *</span>}</label>
      {children}
    </div>
  );
}
