// Stripe webhook -> records completed orders, line items, and customers in Supabase.
// Configure in Stripe Dashboard: endpoint https://fwwheelz.com/api/webhook
//   events: checkout.session.completed
// Env vars (Vercel): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const Stripe = require('stripe');

// Vercel needs the raw body to verify the Stripe signature.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// minimal Supabase REST insert via service_role (bypasses RLS)
async function sb(path, method, body, prefer) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`supabase ${path} ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  try {
    const session = event.data.object;
    // pull line items with product metadata
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    });

    const email = session.customer_details?.email || null;
    const name = session.customer_details?.name || null;
    const phone = session.customer_details?.phone || null;
    const addr = session.customer_details?.address || session.shipping_details?.address || null;
    const total = (session.amount_total || 0) / 100;
    const subtotal = (session.amount_subtotal || 0) / 100;
    const tax = (session.total_details?.amount_tax || 0) / 100;
    const shipping = (session.total_details?.amount_shipping || 0) / 100;

    // upsert customer (by email)
    let customerId = null;
    if (email) {
      const existing = await sb(`customers?email=eq.${encodeURIComponent(email)}&select=id,total_spent,orders_count,first_order_at`, 'GET');
      if (existing && existing.length) {
        const c = existing[0];
        customerId = c.id;
        await sb(`customers?id=eq.${c.id}`, 'PATCH', {
          name: name || undefined,
          phone: phone || undefined,
          city: addr?.city || undefined,
          state: addr?.state || undefined,
          total_spent: Number(c.total_spent || 0) + total,
          orders_count: Number(c.orders_count || 0) + 1,
          last_order_at: new Date().toISOString(),
        }, 'return=minimal');
      } else {
        const created = await sb('customers', 'POST', [{
          email, name, phone,
          city: addr?.city || null, state: addr?.state || null,
          total_spent: total, orders_count: 1,
          first_order_at: new Date().toISOString(),
          last_order_at: new Date().toISOString(),
        }]);
        customerId = created?.[0]?.id || null;
      }
    }

    // insert order (idempotent on stripe_session_id)
    const existingOrder = await sb(`orders?stripe_session_id=eq.${session.id}&select=id`, 'GET');
    if (existingOrder && existingOrder.length) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    const orderRows = await sb('orders', 'POST', [{
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent || null,
      customer_id: customerId,
      email, customer_name: name, phone,
      amount_total: total, amount_subtotal: subtotal,
      amount_tax: tax, amount_shipping: shipping,
      currency: session.currency || 'usd',
      payment_status: session.payment_status || null,
      fulfillment_status: 'new',
      ship_address: addr || null,
    }]);
    const orderId = orderRows?.[0]?.id;

    // line items
    const items = lineItems.data.map((li) => {
      const md = li.price?.product?.metadata || {};
      const unit = (li.price?.unit_amount || 0) / 100;
      return {
        order_id: orderId,
        product_slug: md.wheelId || md.accessoryId || null,
        name: li.description || li.price?.product?.name || 'Item',
        product_type: md.productType || null,
        size: md.size || null,
        finish: md.finish || null,
        bolt_config: md.boltConfig || null,
        unit_price: unit,
        qty: li.quantity || 1,
        line_total: unit * (li.quantity || 1),
      };
    });
    if (items.length) await sb('order_items', 'POST', items, 'return=minimal');

    // log a purchase event for the funnel
    await sb('events', 'POST', [{
      type: 'purchase',
      session_id: session.id,
      value: total,
      meta: { items: items.length },
    }], 'return=minimal').catch(() => {});

    // notify the owner by email (Resend) — infra already provisioned in Vercel
    if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFY_EMAIL) {
      const itemRows = items.map((it) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${it.name}${it.size ? ` — ${it.size}` : ''}${it.finish ? `<br><small style="color:#888">${it.finish} ${it.bolt_config || ''}</small>` : ''}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${it.qty}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">$${it.line_total.toFixed(2)}</td></tr>`
      ).join('');
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#e63946">New FW Wheels order — $${total.toFixed(2)}</h2>
          <p><b>${name || 'Customer'}</b> · ${email || ''} · ${phone || ''}</p>
          ${addr ? `<p style="color:#555">${addr.line1 || ''} ${addr.line2 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}</p>` : ''}
          <table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px">
            <thead><tr><th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Item</th><th style="padding:6px 10px;border-bottom:2px solid #333">Qty</th><th style="text-align:right;padding:6px 10px;border-bottom:2px solid #333">Total</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p style="text-align:right">Subtotal $${subtotal.toFixed(2)} · Tax $${tax.toFixed(2)} · Shipping $${shipping.toFixed(2)}<br><b style="font-size:16px">Total $${total.toFixed(2)}</b></p>
          <p style="margin-top:18px"><a href="https://fwwheelz.com/admin/" style="background:#e63946;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View in admin</a></p>
        </div>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'FW Wheels <orders@fwwheelz.com>',
          to: process.env.ORDER_NOTIFY_EMAIL.split(',').map((s) => s.trim()),
          subject: `New order — $${total.toFixed(2)} — ${name || email || 'FW Wheels'}`,
          html,
        }),
      }).catch((e) => console.error('Resend email failed:', e.message));
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
