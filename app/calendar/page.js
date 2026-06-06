'use client';
import { useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

const LEGEND = [
  { color: '#10b981', label: 'Taken' },
  { color: '#ef4444', label: 'Missed' },
  { color: '#2563EB', label: 'Pending (today)' },
  { color: '#1E3A8A', label: 'Upcoming' },
];

const STATUS_BADGE = {
  taken:     { cls: 'badge badge-green',  label: '✅ Taken' },
  missed:    { cls: 'badge badge-red',    label: '❌ Missed' },
  pending:   { cls: 'badge badge-blue',   label: '⏳ Pending' },
  scheduled: { cls: 'badge badge-gray',   label: '📅 Upcoming' },
};

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)', minWidth: '90px' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{children}</span>
    </div>
  );
}

function EventModal({ event, onClose }) {
  if (!event) return null;
  const p = event.extendedProps;
  const badge = p.type === 'log' ? (STATUS_BADGE[p.status] ?? STATUS_BADGE.pending) : STATUS_BADGE.scheduled;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: '380px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              ⚗️ {p.elixirName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.dosage}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1 }}>✕</button>
        </div>
        <hr className="divider" />
        <Row label="Status"><span className={badge.cls}>{badge.label}</span></Row>
        <Row label="Scheduled">
          {event.start ? new Date(event.start).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </Row>
        {p.takenAt && (
          <Row label="Taken at">
            {new Date(p.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Row>
        )}
        {p.frequency && <Row label="Frequency">{p.frequency}</Row>}
        <div style={{ marginTop: '16px' }}>
          <button className="btn-outline" style={{ fontSize: '12px', width: '100%' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const calRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async (fetchInfo, successCb, failureCb) => {
    try {
      const res = await fetch(`/api/calendar/events?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      successCb(await res.json());
    } catch (err) {
      failureCb(err);
    }
  }, []);

  return (
    <>
      {/* FullCalendar light-theme overrides */}
      <style>{`
        .fc { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--text-primary); }
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--border); }
        .fc-theme-standard .fc-scrollgrid { border-color: var(--border); }
        .fc-col-header-cell { background: var(--bg-table-head); }
        .fc-col-header-cell-cushion { color: var(--text-secondary) !important; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none !important; }
        .fc-daygrid-day { background: #fff; }
        .fc-daygrid-day:hover { background: #F9FAFB; }
        .fc-day-today { background: #EFF6FF !important; }
        .fc-day-today .fc-daygrid-day-number { color: var(--blue) !important; font-weight: 700; }
        .fc-daygrid-day-number { color: var(--text-secondary); text-decoration: none !important; font-size: 12px; }
        .fc-toolbar-title { color: var(--text-primary); font-size: 16px !important; font-weight: 700; }
        .fc-button { background: var(--blue) !important; border-color: var(--blue) !important; color: #fff !important; font-size: 12px !important; border-radius: 6px !important; }
        .fc-button:hover { background: #1d4ed8 !important; }
        .fc-button-active { background: #1e40af !important; border-color: #1e40af !important; }
        .fc-button:disabled { opacity: 0.5; }
        .fc-event { border-radius: 4px; font-size: 11px; cursor: pointer; border: none !important; }
        .fc-event-title { font-weight: 600; }
        .fc-list-event:hover td { background: #F9FAFB !important; }
        .fc-list-day-cushion { background: var(--bg-table-head) !important; color: var(--text-primary) !important; font-weight: 600; }
        .fc-list-event-title { color: var(--text-primary) !important; }
        .fc-list-event-dot { border-color: currentColor !important; }
        .fc-no-events { color: var(--text-muted); padding: 2rem; text-align: center; font-size: 13px; }
        .fc-timegrid-slot { border-color: var(--border) !important; }
        .fc-timegrid-slot-label { color: var(--text-muted); font-size: 11px; }
        .fc-more-popover { background: #fff; border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .fc-more-popover .fc-popover-header { background: var(--bg-table-head); color: var(--text-primary); font-size: 12px; }
        .fc-popover-body { padding: 8px; }
        .fc-now-indicator-line { border-color: var(--blue); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Sky Calendar
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          All medication schedules and adherence history in one view
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color, flexShrink: 0, display: 'inline-block' }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: '16px', overflow: 'hidden' }}>
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'List' }}
          height="auto"
          events={fetchEvents}
          eventClick={({ event }) => setSelectedEvent(event)}
          nowIndicator
          dayMaxEvents={3}
          moreLinkText={n => `+${n} more`}
          noEventsText="No medications scheduled — add one from Medications."
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
        />
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
