import nodemailer from 'nodemailer';

// Lazy-initialise — only blows up at send time, not at import time
function getTransport() {
  const user = process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('your_')) {
    throw new Error('EMAIL_FROM and EMAIL_PASS must be set in .env.local (use a Gmail App Password)');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Send a themed HTML email.
 * @param {{ subject: string, html: string }} opts
 */
export async function sendMail({ subject, html }) {
  const transport = getTransport();
  await transport.sendMail({
    from: `"⚗️ Grand Grimoire" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_FROM,
    subject,
    html,
  });
}

/** Build a dark-themed HTML wrapper around body content. */
export function buildEmailHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; padding:0; background:#0d0a1a; font-family:Georgia,'Times New Roman',serif; color:#f5e6c8; }
  .wrap { max-width:600px; margin:0 auto; padding:24px 16px; }
  .card { background:#1a0f2e; border:1px solid #4c1d95; border-radius:12px; padding:24px; margin-bottom:16px; }
  .gold { color:#d4af37; }
  .label { font-size:11px; color:#c9b88a; letter-spacing:0.08em; text-transform:uppercase; }
  .taken  { background:rgba(16,185,129,.15); border:1px solid rgba(16,185,129,.3); border-radius:20px; padding:2px 10px; color:#6ee7b7; font-size:12px; font-weight:700; }
  .missed { background:rgba(239,68,68,.15);  border:1px solid rgba(239,68,68,.3);  border-radius:20px; padding:2px 10px; color:#fca5a5; font-size:12px; font-weight:700; }
  .pending{ background:rgba(107,114,128,.15);border:1px solid rgba(107,114,128,.3);border-radius:20px; padding:2px 10px; color:#d1d5db; font-size:12px; font-weight:700; }
  .btn { display:inline-block; background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fbbf24 !important; border:1px solid #d4af37; border-radius:8px; padding:10px 24px; text-decoration:none; font-weight:700; font-size:14px; margin-top:16px; }
  hr { border:none; height:1px; background:linear-gradient(90deg,transparent,#4c1d95,transparent); margin:16px 0; }
  .footer { text-align:center; font-size:11px; color:#6b7280; margin-top:24px; }
</style>
</head>
<body>
<div class="wrap">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:2rem;">⚗️</div>
    <h1 class="gold" style="margin:8px 0 4px;font-size:1.4rem;letter-spacing:0.08em;">The Grand Grimoire</h1>
    <p style="margin:0;color:#c9b88a;font-size:13px;">Your mystical medicine tracker</p>
  </div>
  ${bodyHtml}
  <div class="footer">
    <p>You are receiving this because you set up email reminders in the Grand Grimoire app.</p>
  </div>
</div>
</body>
</html>`;
}
