const Stripe = require('stripe');

async function upsertBuyerContact(session) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // Supabase not configured — skip silently

  const customer = session.customer_details || {};
  const email = (customer.email || '').trim().toLowerCase();
  const phone = (customer.phone || '').trim();
  if (!email && !phone) return;

  const [firstName, ...rest] = (customer.name || '').split(' ');
  const row = {
    email: email || null,
    phone: phone || null,
    first_name: firstName || null,
    last_name: rest.join(' ') || null,
    source: 'stripe',
    total_spent_delta: (session.amount_total || 0) / 100,
  };

  // Call a Postgres RPC that does upsert-or-increment in one statement.
  // If the function isn't created yet this fails gracefully and the buyer
  // still gets the order email — they just won't appear in Contacts.
  try {
    const resp = await fetch(`${url}/rest/v1/rpc/record_buyer_contact`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.warn('record_buyer_contact failed:', resp.status, text);
    }
  } catch (err) {
    console.warn('record_buyer_contact threw:', err.message);
  }
}

const readRawBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(Buffer.from(chunk)));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

const dollars = (amount) => {
  const cents = Number(amount || 0);
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const htmlEscape = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatAddress = (details = {}) => {
  const address = details.address || {};
  return [
    details.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country
  ].filter(Boolean).join('\n');
};

const sendOrderEmail = async ({ session, lineItems }) => {
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || 'FW Wheels <onboarding@resend.dev>';

  if (!resendKey || !to) {
    console.warn('Resend order email skipped: missing RESEND_API_KEY or ORDER_NOTIFY_EMAIL');
    return;
  }

  const customer = session.customer_details || {};
  const shipping = session.shipping_details || {};
  const heardAboutUs = session.metadata && session.metadata.heardAboutUs
    ? session.metadata.heardAboutUs
    : 'Not provided';
  const rows = lineItems.data.map(item => {
    const product = item.price && item.price.product && typeof item.price.product === 'object'
      ? item.price.product
      : {};
    const description = [item.description, product.description].filter(Boolean).join(' · ');

    return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #333;">
          <strong>${htmlEscape(item.description || product.name || 'FW Wheels item')}</strong>
          ${description ? `<div style="color:#aaa;margin-top:4px;">${htmlEscape(description)}</div>` : ''}
        </td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:center;">${item.quantity || 1}</td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:right;">${dollars(item.amount_total)}</td>
      </tr>
    `;
  }).join('');

  const textLines = [
    `New FW Wheels order paid: ${session.id}`,
    `Total: ${dollars(session.amount_total)}`,
    '',
    'Customer',
    `Name: ${customer.name || 'Not provided'}`,
    `Email: ${customer.email || 'Not provided'}`,
    `Phone: ${customer.phone || 'Not provided'}`,
    `Heard about us: ${heardAboutUs}`,
    '',
    'Ship to',
    formatAddress(shipping) || 'Not provided',
    '',
    'Items',
    ...lineItems.data.map(item => `- ${item.quantity || 1}x ${item.description || 'FW Wheels item'} (${dollars(item.amount_total)})`),
    '',
    `Stripe session: ${session.url || session.id}`
  ];

  const html = `
    <div style="background:#0d0d0d;color:#f4f4f4;font-family:Arial,sans-serif;padding:24px;">
      <h1 style="margin:0 0 8px;">New FW Wheels Order</h1>
      <p style="margin:0 0 24px;color:#aaa;">Stripe session ${htmlEscape(session.id)}</p>
      <div style="font-size:24px;font-weight:700;color:#ef3b4a;margin-bottom:24px;">${dollars(session.amount_total)}</div>
      <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:1px;">Customer</h2>
      <p style="line-height:1.6;">
        ${htmlEscape(customer.name || 'Name not provided')}<br>
        ${htmlEscape(customer.email || 'Email not provided')}<br>
        ${htmlEscape(customer.phone || 'Phone not provided')}<br>
        Heard about us: ${htmlEscape(heardAboutUs)}
      </p>
      <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:1px;">Shipping</h2>
      <pre style="white-space:pre-wrap;color:#ddd;font-family:Arial,sans-serif;line-height:1.6;">${htmlEscape(formatAddress(shipping) || 'Not provided')}</pre>
      <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:1px;">Items</h2>
      <table style="width:100%;border-collapse:collapse;background:#151515;">
        <thead>
          <tr>
            <th style="padding:12px;text-align:left;border-bottom:1px solid #444;">Item</th>
            <th style="padding:12px;text-align:center;border-bottom:1px solid #444;">Qty</th>
            <th style="padding:12px;text-align:right;border-bottom:1px solid #444;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;color:#aaa;">Open Stripe and search this session ID: ${htmlEscape(session.id)}</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: `FW Wheels order paid - ${dollars(session.amount_total)}`,
      text: textLines.join('\n'),
      html
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed: ${response.status} ${body}`);
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook is not configured' });
  }

  const stripe = new Stripe(stripeKey);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ['data.price.product']
      });
      await sendOrderEmail({ session, lineItems });
      await upsertBuyerContact(session);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};
