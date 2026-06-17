function authorized(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return true; // not configured = open (dev only)
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  return token && token === expected;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' });
  }

  try {
    const resp = await fetch(`${url}/rest/v1/contacts?select=*&order=created_at.desc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!resp.ok) {
      const body = await resp.text();
      return res.status(resp.status).json({ error: 'Supabase: ' + body });
    }
    const contacts = await resp.json();
    return res.status(200).json({ contacts });
  } catch (err) {
    console.error('admin-contacts error:', err);
    return res.status(500).json({ error: err.message });
  }
};
