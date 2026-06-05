// Stripe Checkout Session creator
// Receives cart items, creates Stripe Checkout Session, returns the redirect URL.
// Stripe automatically calculates sales tax based on customer shipping address (when Stripe Tax is enabled).

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to Vercel env vars.' });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const { items, origin } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const line_items = items.map((item) => {
      const metaLines = Array.isArray(item.metaLines) ? item.metaLines : [
        item.finish,
        item.boltConfig,
        item.cb ? `${item.cb}mm CB` : null
      ].filter(Boolean);
      const productName = item.productType === 'accessory'
        ? item.name
        : `${item.name} — ${item.size}`;

      return ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: productName,
          description: metaLines.join(' · '),
          images: item.image ? [item.image] : undefined,
          metadata: {
            productType: item.productType || 'wheel',
            wheelId: item.wheelId || '',
            accessoryId: item.accessoryId || '',
            size: item.size || '',
            finish: item.finish || '',
            boltConfig: item.boltConfig || ''
          }
        },
        unit_amount: Math.round(Number(item.price) * 100)
      },
      quantity: Number(item.qty) || 1
    });
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=canceled`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
};
