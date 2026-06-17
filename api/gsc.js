// Google Search Console — live top queries for fwwheelz.com (last 28 days).
// Service-account JWT (RS256) -> access token -> Search Analytics query. No deps.
// Env (Vercel): GSC_SERVICE_ACCOUNT_JSON (full key JSON), GSC_SITE_URL
//   e.g. "sc-domain:fwwheelz.com" (Domain property) or "https://fwwheelz.com/"
const crypto = require('node:crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function gscConfig() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!raw || !siteUrl) return null;
  let sa;
  try { sa = JSON.parse(raw); } catch { return null; }
  if (!sa.client_email || !sa.private_key) return null;
  return { clientEmail: sa.client_email, privateKey: sa.private_key, siteUrl };
}

const b64url = (s) => Buffer.from(s).toString('base64url');

async function getAccessToken({ clientEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput); signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${signingInput}.${signature}` }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error_description || data.error || 'Google token exchange failed');
  return data.access_token;
}

async function querySearchAnalytics(token, siteUrl, body) {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) { const e = new Error(data?.error?.message || 'Search Console query failed'); e.status = resp.status; throw e; }
  return data;
}

const isoDate = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

// Merge same-words-different-order queries into one row.
function groupByWordSet(rows) {
  const groups = new Map();
  for (const r of rows) {
    const key = r.query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
    if (!key) continue;
    const g = groups.get(key) || { best: r, variants: 0, clicks: 0, impressions: 0, posWeighted: 0 };
    if (r.impressions > g.best.impressions) g.best = r;
    g.variants += 1; g.clicks += r.clicks; g.impressions += r.impressions; g.posWeighted += r.position * r.impressions;
    groups.set(key, g);
  }
  return [...groups.values()].map((g) => ({
    query: g.best.query, variants: g.variants, clicks: g.clicks, impressions: g.impressions,
    ctr: g.impressions ? g.clicks / g.impressions : 0,
    position: g.impressions ? g.posWeighted / g.impressions : 0,
  })).sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 25);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const config = gscConfig();
  if (!config) return res.status(200).json({ configured: false });
  try {
    const token = await getAccessToken(config);
    const data = await querySearchAnalytics(token, config.siteUrl, {
      startDate: isoDate(28), endDate: isoDate(1),
      dimensions: ['query'], rowLimit: 250,
      orderBy: [{ field: 'clicks', descending: true }],
    });
    const rows = (data.rows || []).map((r) => ({
      query: r.keys?.[0] || '', clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0,
    }));
    return res.status(200).json({ configured: true, queries: groupByWordSet(rows) });
  } catch (err) {
    return res.status(200).json({ configured: true, error: err.message || 'GSC query failed' });
  }
};
