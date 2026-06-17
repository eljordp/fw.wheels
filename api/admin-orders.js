const Stripe = require('stripe');

const STATUS_LABELS = {
  complete: { label: 'Paid', cat: 'backend' },
  open: { label: 'Open', cat: 'pricing' },
  expired: { label: 'Expired', cat: 'fixes' },
};

const STATUS_CAT_FALLBACK = 'admin';

function authorized(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return true; // not configured = open (dev only)
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  return token && token === expected;
}

function dayBucket(timestamp) {
  const d = new Date(timestamp * 1000);
  const now = new Date();
  const toMidnight = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  };
  const orderDay = toMidnight(d);
  const today = toMidnight(now);
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  return {
    isToday: orderDay === today,
    isThisWeek: orderDay >= weekAgo,
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'STRIPE_SECRET_KEY missing' });

  const stripe = new Stripe(stripeKey);

  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const data = sessions.data.filter(s => s.status === 'complete' || s.payment_status === 'paid');

    const orders = data.map(s => {
      const customer = s.customer_details || {};
      const statusKey = s.status || 'complete';
      const meta = STATUS_LABELS[statusKey] || { label: statusKey, cat: STATUS_CAT_FALLBACK };
      return {
        id: s.id,
        date: new Date(s.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: (s.amount_total || 0) / 100,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: meta.label,
        statusCat: meta.cat,
        url: 'https://dashboard.stripe.com/payments/' + (s.payment_intent || s.id),
        _created: s.created,
      };
    });

    let count = 0;
    let revenue = 0;
    let today = 0;
    let week = 0;
    for (const o of orders) {
      count++;
      revenue += o.amount;
      const b = dayBucket(o._created);
      if (b.isToday) today++;
      if (b.isThisWeek) week++;
    }

    const totals = { count, revenue, today, week };
    orders.forEach(o => { delete o._created; });
    return res.status(200).json({ orders, totals });
  } catch (err) {
    console.error('admin-orders error:', err);
    return res.status(500).json({ error: err.message });
  }
};
