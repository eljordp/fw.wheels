// Public endpoint — email/SMS signups from the marketing site post here.
// Upserts a row in the contacts table keyed by email (or phone if email missing).

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Supabase not configured' });

  let body = {};
  try {
    body = typeof req.body === 'object' && req.body !== null
      ? req.body
      : JSON.parse(req.body || '{}');
  } catch {
    return badRequest(res, 'Invalid JSON');
  }

  const email = (body.email || '').trim().toLowerCase();
  const phone = (body.phone || '').trim();
  const source = (body.source || 'website').toString().slice(0, 60);
  const firstName = (body.firstName || '').toString().slice(0, 80) || null;
  const lastName = (body.lastName || '').toString().slice(0, 80) || null;

  if (!email && !phone) return badRequest(res, 'Email or phone is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest(res, 'Invalid email');

  const row = {
    email: email || null,
    phone: phone || null,
    first_name: firstName,
    last_name: lastName,
    source,
    sms_opt_in: !!body.sms_opt_in && !!phone,
  };

  // Use upsert via on_conflict on email when present; fall back to phone-only insert
  const target = email ? 'email' : 'phone';
  try {
    const resp = await fetch(`${url}/rest/v1/contacts?on_conflict=${target}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('subscribe upsert failed:', resp.status, text);
      return res.status(resp.status).json({ error: text });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
