'use client';
import { useEffect, useRef, useState } from 'react';

// How many minutes ahead to trigger a notification
const LEAD_MINUTES = 15;
const POLL_INTERVAL_MS = 60_000;

function getNotificationKey(logId, scheduledTime) {
  return `grimoire-notified:${logId}:${scheduledTime}`;
}

function alreadyNotified(logId, scheduledTime) {
  try {
    return localStorage.getItem(getNotificationKey(logId, scheduledTime)) === '1';
  } catch {
    return false;
  }
}

function markNotified(logId, scheduledTime) {
  try {
    localStorage.setItem(getNotificationKey(logId, scheduledTime), '1');
    // Clear stale keys older than today
    const today = new Date().toISOString().slice(0, 10);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('grimoire-notified:') && !key.includes(today)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage blocked (private mode, etc.)
  }
}

export default function ReminderManager() {
  const [mounted, setMounted] = useState(false);
  const [permission, setPermission] = useState('default');
  const [lastCheck, setLastCheck] = useState(null);
  const intervalRef = useRef(null);

  async function requestPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  async function checkAndNotify() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/logs?date=${today}`);
    if (!res.ok) return;

    const logs = await res.json();
    const now = Date.now();

    for (const log of logs) {
      if (log.status !== 'pending') continue;

      const due = new Date(log.scheduledTime).getTime();
      const minutesUntilDue = (due - now) / 60_000;

      if (minutesUntilDue <= LEAD_MINUTES && minutesUntilDue > -5) {
        if (alreadyNotified(log._id, log.scheduledTime)) continue;

        const isNow = minutesUntilDue <= 0;
        const body = isNow
          ? `Time to take your ${log.dosage} dose now!`
          : `Due in ${Math.ceil(minutesUntilDue)} minute(s). Dosage: ${log.dosage}`;

        new Notification(`⚗️ ${log.elixirName}`, {
          body,
          icon: '/favicon.ico',
          tag: `grimoire-${log._id}`,
        });

        markNotified(log._id, log.scheduledTime);
      }
    }

    setLastCheck(new Date());
  }

  useEffect(() => {
    setMounted(true);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    checkAndNotify();
    intervalRef.current = setInterval(checkAndNotify, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Always return null on the server and on the first client render
  // to avoid a hydration mismatch.
  if (!mounted) return null;
  if (!('Notification' in window)) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '10px',
        background: permission === 'granted'
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(212, 175, 55, 0.08)',
        border: `1px solid ${permission === 'granted' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(212, 175, 55, 0.25)'}`,
        fontSize: '0.8rem',
        color: '#c9b88a',
        marginBottom: '1.5rem',
      }}
    >
      <span style={{ fontSize: '1rem' }}>{permission === 'granted' ? '🔔' : '🔕'}</span>
      {permission === 'granted' ? (
        <span>
          Circus Crier active — checking for due elixirs every minute
          {lastCheck && (
            <span style={{ color: '#6b7280', marginLeft: '8px' }}>
              (last checked {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}
        </span>
      ) : permission === 'denied' ? (
        <span style={{ color: '#fca5a5' }}>
          Notifications blocked — enable them in your browser settings to receive reminders.
        </span>
      ) : (
        <span>
          Enable the Circus Crier to receive dose reminders.{' '}
          <button
            onClick={requestPermission}
            style={{
              background: 'none',
              border: 'none',
              color: '#fbbf24',
              cursor: 'pointer',
              padding: 0,
              fontWeight: '700',
              fontSize: '0.8rem',
              textDecoration: 'underline',
            }}
          >
            Enable now
          </button>
        </span>
      )}
    </div>
  );
}
