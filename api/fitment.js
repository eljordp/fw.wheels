// Server-side proxy for Wheel-Size API. Keep WHEEL_SIZE_USER_KEY private in Vercel env vars.
const API_BASE = 'https://api.wheel-size.com/v2';

const RESOURCE_PATHS = {
  years: '/years/',
  makes: '/makes/',
  models: '/models/',
  modifications: '/modifications/',
  search: '/search/by_model/'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userKey = process.env.WHEEL_SIZE_USER_KEY;
  if (!userKey) {
    return res.status(501).json({
      error: 'Vehicle finder is not configured yet. Add WHEEL_SIZE_USER_KEY in Vercel.'
    });
  }

  const { resource = 'search', ...params } = req.query;
  const path = RESOURCE_PATHS[resource];
  if (!path) return res.status(400).json({ error: 'Unknown fitment resource' });

  const url = new URL(API_BASE + path);
  url.searchParams.set('user_key', userKey);
  url.searchParams.set('region', params.region || 'usdm');
  url.searchParams.set('lang', params.lang || 'en');

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || key === 'resource') return;
    url.searchParams.set(key, value);
  });

  try {
    const upstream = await fetch(url);
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(502).json({ error: err.message || 'Fitment lookup failed' });
  }
};
