import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import AdherenceLog from '@/lib/models/AdherenceLog';
import { sendMail, buildEmailHtml } from '@/lib/mailer';
import { seedTodayLogs } from '@/lib/seedLogs';

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusBadge(status) {
  if (status === 'taken')  return '<span class="taken">✅ Taken</span>';
  if (status === 'missed') return '<span class="missed">❌ Missed</span>';
  return '<span class="pending">⏳ Pending</span>';
}

// POST /api/reminders/email
// Body: { type: 'daily-digest' | 'pending-now' }
export async function POST(request) {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { type = 'daily-digest' } = await request.json().catch(() => ({}));

    await seedTodayLogs(userId);

    const today = new Date().toISOString().slice(0, 10);
    const logs  = await AdherenceLog.find({ userId, date: today }).sort({ scheduledTime: 1 });

    if (logs.length === 0) {
      return NextResponse.json({ message: 'No logs for today — nothing to send.' });
    }

    const taken   = logs.filter(l => l.status === 'taken').length;
    const missed  = logs.filter(l => l.status === 'missed').length;
    const pending = logs.filter(l => l.status === 'pending').length;
    const rate    = Math.round((taken / logs.length) * 100);

    let targetLogs = logs;
    let subjectLine = `⚗️ Grand Grimoire — Daily Digest for ${today}`;

    if (type === 'pending-now') {
      const now = Date.now();
      targetLogs = logs.filter(l => {
        const due = new Date(l.scheduledTime).getTime();
        return l.status === 'pending' && due - now <= 30 * 60_000 && due > now - 10 * 60_000;
      });
      if (targetLogs.length === 0) {
        return NextResponse.json({ message: 'No doses due in the next 30 minutes.' });
      }
      subjectLine = `⚗️ Upcoming Elixirs — ${targetLogs.length} dose(s) due soon`;
    }

    const rows = targetLogs.map(log => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid rgba(76,29,149,.3);">
          <strong class="gold">🧪 ${log.elixirName}</strong><br>
          <span style="font-size:12px;color:#c9b88a;">${log.dosage}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid rgba(76,29,149,.3);text-align:center;">
          ${fmtTime(log.scheduledTime)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid rgba(76,29,149,.3);text-align:center;">
          ${statusBadge(log.status)}
        </td>
      </tr>`).join('');

    const statsHtml = type === 'daily-digest' ? `
      <div class="card" style="text-align:center;margin-bottom:16px;">
        <p class="label" style="margin:0 0 12px;">Today's Wellness Rate</p>
        <div class="gold" style="font-size:2rem;font-weight:700;">${rate}%</div>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:12px;font-size:13px;color:#c9b88a;">
          <span>✅ ${taken} Taken</span>
          <span>❌ ${missed} Missed</span>
          <span>⏳ ${pending} Pending</span>
        </div>
      </div>` : '';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const bodyHtml = `
      ${statsHtml}
      <div class="card">
        <p class="label" style="margin:0 0 12px;">
          ${type === 'pending-now' ? 'Doses Due Soon' : 'Full Schedule'}
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 12px;font-size:11px;color:#c9b88a;letter-spacing:.06em;">ELIXIR</th>
              <th style="text-align:center;padding:6px 12px;font-size:11px;color:#c9b88a;letter-spacing:.06em;">TIME</th>
              <th style="text-align:center;padding:6px 12px;font-size:11px;color:#c9b88a;letter-spacing:.06em;">STATUS</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="text-align:center;">
          <a href="${baseUrl}" class="btn">Open the Grimoire →</a>
        </div>
      </div>`;

    await sendMail({ subject: subjectLine, html: buildEmailHtml(bodyHtml) });

    return NextResponse.json({ sent: true, to: process.env.EMAIL_TO, type, count: targetLogs.length });
  } catch (err) {
    console.error('Email reminder error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
