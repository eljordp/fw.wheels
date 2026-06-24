const DEFAULT_TO = 'fw.wheelssupport@gmail.com';

function clean(value) {
  return String(value || '').trim();
}

function validEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

async function sendEmail(payload) {
  if (!process.env.RESEND_API_KEY) return { skipped: true, reason: 'missing_resend' };

  const to = (process.env.FITMENT_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || DEFAULT_TO)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="color:#e63946">New FW Wheels fitment question</h2>
      <p><b>${escapeHtml(name)}</b></p>
      <p>Email: <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a><br>Phone: <a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a></p>
      <h3 style="margin-top:20px">Vehicle / build notes</h3>
      <p style="white-space:pre-wrap;background:#f6f6f6;padding:14px;border-radius:8px">${escapeHtml(payload.vehicle || 'No notes entered.')}</p>
      <p style="color:#666;font-size:13px">Source: ${escapeHtml(payload.path || '/')}</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'FW Wheels <orders@fwwheelz.com>',
      to,
      reply_to: payload.email,
      subject: `Fitment question - ${name || payload.phone}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
  return { sent: true };
}

async function sendSms(payload) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.FITMENT_SMS_TO || '9259056277';
  if (!sid || !token || !from) return { skipped: true, reason: 'missing_twilio' };

  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const body = `FW Wheels fitment lead: ${name}\n${payload.phone}\n${payload.email}\n${payload.vehicle || 'No notes'}`.slice(0, 1500);
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }),
  });
  if (!res.ok) throw new Error(`twilio ${res.status}: ${await res.text()}`);
  return { sent: true };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const payload = {
      firstName: clean(body.firstName),
      lastName: clean(body.lastName),
      phone: clean(body.phone),
      email: clean(body.email),
      vehicle: clean(body.vehicle),
      path: clean(body.path),
    };

    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email) {
      return res.status(400).json({ error: 'First name, last name, phone, and email are required.' });
    }
    if (!validEmail(payload.email)) return res.status(400).json({ error: 'Enter a valid email.' });

    const [email, sms] = await Promise.allSettled([sendEmail(payload), sendSms(payload)]);
    if (email.status === 'rejected') throw email.reason;
    if (sms.status === 'rejected') console.error('Fitment SMS failed:', sms.reason.message);

    return res.status(200).json({ ok: true, email: email.value, sms: sms.status === 'fulfilled' ? sms.value : { error: true } });
  } catch (err) {
    console.error('Fitment lead failed:', err);
    return res.status(500).json({ error: 'Could not send fitment question.' });
  }
};
