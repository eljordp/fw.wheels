/* FW Wheels admin portal */
if (typeof supabase === 'undefined' || !window.FW_SUPABASE_URL) {
  document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('loginMsg');
    if (m) { m.className = 'msg err'; m.textContent = 'Could not load the login library — disable any ad-blocker for this site and refresh.'; }
  });
  throw new Error('supabase library or config missing');
}
const sb = supabase.createClient(window.FW_SUPABASE_URL, window.FW_SUPABASE_ANON);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = (n) => '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let CURRENT_USER = null;
const main = () => $('#main');

/* ---------------- AUTH ---------------- */
async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) return enterApp(session.user);
  $('#login').classList.remove('hidden');
}

let usePassword = true; // password is the default (magic-link email delivery is unreliable)
$('#togglePw').addEventListener('click', (e) => {
  e.preventDefault();
  usePassword = !usePassword;
  $('#pwField').style.display = usePassword ? 'block' : 'none';
  $('#loginBtn').textContent = usePassword ? 'Sign In' : 'Email me a login link';
  $('#togglePw').textContent = usePassword ? 'Email me a login link instead' : 'Use a password instead';
});

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#loginBtn'), msg = $('#loginMsg');
  const email = $('#email').value.trim();
  msg.className = 'msg'; btn.disabled = true;

  if (usePassword) {
    btn.textContent = 'Signing in…';
    const { data, error } = await sb.auth.signInWithPassword({ email, password: $('#password').value });
    btn.disabled = false; btn.textContent = 'Sign In';
    if (error) { msg.className = 'msg err'; msg.textContent = error.message; return; }
    enterApp(data.user);
  } else {
    btn.textContent = 'Sending…';
    const { error } = await sb.auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin + '/admin/' },
    });
    btn.disabled = false; btn.textContent = 'Email me a login link';
    if (error) { msg.className = 'msg err'; msg.textContent = error.message; return; }
    msg.className = 'msg ok'; msg.textContent = 'Check your email for a login link.';
  }
});

// handle magic-link return + auth state changes
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session && $('#app').classList.contains('hidden')) {
    enterApp(session.user);
  }
});

async function enterApp(user) {
  // confirm allowlisted admin (RLS also enforces this on every query)
  const { data: admin } = await sb.from('admin_users').select('full_name,role,email').eq('email', user.email).maybeSingle();
  if (!admin) {
    await sb.auth.signOut();
    $('#login').classList.remove('hidden');
    const msg = $('#loginMsg'); msg.className = 'msg err';
    msg.textContent = 'This account is not an authorized owner.';
    return;
  }
  CURRENT_USER = { ...user, ...admin };
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#whoName').textContent = admin.full_name || 'Owner';
  $('#whoEmail').textContent = user.email;
  $$('#nav .nav-item').forEach((n) => n.addEventListener('click', () => switchTab(n.dataset.tab)));
  $('#refreshBtn').addEventListener('click', refreshData);
  $('#logoutBtn').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });
  $('#changePwBtn').addEventListener('click', async () => {
    const pw = prompt('Enter a new password (at least 8 characters):');
    if (!pw) return;
    if (pw.length < 8) { alert('Password must be at least 8 characters.'); return; }
    const { error } = await sb.auth.updateUser({ password: pw });
    alert(error ? 'Could not update: ' + error.message : 'Password updated. Use it next time you sign in.');
  });
  switchTab('overview');
}

let currentTab = 'overview';
function switchTab(tab) {
  currentTab = tab;
  $$('#nav .nav-item').forEach((n) => n.classList.toggle('active', n.dataset.tab === tab));
  main().innerHTML = '<div class="loading">Loading…</div>';
  const fn = { overview, orders: ordersTab, products: productsTab, inventory: inventoryTab, customers: customersTab, leads: leadsTab, analytics: analyticsTab, seo: seoTab, worklog: worklogTab }[tab];
  fn().catch((e) => { main().innerHTML = `<div class="empty">Error: ${esc(e.message)}</div>`; console.error(e); });
}
async function refreshData() {
  const btn = $('#refreshBtn');
  if (btn) { btn.classList.add('spinning'); btn.disabled = true; }
  switchTab(currentTab);
  setTimeout(() => { if (btn) { btn.classList.remove('spinning'); btn.disabled = false; } }, 900);
}

/* ---------------- helpers ---------------- */
function kpiCard(label, val, delta) {
  return `<div class="kpi"><div class="label">${label}</div><div class="val">${val}</div>${delta ? `<div class="delta ${delta.dir}">${delta.text}</div>` : '<div class="delta">&nbsp;</div>'}</div>`;
}
function spark(values) {
  const max = Math.max(1, ...values.map((v) => v.v));
  return `<div class="spark">${values.map((v) => `<div class="b" style="height:${Math.max(2, (v.v / max) * 100)}%" title="${v.label}: ${v.disp ?? v.v}"></div>`).join('')}</div>`;
}
function dailyBuckets(rows, days, getVal) {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    buckets[d.toISOString().slice(0, 10)] = { label: fmtDate(d), v: 0 };
  }
  rows.forEach((r) => {
    const k = (r.created_at || '').slice(0, 10);
    if (buckets[k]) buckets[k].v += getVal ? getVal(r) : 1;
  });
  return Object.values(buckets);
}

/* ---------------- OVERVIEW ---------------- */
async function overview() {
  const since = daysAgo(30), prevSince = daysAgo(60);
  const [{ data: orders30 }, { data: ordersPrev }, { data: events30 }, { data: customers }, { data: items }] = await Promise.all([
    sb.from('orders').select('*').gte('created_at', since).order('created_at', { ascending: false }),
    sb.from('orders').select('amount_total,created_at').gte('created_at', prevSince).lt('created_at', since),
    sb.from('events').select('type,value,created_at').gte('created_at', since),
    sb.from('customers').select('id,total_spent'),
    sb.from('order_items').select('name,product_slug,qty,line_total,order_id'),
  ]);
  const o30 = orders30 || [], oPrev = ordersPrev || [], ev = events30 || [];
  const rev = o30.reduce((s, o) => s + Number(o.amount_total || 0), 0);
  const revPrev = oPrev.reduce((s, o) => s + Number(o.amount_total || 0), 0);
  const aov = o30.length ? rev / o30.length : 0;
  const revDelta = revPrev ? ((rev - revPrev) / revPrev) * 100 : 0;

  // funnel
  const ct = (t) => ev.filter((e) => e.type === t).length;
  const sessions = new Set(ev.filter((e) => e.type === 'page_view').map((e) => e.session_id || Math.random())).size;
  const fSteps = [
    { name: 'Page views', v: ct('page_view') },
    { name: 'Product views', v: ct('product_view') },
    { name: 'Add to cart', v: ct('add_to_cart') },
    { name: 'Checkout started', v: ct('begin_checkout') },
    { name: 'Purchases', v: o30.length },
  ];
  const fMax = Math.max(1, ...fSteps.map((s) => s.v));
  const conv = ct('page_view') ? (o30.length / ct('page_view')) * 100 : 0;

  // top products by revenue
  const prodAgg = {};
  (items || []).forEach((it) => {
    const k = it.name || it.product_slug || 'Item';
    prodAgg[k] = (prodAgg[k] || 0) + Number(it.line_total || 0);
  });
  const topProds = Object.entries(prodAgg).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const tpMax = Math.max(1, ...topProds.map((p) => p[1]));

  main().innerHTML = `
    <div class="page-head"><div><h2>Overview</h2><div class="sub">Last 30 days · ${CURRENT_USER.full_name || ''}</div></div></div>
    <div class="kpis">
      ${kpiCard('Revenue (30d)', money0(rev), { dir: revDelta >= 0 ? 'up' : 'down', text: `${revDelta >= 0 ? '▲' : '▼'} ${Math.abs(revDelta).toFixed(0)}% vs prev 30d` })}
      ${kpiCard('Orders (30d)', o30.length, { dir: o30.length >= oPrev.length ? 'up' : 'down', text: `${oPrev.length} prev period` })}
      ${kpiCard('Avg order value', money0(aov), null)}
      ${kpiCard('Conversion rate', conv.toFixed(2) + '%', { dir: 'up', text: `${sessions} sessions` })}
      ${kpiCard('Total customers', (customers || []).length, null)}
    </div>
    <div class="grid2">
      <div class="panel">
        <h3>Revenue <span class="hint">daily, last 30 days</span></h3>
        ${spark(dailyBuckets(o30, 30, (o) => Number(o.amount_total || 0)).map((b) => ({ ...b, disp: money0(b.v) })))}
      </div>
      <div class="panel">
        <h3>Conversion funnel <span class="hint">30d</span></h3>
        <div class="funnel">
          ${fSteps.map((s, i) => `<div class="fstep"><div class="fname">${s.name}</div><div class="fbar-track"><div class="fbar" style="width:${(s.v / fMax) * 100}%"></div></div><div class="fval">${s.v.toLocaleString()} ${i > 0 && fSteps[i - 1].v ? `<span class="fpct">${((s.v / fSteps[i - 1].v) * 100).toFixed(0)}%</span>` : ''}</div></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="grid2">
      <div class="panel">
        <h3>Recent orders</h3>
        ${o30.length ? `<div class="tbl-scroll"><table><thead><tr><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>
          ${o30.slice(0, 8).map((o) => `<tr><td>${fmtDateTime(o.created_at)}</td><td>${esc(o.customer_name || o.email || '—')}</td><td>${money(o.amount_total)}</td><td><span class="pill ${o.fulfillment_status}">${o.fulfillment_status}</span></td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty">No orders yet. They\'ll appear here automatically after checkout.</div>'}
      </div>
      <div class="panel">
        <h3>Top products <span class="hint">by revenue</span></h3>
        ${topProds.length ? `<div class="barlist">${topProds.map(([name, val]) => `<div class="barrow" style="grid-template-columns:1fr"><div><div class="lbl"><span>${esc(name)}</span><span class="cnt">${money0(val)}</span></div><div class="track"><div class="fill" style="width:${(val / tpMax) * 100}%"></div></div></div></div>`).join('')}</div>` : '<div class="empty">No sales data yet.</div>'}
      </div>
    </div>`;
}

/* ---------------- ORDERS ---------------- */
const STATUSES = ['new', 'processing', 'shipped', 'delivered', 'canceled', 'refunded'];
async function ordersTab() {
  const { data: orders } = await sb.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
  const all = orders || [];
  main().innerHTML = `
    <div class="page-head"><div><h2>Orders</h2><div class="sub">${all.length} total</div></div></div>
    <div class="toolbar">
      <input class="search" id="oSearch" placeholder="Search customer, email, order…" />
      <select id="oStatus"><option value="">All statuses</option>${STATUSES.map((s) => `<option>${s}</option>`).join('')}</select>
    </div>
    <div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody id="oBody"></tbody></table></div></div>`;
  const render = () => {
    const q = $('#oSearch').value.toLowerCase(), st = $('#oStatus').value;
    const rows = all.filter((o) => (!st || o.fulfillment_status === st) && (!q || `${o.customer_name} ${o.email} ${o.stripe_session_id}`.toLowerCase().includes(q)));
    $('#oBody').innerHTML = rows.length ? rows.map((o) => `<tr data-id="${o.id}" style="cursor:pointer">
        <td>${fmtDateTime(o.created_at)}</td>
        <td><b>${esc(o.customer_name || '—')}</b><br><span class="muted">${esc(o.email || '')}</span></td>
        <td class="muted">${o._itemCount ?? '·'}</td>
        <td><b>${money(o.amount_total)}</b></td>
        <td><span class="pill ${o.payment_status === 'paid' ? 'ok' : 'low'}">${esc(o.payment_status || '—')}</span></td>
        <td><select class="status-sel" data-id="${o.id}" onclick="event.stopPropagation()">${STATUSES.map((s) => `<option ${s === o.fulfillment_status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
        <td><button class="btn ghost sm view-order" data-id="${o.id}">View</button></td>
      </tr>`).join('') : '<tr><td colspan="7" class="empty">No matching orders.</td></tr>';
    $$('.status-sel').forEach((sel) => sel.addEventListener('change', async () => {
      await sb.from('orders').update({ fulfillment_status: sel.value }).eq('id', sel.dataset.id);
      const o = all.find((x) => x.id === sel.dataset.id); if (o) o.fulfillment_status = sel.value;
    }));
    $$('.view-order').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); openOrder(b.dataset.id); }));
  };
  $('#oSearch').addEventListener('input', render);
  $('#oStatus').addEventListener('change', render);
  render();
}

async function openOrder(id) {
  const { data: o } = await sb.from('orders').select('*').eq('id', id).single();
  const { data: items } = await sb.from('order_items').select('*').eq('order_id', id);
  const a = o.ship_address || {};
  openModal(`
    <button class="close" onclick="closeModal()">×</button>
    <h3>Order — ${money(o.amount_total)}</h3>
    <div class="muted" style="margin-bottom:6px">${fmtDateTime(o.created_at)} · ${esc(o.stripe_session_id || '')}</div>
    <div class="row">
      <div class="det"><div class="k">Customer</div>${esc(o.customer_name || '—')}<br>${esc(o.email || '')}<br>${esc(o.phone || '')}</div>
      <div class="det"><div class="k">Ship to</div>${esc(a.line1 || '')} ${esc(a.line2 || '')}<br>${esc(a.city || '')}, ${esc(a.state || '')} ${esc(a.postal_code || '')}</div>
    </div>
    <table style="margin:10px 0"><thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>
      ${(items || []).map((it) => `<tr><td>${esc(it.name)}${it.size ? ` <span class="muted">${esc(it.size)}</span>` : ''}${it.finish ? `<br><span class="muted">${esc(it.finish)} ${esc(it.bolt_config || '')}</span>` : ''}</td><td>${it.qty}</td><td>${money(it.line_total)}</td></tr>`).join('')}
    </tbody></table>
    <div class="det" style="text-align:right"><span class="muted">Subtotal ${money(o.amount_subtotal)} · Tax ${money(o.amount_tax)} · Ship ${money(o.amount_shipping)}</span><br><b style="font-size:16px">Total ${money(o.amount_total)}</b></div>
    <div class="row">
      <div class="seo-field" style="margin:0"><label>Carrier</label><input id="oCarrier" value="${esc(o.carrier || '')}" placeholder="UPS, FedEx…"/></div>
      <div class="seo-field" style="margin:0"><label>Tracking #</label><input id="oTrack" value="${esc(o.tracking_number || '')}"/></div>
    </div>
    <div class="seo-field"><label>Internal notes</label><textarea id="oNotes">${esc(o.notes || '')}</textarea></div>
    <button class="btn" id="oSave">Save order</button>`);
  $('#oSave').addEventListener('click', async () => {
    $('#oSave').textContent = 'Saving…';
    await sb.from('orders').update({ carrier: $('#oCarrier').value, tracking_number: $('#oTrack').value, notes: $('#oNotes').value }).eq('id', id);
    closeModal();
  });
}

/* ---------------- PRODUCTS ---------------- */
async function productsTab() {
  const { data: products } = await sb.from('products').select('*').order('kind').order('sort_order');
  const all = products || [];
  main().innerHTML = `
    <div class="page-head"><div><h2>Products</h2><div class="sub">${all.filter((p) => p.kind === 'wheel').length} wheels · ${all.filter((p) => p.kind === 'accessory').length} accessories</div></div><button class="btn sm" id="addProduct" style="width:auto">+ Add product</button></div>
    <div class="toolbar"><input class="search" id="pSearch" placeholder="Search products…"/><select id="pKind"><option value="">All types</option><option value="wheel">Wheels</option><option value="accessory">Accessories</option></select></div>
    <div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th></th><th>Name</th><th>Brand</th><th>Type</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody id="pBody"></tbody></table></div></div>`;
  const render = () => {
    const q = $('#pSearch').value.toLowerCase(), k = $('#pKind').value;
    const rows = all.filter((p) => (!k || p.kind === k) && (!q || `${p.name} ${p.brand} ${p.slug}`.toLowerCase().includes(q)));
    $('#pBody').innerHTML = rows.map((p) => {
      const img = (p.images && p.images[0]) || '';
      const price = p.kind === 'accessory' ? money(p.acc_price) : (p.price_range || '—');
      return `<tr>
        <td>${img ? `<img src="${esc(img)}" style="width:42px;height:42px;object-fit:cover;border-radius:7px;background:#222"/>` : ''}</td>
        <td><b>${esc(p.name)}</b><br><span class="muted">${esc(p.series || p.slug)}</span></td>
        <td>${esc(p.brand || '—')}</td><td class="muted">${p.kind}</td><td>${esc(price)}</td>
        <td><span class="pill ${p.active ? 'ok' : 'out'}">${p.active ? 'active' : 'hidden'}</span></td>
        <td><button class="btn ghost sm toggle-p" data-id="${p.id}" data-active="${p.active}">${p.active ? 'Hide' : 'Show'}</button></td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty">No products. Run the seed script to import the catalog.</td></tr>';
    $$('.toggle-p').forEach((b) => b.addEventListener('click', async () => {
      const newA = b.dataset.active !== 'true';
      await sb.from('products').update({ active: newA }).eq('id', b.dataset.id);
      const p = all.find((x) => x.id === b.dataset.id); if (p) p.active = newA; render();
    }));
  };
  $('#pSearch').addEventListener('input', render); $('#pKind').addEventListener('change', render);
  $('#addProduct').addEventListener('click', () => openProductForm());
  render();
}

/* ---------------- ADD PRODUCT ---------------- */
const BRANDS = ['Aodhan', 'Mflow Racing', 'Vors'];
const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function variantRow() {
  return `<tr class="vrow">
    <td><input class="num-in v-size" style="width:80px" placeholder="18x9.5"/></td>
    <td>$<input class="num-in v-price" type="number" placeholder="237"/></td>
    <td><input class="v-finishes" style="width:150px;padding:6px 8px;background:var(--surface);border:1px solid var(--border);border-radius:7px;color:var(--text)" placeholder="Gloss Black, Bronze"/></td>
    <td><input class="num-in v-bolt" style="width:90px" placeholder="5x114.3"/></td>
    <td><input class="num-in v-offset" style="width:60px" placeholder="+35"/></td>
    <td><input class="num-in v-cb" style="width:60px" placeholder="73.1"/></td>
    <td><input class="num-in v-stock" type="number" value="0" style="width:60px"/></td>
    <td><input type="checkbox" class="v-track"/></td>
    <td><button type="button" class="btn ghost sm v-del">✕</button></td>
  </tr>`;
}
function openProductForm() {
  openModal(`
    <button class="close" onclick="closeModal()">×</button>
    <h3>Add product</h3>
    <div class="seo-field" style="margin-top:12px"><label>Type</label>
      <select id="fpType" style="width:100%;padding:11px 13px;background:var(--surface);border:1px solid var(--border);border-radius:9px;color:var(--text)">
        <option value="wheel">Wheel</option><option value="accessory">Accessory</option>
      </select>
    </div>
    <div id="wheelFields">
      <div class="row">
        <div class="seo-field" style="margin:0"><label>Brand</label><select id="fpBrand" style="width:100%;padding:11px 13px;background:var(--surface);border:1px solid var(--border);border-radius:9px;color:var(--text)">${BRANDS.map((b) => `<option>${b}</option>`).join('')}</select></div>
        <div class="seo-field" style="margin:0"><label>Series (label)</label><input id="fpSeries" placeholder="AH Series — Multi-Spoke"/></div>
      </div>
      <div class="row">
        <div class="seo-field" style="margin:0"><label>Model name</label><input id="fpName" placeholder="AODHAN AH12"/></div>
        <div class="seo-field" style="margin:0"><label>Center bore</label><input id="fpCB" placeholder="73.1mm"/></div>
      </div>
      <div class="seo-field"><label>Main image URL</label><input id="fpImage" placeholder="https://…"/></div>
      <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Sizes & pricing</label>
      <div class="tbl-scroll"><table style="font-size:12px"><thead><tr><th>Size</th><th>Price</th><th>Finishes</th><th>Bolt</th><th>Offset</th><th>CB</th><th>Stock</th><th>Track</th><th></th></tr></thead><tbody id="vbody">${variantRow()}</tbody></table></div>
      <button type="button" class="btn ghost sm" id="addVariant" style="margin-top:10px">+ Add size</button>
    </div>
    <div id="accFields" style="display:none">
      <div class="row">
        <div class="seo-field" style="margin:0"><label>Name</label><input id="faName" placeholder="Lug Nuts — Black"/></div>
        <div class="seo-field" style="margin:0"><label>Price</label><input id="faPrice" type="number" placeholder="60"/></div>
      </div>
      <div class="row">
        <div class="seo-field" style="margin:0"><label>Pack</label><input id="faPack" placeholder="Set of 20"/></div>
        <div class="seo-field" style="margin:0"><label>Image URL</label><input id="faImage" placeholder="https://…"/></div>
      </div>
      <div class="seo-field"><label>Description</label><textarea id="faDesc"></textarea></div>
    </div>
    <div class="msg" id="fpMsg"></div>
    <button class="btn" id="fpSave" style="margin-top:14px">Save product</button>`);

  $('#fpType').addEventListener('change', () => {
    const wheel = $('#fpType').value === 'wheel';
    $('#wheelFields').style.display = wheel ? '' : 'none';
    $('#accFields').style.display = wheel ? 'none' : '';
  });
  $('#addVariant').addEventListener('click', () => { $('#vbody').insertAdjacentHTML('beforeend', variantRow()); bindVdel(); });
  const bindVdel = () => $$('.v-del').forEach((b) => { b.onclick = () => { if ($$('.vrow').length > 1) b.closest('tr').remove(); }; });
  bindVdel();
  $('#fpSave').addEventListener('click', saveProduct);
}

async function saveProduct() {
  const msg = $('#fpMsg'); msg.className = 'msg';
  const btn = $('#fpSave'); btn.disabled = true; btn.textContent = 'Saving…';
  const fail = (m) => { msg.className = 'msg err'; msg.textContent = m; btn.disabled = false; btn.textContent = 'Save product'; };
  try {
    const type = $('#fpType').value;
    if (type === 'accessory') {
      const name = $('#faName').value.trim();
      if (!name) return fail('Name is required.');
      const slug = slugify(name);
      const { error } = await sb.from('products').insert([{
        slug, kind: 'accessory', name, acc_price: Number($('#faPrice').value) || 0,
        acc_pack: $('#faPack').value.trim() || null, acc_desc: $('#faDesc').value.trim() || null,
        images: $('#faImage').value.trim() ? [$('#faImage').value.trim()] : [], active: true, sort_order: 999,
      }]);
      if (error) return fail(error.message);
    } else {
      const name = $('#fpName').value.trim();
      if (!name) return fail('Model name is required.');
      const rows = $$('.vrow').map((r) => ({
        size: r.querySelector('.v-size').value.trim(),
        price: Number(r.querySelector('.v-price').value) || 0,
        finishes: r.querySelector('.v-finishes').value.split(',').map((s) => s.trim()).filter(Boolean),
        bolt: r.querySelector('.v-bolt').value.trim(),
        offset: r.querySelector('.v-offset').value.trim(),
        cb: r.querySelector('.v-cb').value.trim(),
        stock: parseInt(r.querySelector('.v-stock').value || '0', 10),
        track: r.querySelector('.v-track').checked,
      })).filter((v) => v.size && v.price);
      if (!rows.length) return fail('Add at least one size with a price.');
      const slug = slugify(name);
      const img = $('#fpImage').value.trim();
      const { data: prod, error } = await sb.from('products').insert([{
        slug, kind: 'wheel', brand: $('#fpBrand').value, series: $('#fpSeries').value.trim() || 'New Arrivals',
        name, center_bore: $('#fpCB').value.trim() || null, images: img ? [img] : [], active: true, sort_order: 999,
      }]).select('id').single();
      if (error) return fail(error.message);
      const variants = rows.map((v) => ({
        product_id: prod.id, size: v.size, price: v.price, finishes: v.finishes,
        bolt_patterns: v.bolt ? [v.bolt] : [], offsets: v.offset ? [v.offset] : [],
        bolt_configs: v.bolt ? [{ bolt: v.bolt, offset: v.offset, cb: v.cb }] : null,
        stock: v.stock, track_stock: v.track, image: img || null,
      }));
      const { error: ve } = await sb.from('product_variants').insert(variants);
      if (ve) return fail('Product saved but sizes failed: ' + ve.message);
    }
    closeModal();
    productsTab();
  } catch (e) { fail(e.message); }
}

/* ---------------- INVENTORY ---------------- */
async function inventoryTab() {
  const [{ data: variants }, { data: products }] = await Promise.all([
    sb.from('product_variants').select('*').order('product_id'),
    sb.from('products').select('id,name,slug,brand'),
  ]);
  const pmap = {}; (products || []).forEach((p) => (pmap[p.id] = p));
  const all = (variants || []).map((v) => ({ ...v, _p: pmap[v.product_id] || {} }));
  const lowCount = all.filter((v) => v.track_stock && v.stock <= v.low_stock_at).length;
  main().innerHTML = `
    <div class="page-head"><div><h2>Inventory</h2><div class="sub">${all.length} SKUs · ${lowCount} low/out of stock</div></div></div>
    <div class="muted" style="margin:-4px 0 14px;font-size:13px;line-height:1.5">
      <b>How this works:</b> SKUs are <b>Made to order</b> (always available) unless you tick <b>Track stock</b>.
      Tick it for a size you actually count, then set <b>Stock</b> + a <b>Low&nbsp;at</b> threshold.
      When stock drops to that threshold, the site shows <b>“🔥 Only X left”</b> on that size to push the sale. Hit 0 → it flips to “Sold out” + a notify-me capture.
    </div>
    <div class="toolbar">
      <input class="search" id="iSearch" placeholder="Search by model or size…"/>
      <select id="iFilter"><option value="">All SKUs</option><option value="tracked">Stock-tracked</option><option value="low">Low / out of stock</option></select>
      <span class="muted" style="margin-left:auto">Edit inline — saves on change</span>
    </div>
    <div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Model</th><th>Size</th><th>Price</th><th>Track stock</th><th>Stock</th><th>Low at</th><th>Status</th></tr></thead><tbody id="iBody"></tbody></table></div></div>`;
  const render = () => {
    const q = $('#iSearch').value.toLowerCase(), f = $('#iFilter').value;
    let rows = all.filter((v) => !q || `${v._p.name} ${v.size} ${v._p.brand}`.toLowerCase().includes(q));
    if (f === 'tracked') rows = rows.filter((v) => v.track_stock);
    if (f === 'low') rows = rows.filter((v) => v.track_stock && v.stock <= v.low_stock_at);
    $('#iBody').innerHTML = rows.map((v) => {
      const lowAt = v.low_stock_at == null ? 3 : v.low_stock_at;
      const status = !v.track_stock ? '<span class="pill ok">made to order</span>' : v.stock <= 0 ? '<span class="pill out">sold out</span>' : v.stock <= lowAt ? `<span class="pill low">🔥 only ${v.stock} left</span>` : '<span class="pill ok">in stock</span>';
      return `<tr>
        <td><b>${esc(v._p.name || '—')}</b><br><span class="muted">${esc(v._p.brand || '')}</span></td>
        <td>${esc(v.size)}</td>
        <td>$<input class="num-in price-in" data-id="${v.id}" type="number" step="1" value="${Number(v.price)}"/></td>
        <td><input type="checkbox" class="track-in" data-id="${v.id}" ${v.track_stock ? 'checked' : ''}/></td>
        <td>${v.track_stock ? `<input class="num-in stock-in" data-id="${v.id}" type="number" step="1" value="${v.stock}"/>` : '<span class="muted">made to order</span>'}</td>
        <td>${v.track_stock ? `<input class="num-in low-in" data-id="${v.id}" type="number" step="1" min="1" value="${lowAt}" style="width:56px" title="Show ‘Only X left’ urgency at or below this number"/>` : '<span class="muted">—</span>'}</td>
        <td>${status}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty">No SKUs.</td></tr>';
    $$('.price-in').forEach((el) => el.addEventListener('change', async () => { await sb.from('product_variants').update({ price: Number(el.value) }).eq('id', el.dataset.id); flash(el); }));
    $$('.stock-in').forEach((el) => el.addEventListener('change', async () => { await sb.from('product_variants').update({ stock: parseInt(el.value || 0, 10) }).eq('id', el.dataset.id); const v = all.find((x) => x.id === el.dataset.id); if (v) v.stock = parseInt(el.value || 0, 10); flash(el); render(); }));
    $$('.low-in').forEach((el) => el.addEventListener('change', async () => { const n = Math.max(1, parseInt(el.value || 1, 10)); await sb.from('product_variants').update({ low_stock_at: n }).eq('id', el.dataset.id); const v = all.find((x) => x.id === el.dataset.id); if (v) v.low_stock_at = n; flash(el); render(); }));
    $$('.track-in').forEach((el) => el.addEventListener('change', async () => { await sb.from('product_variants').update({ track_stock: el.checked }).eq('id', el.dataset.id); const v = all.find((x) => x.id === el.dataset.id); if (v) v.track_stock = el.checked; render(); }));
  };
  const flash = (el) => { el.style.borderColor = 'var(--green)'; setTimeout(() => (el.style.borderColor = ''), 600); };
  $('#iSearch').addEventListener('input', render); $('#iFilter').addEventListener('change', render); render();
}

/* ---------------- CUSTOMERS ---------------- */
async function customersTab() {
  const { data: customers } = await sb.from('customers').select('*').order('total_spent', { ascending: false }).limit(500);
  const all = customers || [];
  const ltv = all.length ? all.reduce((s, c) => s + Number(c.total_spent || 0), 0) / all.length : 0;
  const repeat = all.filter((c) => c.orders_count > 1).length;
  main().innerHTML = `
    <div class="page-head"><div><h2>Customers</h2><div class="sub">${all.length} total</div></div></div>
    <div class="kpis">
      ${kpiCard('Total customers', all.length, null)}
      ${kpiCard('Avg lifetime value', money0(ltv), null)}
      ${kpiCard('Repeat buyers', repeat, { dir: 'up', text: all.length ? `${((repeat / all.length) * 100).toFixed(0)}% of base` : '' })}
    </div>
    <div class="toolbar"><input class="search" id="cSearch" placeholder="Search customers…"/></div>
    <div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Customer</th><th>Location</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead><tbody id="cBody"></tbody></table></div></div>`;
  const render = () => {
    const q = $('#cSearch').value.toLowerCase();
    const rows = all.filter((c) => !q || `${c.name} ${c.email}`.toLowerCase().includes(q));
    $('#cBody').innerHTML = rows.map((c) => `<tr>
        <td><b>${esc(c.name || '—')}</b><br><span class="muted">${esc(c.email)}</span></td>
        <td class="muted">${esc([c.city, c.state].filter(Boolean).join(', ') || '—')}</td>
        <td>${c.orders_count}</td><td><b>${money(c.total_spent)}</b></td>
        <td class="muted">${c.last_order_at ? fmtDate(c.last_order_at) : '—'}</td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty">No customers yet.</td></tr>';
  };
  $('#cSearch').addEventListener('input', render); render();
}

/* ---------------- LEADS ---------------- */
async function leadsTab() {
  const { data: leads } = await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(2000);
  const all = leads || [];
  const since7 = daysAgo(7);
  const week = all.filter((l) => l.created_at >= since7).length;
  const sms = all.filter((l) => l.sms_opt_in).length;
  const notify = all.filter((l) => l.source === 'notify-back-in-stock').length;
  const garage = all.filter((l) => l.source === 'garage').length;
  const srcLabel = (s) => s === 'notify-back-in-stock' ? 'Back-in-stock' : (s === 'footer' ? 'Newsletter' : (s === 'garage' ? 'Garage (car)' : (s || '—')));
  const wanted = (l) => (l.source === 'notify-back-in-stock' && l.meta) ? `${l.meta.name || l.product_slug || ''}${l.meta.size ? ' · ' + l.meta.size : ''}` : '';
  // Garage leads store the customer's car in meta.vehicle; back-in-stock store the wanted item.
  const detail = (l) => (l.source === 'garage' && l.meta && l.meta.vehicle) ? l.meta.vehicle : wanted(l);
  main().innerHTML = `
    <div class="page-head"><div><h2>Leads</h2><div class="sub">Email & SMS signups + back-in-stock requests</div></div>${all.length ? '<button class="btn sm" id="leadCsv" style="width:auto">Export CSV</button>' : ''}</div>
    <div class="kpis">
      ${kpiCard('Total leads', all.length, null)}
      ${kpiCard('New (7 days)', week, { dir: 'up', text: 'last 7 days' })}
      ${kpiCard('SMS opt-ins', sms, { dir: 'up', text: all.length ? `${((sms / all.length) * 100).toFixed(0)}% of list` : '' })}
      ${kpiCard('Back-in-stock requests', notify, { dir: 'up', text: 'demand to restock' })}
      ${kpiCard('Cars saved', garage, { dir: 'up', text: 'garage signups' })}
    </div>
    <div class="toolbar"><input class="search" id="lSearch" placeholder="Search email, phone, car, item…"/>
      <select id="lSrc"><option value="">All sources</option><option value="footer">Newsletter</option><option value="garage">Garage (car)</option><option value="notify-back-in-stock">Back-in-stock</option></select></div>
    <div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Email</th><th>Phone</th><th>SMS</th><th>Source</th><th>Vehicle / item</th><th>Date</th></tr></thead><tbody id="lBody"></tbody></table></div></div>`;
  const render = () => {
    const q = $('#lSearch').value.toLowerCase(), src = $('#lSrc').value;
    const rows = all.filter((l) => (!src || l.source === src) && (!q || `${l.email || ''} ${l.phone || ''} ${detail(l)}`.toLowerCase().includes(q)));
    $('#lBody').innerHTML = rows.map((l) => `<tr>
        <td><b>${esc(l.email || '—')}</b></td>
        <td class="muted">${esc(l.phone || '—')}</td>
        <td>${l.sms_opt_in ? '<span class="pill ok">yes</span>' : '<span class="muted">—</span>'}</td>
        <td>${(l.source === 'notify-back-in-stock' || l.source === 'garage') ? `<span class="pill low">${srcLabel(l.source)}</span>` : `<span class="muted">${esc(srcLabel(l.source))}</span>`}</td>
        <td>${detail(l) ? esc(detail(l)) : '<span class="muted">—</span>'}</td>
        <td class="muted">${fmtDateTime(l.created_at)}</td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty">No leads yet. They appear when people sign up or ask to be notified when something\'s back.</td></tr>';
  };
  $('#lSearch').addEventListener('input', render); $('#lSrc').addEventListener('change', render); render();
  const csvBtn = $('#leadCsv');
  if (csvBtn) csvBtn.addEventListener('click', () => {
    const head = 'email,phone,sms_opt_in,source,vehicle_or_item,created_at\n';
    const body = all.map((l) => [l.email || '', l.phone || '', l.sms_opt_in, l.source || '', detail(l), l.created_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([head + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'fw-wheels-leads.csv';
    a.click();
  });
}

/* ---------------- ANALYTICS ---------------- */
async function analyticsTab() {
  const since = daysAgo(30);
  const { data: events } = await sb.from('events').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(20000);
  const ev = events || [];
  const ct = (t) => ev.filter((e) => e.type === t).length;
  const pv = ev.filter((e) => e.type === 'page_view');
  const sessions = new Set(pv.map((e) => e.session_id)).size;

  // top viewed products
  const viewAgg = {};
  ev.filter((e) => e.type === 'product_view').forEach((e) => { const k = (e.meta && e.meta.name) || e.product_slug || '—'; viewAgg[k] = (viewAgg[k] || 0) + 1; });
  const topViews = Object.entries(viewAgg).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const tvMax = Math.max(1, ...topViews.map((x) => x[1]));

  // top fitment searches
  const fitAgg = {};
  ev.filter((e) => e.type === 'fitment_search').forEach((e) => { const k = (e.meta && e.meta.vehicle) || '—'; if (k && k !== '—') fitAgg[k] = (fitAgg[k] || 0) + 1; });
  const topFit = Object.entries(fitAgg).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const tfMax = Math.max(1, ...topFit.map((x) => x[1]));

  // referrers
  const refAgg = {};
  pv.forEach((e) => { let r = e.referrer || 'Direct'; try { if (r !== 'Direct') r = new URL(r).hostname.replace('www.', ''); } catch (x) {} if (r.includes('fwwheelz')) r = 'Internal'; refAgg[r] = (refAgg[r] || 0) + 1; });
  const topRef = Object.entries(refAgg).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const trMax = Math.max(1, ...topRef.map((x) => x[1]));

  const dropCartToCheckout = ct('add_to_cart') ? (100 - (ct('begin_checkout') / ct('add_to_cart')) * 100) : 0;

  main().innerHTML = `
    <div class="page-head"><div><h2>Analytics</h2><div class="sub">Last 30 days · first-party, no cookies</div></div></div>
    <div class="kpis">
      ${kpiCard('Page views', ct('page_view').toLocaleString(), null)}
      ${kpiCard('Unique sessions', sessions.toLocaleString(), null)}
      ${kpiCard('Product views', ct('product_view').toLocaleString(), null)}
      ${kpiCard('Fitment searches', ct('fitment_search').toLocaleString(), null)}
      ${kpiCard('Cart→checkout drop', dropCartToCheckout.toFixed(0) + '%', { dir: dropCartToCheckout > 60 ? 'down' : 'up', text: 'lower is better' })}
    </div>
    <div class="panel" style="margin-bottom:18px"><h3>Traffic <span class="hint">page views / day</span></h3>${spark(dailyBuckets(pv, 30))}</div>
    <div class="grid2">
      <div class="panel"><h3>Most-viewed products <span class="hint">bottleneck: high views, low sales = price/availability issue</span></h3>
        ${topViews.length ? `<div class="barlist">${topViews.map(([n, c]) => barRow(n, c, tvMax)).join('')}</div>` : '<div class="empty">No product views yet.</div>'}
      </div>
      <div class="panel"><h3>Top vehicle searches <span class="hint">what fitments people want</span></h3>
        ${topFit.length ? `<div class="barlist">${topFit.map(([n, c]) => barRow(n, c, tfMax)).join('')}</div>` : '<div class="empty">No fitment searches yet.</div>'}
      </div>
    </div>
    <div class="grid2">
      <div class="panel"><h3>Traffic sources</h3>
        ${topRef.length ? `<div class="barlist">${topRef.map(([n, c]) => barRow(n, c, trMax)).join('')}</div>` : '<div class="empty">No traffic data yet.</div>'}
      </div>
      <div class="panel"><h3>Funnel breakdown <span class="hint">30d</span></h3>
        <div class="funnel">
          ${[['Page views', ct('page_view')], ['Product views', ct('product_view')], ['Add to cart', ct('add_to_cart')], ['Checkout', ct('begin_checkout')], ['Purchase', ct('purchase')]].map(([n, v], i, arr) => `<div class="fstep"><div class="fname">${n}</div><div class="fbar-track"><div class="fbar" style="width:${(v / Math.max(1, arr[0][1])) * 100}%"></div></div><div class="fval">${v.toLocaleString()}</div></div>`).join('')}
        </div>
      </div>
    </div>`;
}
function barRow(name, cnt, max) {
  return `<div class="barrow" style="grid-template-columns:1fr"><div><div class="lbl"><span>${esc(name)}</span><span class="cnt">${cnt}</span></div><div class="track"><div class="fill" style="width:${(cnt / max) * 100}%"></div></div></div></div>`;
}

/* ---------------- SEO & SETTINGS ---------------- */
const SEO_FIELDS = [
  ['site_title', 'Site title (browser tab / search result title)', 'input'],
  ['meta_description', 'Meta description (search snippet, ~155 chars)', 'textarea'],
  ['og_image', 'Social share image URL (Open Graph)', 'input'],
  ['keywords', 'Keywords (comma separated)', 'input'],
];
const STORE_FIELDS = [
  ['support_email', 'Support email', 'input'],
  ['support_phone', 'Support phone', 'input'],
  ['announcement', 'Storefront announcement bar (leave blank to hide)', 'input'],
  ['free_shipping_note', 'Free shipping note', 'input'],
];
const RANK_STATUSES = ['Not ranking yet', 'Tracking…'];
async function seoTab() {
  main().innerHTML = '<div class="loading">Loading SEO…</div>';
  // pull latest rank snapshot per query + settings, and kick off the live GSC fetch
  const [{ data: ranks }, { data: settingRows }] = await Promise.all([
    sb.from('seo_rankings').select('*').order('sort_order'),
    sb.from('settings').select('*'),
  ]);
  const rows = ranks || [];
  const vals = {}; (settingRows || []).forEach((r) => (vals[r.key] = r.value));

  const top3 = rows.filter((r) => r.rank != null && r.rank <= 3).length;
  const top10 = rows.filter((r) => r.rank != null && r.rank <= 10).length;
  const notRanking = rows.filter((r) => r.rank == null).length;
  const rankCell = (r) => r.rank == null
    ? '<span class="muted">Not ranking yet</span>'
    : `<span style="color:${r.rank <= 3 ? 'var(--green)' : r.rank <= 10 ? 'var(--gold)' : 'var(--text)'};font-weight:700">#${r.rank}</span>`;

  main().innerHTML = `
    <div class="page-head"><div><h2>SEO</h2><div class="sub">Track Google rankings, see live search data, and learn what moves the needle.</div></div></div>

    <div class="kpis">
      ${kpiCard('Tracked searches', rows.length, null)}
      ${kpiCard('Ranking top 3', top3, top3 ? { dir: 'up', text: 'great' } : null)}
      ${kpiCard('Ranking top 10', top10, null)}
      ${kpiCard('Not ranking yet', notRanking, null)}
    </div>

    <div class="panel" style="margin-bottom:18px">
      <h3>Target keywords <span class="hint">what we want to rank for · edit rank as you check Google</span></h3>
      <div class="tbl-scroll"><table><thead><tr><th>Search term</th><th>Area</th><th>Rank</th><th>Local pack</th><th>Notes / competitors</th></tr></thead><tbody id="rankBody">
        ${rows.map((r) => `<tr>
          <td><b>${esc(r.query)}</b></td>
          <td class="muted">${esc(r.area || '—')}</td>
          <td><input class="num-in rank-in" data-id="${r.id}" type="number" min="1" placeholder="—" value="${r.rank ?? ''}" style="width:64px"/></td>
          <td><input type="checkbox" class="lp-in" data-id="${r.id}" ${r.local_pack ? 'checked' : ''}/></td>
          <td class="muted" style="max-width:380px;font-size:12px">${esc(r.notes || '')}</td>
        </tr>`).join('')}
      </tbody></table></div>
      <div class="muted" style="font-size:12px;margin-top:10px">Tip: search each term in a Google incognito window and type the position you see (or leave blank if not in the top 20). This is your scoreboard.</div>
    </div>

    <div class="panel" style="margin-bottom:18px">
      <h3>🌐 Google Search Console (live) <span class="hint">real clicks, impressions & position — last 28 days</span></h3>
      <div id="gscBox"><div class="loading" style="padding:24px">Loading live search data…</div></div>
    </div>

    <div class="panel" style="margin-bottom:18px">
      <h3>📈 How to get FW Wheels ranked <span class="hint">your playbook</span></h3>
      <div style="font-size:13.5px;line-height:1.7">
        <p style="margin-bottom:10px"><b>The 4 levers, in order of payoff for a new wheel store:</b></p>
        <ol style="margin:0 0 14px 20px;display:flex;flex-direction:column;gap:8px">
          <li><b>Google Business Profile</b> — free, fastest local win. Create/claim it for FW Wheels so you show up in the map pack for "wheels near me." Add photos, hours, and the website link.</li>
          <li><b>Brand &amp; model pages</b> — each brand (Aodhan, Vors, Mflow) and popular model (e.g. AH02) should have its own page with the model name in the title. These rank easiest because competition is low. Start with Vors/Mflow (least competitive).</li>
          <li><b>Fitment content</b> — pages/articles like "5x114.3 wheels" and "wheel offset explained" pull in huge search volume and show off the fitment tool. Answer the questions buyers actually type.</li>
          <li><b>Backlinks &amp; reviews</b> — get listed on car forums, IG, and supplier directories; collect Google reviews. This is what tips you from page 2 to page 1 over time.</li>
        </ol>
        <p class="muted" style="font-size:12.5px">Watch the Search Console table above: when a query shows <b>lots of impressions but high position (20+) and few clicks</b>, that's a keyword you're <i>close</i> on — make/improve a page for it and it'll climb. That's the loop. Track your wins in the keyword table.</p>
      </div>
    </div>

    <div class="panel">
      <h3>Site SEO &amp; store settings <span class="hint">title, meta, announcement bar</span> <button class="btn sm" id="saveSeo" style="width:auto;float:right">Save</button></h3>
      <div class="grid2" style="margin-top:6px">
        <div>${SEO_FIELDS.map(field).join('')}</div>
        <div>${STORE_FIELDS.map(field).join('')}</div>
      </div>
      <div class="msg" id="seoMsg"></div>
    </div>`;

  function field([key, label, type]) {
    const v = esc(vals[key] ?? '');
    return `<div class="seo-field"><label>${label}</label>${type === 'textarea' ? `<textarea data-key="${key}">${v}</textarea>` : `<input data-key="${key}" value="${v}"/>`}</div>`;
  }

  // inline rank/local-pack edits
  $$('.rank-in').forEach((el) => el.addEventListener('change', async () => {
    const rank = el.value === '' ? null : parseInt(el.value, 10);
    await sb.from('seo_rankings').update({ rank, source: 'manual', checked_at: new Date().toISOString() }).eq('id', el.dataset.id);
    seoTab();
  }));
  $$('.lp-in').forEach((el) => el.addEventListener('change', async () => {
    await sb.from('seo_rankings').update({ local_pack: el.checked }).eq('id', el.dataset.id);
  }));

  // settings save
  $('#saveSeo').addEventListener('click', async () => {
    const btn = $('#saveSeo'); btn.textContent = 'Saving…'; btn.disabled = true;
    const updates = $$('[data-key]').map((el) => ({ key: el.dataset.key, value: el.value, updated_at: new Date().toISOString() }));
    const { error } = await sb.from('settings').upsert(updates, { onConflict: 'key' });
    btn.textContent = 'Save'; btn.disabled = false;
    const msg = $('#seoMsg'); msg.className = error ? 'msg err' : 'msg ok'; msg.textContent = error ? error.message : 'Saved.';
    setTimeout(() => (msg.className = 'msg'), 2500);
  });

  // live GSC
  loadGSC();
}

async function loadGSC() {
  const box = $('#gscBox'); if (!box) return;
  try {
    const res = await fetch('/api/gsc');
    const data = await res.json();
    if (!data.configured) {
      box.innerHTML = `<div class="empty" style="padding:24px;text-align:left">
        <b>Not connected yet.</b><br><span class="muted">Live Google data turns on once the Search Console service account is linked to fwwheelz.com. Until then, the keyword table above is your tracker.</span></div>`;
      return;
    }
    if (data.error) {
      const perm = /permission|not found|insufficient/i.test(data.error);
      box.innerHTML = perm
        ? `<div class="empty" style="padding:24px;text-align:left"><b>Almost connected.</b><br><span class="muted">The Google service account is set up but hasn't been given access to the fwwheelz.com property yet. Add <b>tss-gsc-reader@the-sticker-smith.iam.gserviceaccount.com</b> as a user in Search Console (Settings → Users and permissions) and live data shows up here.</span></div>`
        : `<div class="empty" style="padding:24px">Search Console error: ${esc(data.error)}</div>`;
      return;
    }
    const q = data.queries || [];
    if (!q.length) { box.innerHTML = '<div class="empty" style="padding:24px">No search impressions yet (new site). Check back as Google starts showing FW Wheels.</div>'; return; }
    box.innerHTML = `<div class="tbl-scroll"><table><thead><tr><th>Search query</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Avg position</th></tr></thead><tbody>
      ${q.map((r) => `<tr>
        <td>${esc(r.query)}${r.variants > 1 ? ` <span class="muted">+${r.variants - 1} variant${r.variants > 2 ? 's' : ''}</span>` : ''}</td>
        <td><b style="color:${r.clicks ? 'var(--green)' : 'var(--muted)'}">${r.clicks}</b></td>
        <td>${r.impressions.toLocaleString()}</td>
        <td>${(r.ctr * 100).toFixed(1)}%</td>
        <td>${r.position.toFixed(1)}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  } catch (e) {
    box.innerHTML = `<div class="empty" style="padding:24px">Couldn't load live data: ${esc(e.message)}</div>`;
  }
}

/* ---------------- modal ---------------- */
function openModal(html) { $('#modalRoot').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`; }
function closeModal() { $('#modalRoot').innerHTML = ''; }
window.closeModal = closeModal;

/* ---------------- Work Log ---------------- */
const WORK_LOG = [
  { date: '2026-06-17', cat: 'Admin', title: 'Owner admin + lead capture polish', detail: 'Footer lead capture is now no-friction — buyers and already-subscribed visitors stop seeing the prompt. Added this Work Log tab so you can see every update in one place.', items: [
    'Hidden the footer signup form for visitors who already signed up or just completed checkout',
    'Captures Stripe success redirects automatically (no double-prompts after a purchase)',
    'Built this Work Log tab so the build history lives inside the real admin',
  ] },
  { date: '2026-06-16', cat: 'Admin', title: 'Inventory portal + Owner admin foundations', detail: 'Spun up the owner admin with inventory status controls and laid the foundation for the rest of the admin tabs.', items: [
    'Inventory admin with status controls (Active, Preorder, Backorder, Sold out, Hidden) and per-product owner notes',
    'One-click Copy / Download JSON to publish inventory updates to the live site',
    'Notify-me-when-back-in-stock capture on out-of-stock products',
  ] },
  { date: '2026-06-15', cat: 'Analytics', title: 'GA4 + lead capture + admin Leads tab', detail: 'Added Google Analytics 4 across the site, plus an email/SMS lead capture wired to a new Leads tab in the admin.', items: [
    'Added Google Analytics 4 (G-DB1RHQBZX5) via shared ga.js on all storefront pages',
    'Built the email + SMS lead capture and the matching Leads tab in this admin',
    'Notify-me on back-in-stock now flows into Leads too',
  ] },
  { date: '2026-06-05', cat: 'Store', title: 'Storefront fitment + silver defaults', detail: 'Polished the buyer experience: fitment search on the storefront and silver as the default wheel finish.', items: [
    'Shipped storefront fitment so customers can find wheels by year/make/model',
    'Defaulted all wheel cards to silver finish for consistency',
    'Fixed valve stem accessory image',
  ] },
  { date: '2026-05-17', cat: 'Store', title: 'Full e-commerce live', detail: 'Cart drawer plus Stripe Checkout — the site now sells directly.', items: [
    'Built the cart drawer (add, remove, edit quantities)',
    'Integrated Stripe Checkout for live payments',
    'Wired the post-payment notification email so you get pinged on every order',
  ] },
  { date: '2026-05-07', cat: 'Fixes', title: 'MFlow inventory + phone number', detail: 'Bug-fix sweep, MFlow data refresh, and contact phone surfaced.', items: [
    'Refreshed MFlow inventory data',
    'Added phone number to contact details',
    "Removed the Builds section that didn't fit the shop flow",
    'Multiple small bug fixes',
  ] },
  { date: '2026-04-21', cat: 'Data', title: 'Real pricing + Vors bolt configs + video hero', detail: 'Replaced placeholders with real manufacturer pricing, added bolt configurations, and a cinematic video hero.', items: [
    'Pulled real pricing from manufacturer inventory spreadsheets across all brands',
    'Added complete Vors bolt configurations from the inventory spreadsheet',
    'Merged bolt and offset into one filter (cleaner UX)',
    'Added gallery carousel',
    'Replaced static hero with looping dark cinematic wheel close-up (400 KB, lightweight)',
  ] },
  { date: '2026-04-20', cat: 'Design', title: 'Dark theme overhaul — kill the AI look', detail: 'A big day of design upgrades: dark theme, Barlow typography, accessories lineup, sizing chart, weight + lip data, reviews section.', items: [
    'Full dark theme overhaul to kill the AI-template look',
    'Switched typography from Inter to Barlow (tighter, more automotive feel)',
    'Matched every wheel to the correct offsets per bolt pattern across all 3 brands',
    'Added Vors and MFlow weight + lip data, fixed MFlow pricing',
    'Locked contact to Instagram only',
    'Added sizing chart, weight/lip specs, and a reviews section',
    'Added a full accessories lineup',
  ] },
  { date: '2026-04-11', cat: 'Imagery', title: "Image fixes + Enay's 4/1 change list", detail: "Knocked out Enay's requested fixes and corrected three broken wheel card images.", items: [
    'Fixed 3 broken Vors wheel card images',
    'Fixed SP1 card and modal images via Shopify CDN',
    "Implemented Enay's 4/1 change list end-to-end",
  ] },
  { date: '2026-03-28', cat: 'Imagery', title: "Enay's feedback round", detail: "Implemented Enay's feedback list and fixed several wheel images.", items: [
    'Implemented 5 feedback items from Enay',
    'Fixed AFF3 images (corrected CDN path)',
    'Fixed DS06 card image — bronze to silver to match the DS family',
  ] },
  { date: '2026-03-18', cat: 'Store', title: 'Catalog upgrade — nav, modal, pricing', detail: '3-level navigation, finish/bolt/size selection in modals, set-of-4 discount, and hero image work.', items: [
    'Built a 3-level nav accordion with brand dropdowns and series flyouts',
    'Added finish selection, bolt pattern selection, and set-of-4 discount in the wheel modal',
    'Brand-click now shows series tabs only (not all wheels at once)',
    'Added the model jump, size select, qty stepper, and free shipping badge',
    'Fixed brand set price ranges (computed dynamically)',
    'Fixed set-of-4 pricing to show full range when prices vary by size',
    'Made the hero full viewport height (44vh → 100vh) with background image and dark overlay',
  ] },
  { date: '2026-03-06', cat: 'Imagery', title: 'Per-finish images + Vors brand + light theme redesign', detail: 'Added live finish-swatch image swaps for every wheel, added Vors as a third brand, and redesigned the site with a clean light theme.', items: [
    'Per-finish image map for all wheel models — swatch clicks show correct finish images',
    'Added Vors as a third brand with full catalog and per-size dynamic filtering',
    'Redesigned the site (Aodhan-style light theme — later replaced with the dark overhaul)',
    'Fixed 6 broken Vors modal images (dead vorswheels.com URLs)',
    'All MFlow thumbnails switched to bronze/gold with interactive finish swatches',
    'Mobile optimization: tighter typography, spacing, touch targets',
  ] },
  { date: '2026-03-03', cat: 'Store', title: 'Mflow brand + series tabs + image perf', detail: 'Added the Mflow Racing brand with full catalog, plus series sub-tabs and faster image loading.', items: [
    'Added Mflow Racing brand with full wheel catalog',
    'Built series sub-category tabs for Aodhan and Mflow',
    'Optimized image loading via Shopify CDN resizing + async decoding',
  ] },
  { date: '2026-03-02', cat: 'Mobile', title: 'Mobile-first pass + Aodhan upgrades', detail: 'Full mobile pass and real Aodhan wheel data with detail modals.', items: [
    'Mobile-optimized the entire site',
    'Added real Aodhan wheel images, specs, and detail modal',
  ] },
  { date: '2026-02-26', cat: 'Launch', title: 'FW Wheels site launch', detail: 'Initial launch — dark theme with brand catalog.', items: [
    'Initial fw.wheels website live: dark theme, brand catalog, basic product cards',
  ] },
];

async function worklogTab() {
  const days = new Set(WORK_LOG.map(e => e.date)).size;
  const months = new Set(WORK_LOG.map(e => e.date.slice(0, 7))).size;
  const lineItems = WORK_LOG.reduce((s, e) => s + e.items.length, 0);
  const first = WORK_LOG[WORK_LOG.length - 1].date;

  main().innerHTML = `
    <div class="page-head">
      <div>
        <h2>Work Log</h2>
        <p class="sub">Every update shipped on FW Wheels, from launch to now. Newest first.</p>
      </div>
    </div>
    <div class="kpis">
      ${kpiCard('Build sessions', days)}
      ${kpiCard('Months active', months)}
      ${kpiCard('Updates shipped', WORK_LOG.length)}
      ${kpiCard('Line items', lineItems)}
      ${kpiCard('First build', fmtDate(first))}
    </div>
    <div class="panel" style="padding:0">
      ${WORK_LOG.map((e, i) => `
        <div class="wl-row" data-i="${i}" style="border-bottom:1px solid var(--border)">
          <button class="wl-head" data-i="${i}" style="background:transparent;border:none;color:var(--text);width:100%;text-align:left;padding:16px 20px;display:grid;grid-template-columns:90px 1fr 20px;gap:16px;align-items:start">
            <div>
              <div style="font-weight:700;font-size:13.5px">${fmtDate(e.date)}</div>
              <div style="font-size:11.5px;color:var(--muted)">${e.date.slice(0,4)}</div>
            </div>
            <div style="min-width:0">
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
                <span class="pill" style="background:rgba(74,120,194,.18);color:#8fb4ec">${e.cat}</span>
                <span style="font-weight:700;font-size:14px">${esc(e.title)}</span>
                <span style="font-size:11.5px;color:var(--muted)">· ${e.items.length} ${e.items.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div style="font-size:13px;color:var(--muted);line-height:1.55">${esc(e.detail)}</div>
            </div>
            <span class="wl-chev" style="color:var(--muted);font-size:13px;padding-top:6px;transition:transform .2s">▾</span>
          </button>
          <ul class="wl-items" style="display:none;list-style:none;margin:0;padding:0 20px 18px calc(90px + 16px + 20px)">
            ${e.items.map(it => `<li style="display:flex;gap:10px;font-size:13px;line-height:1.55;padding:4px 0"><span style="color:var(--accent)">•</span><span>${esc(it)}</span></li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
    <p class="muted" style="font-size:12.5px;margin-top:14px">Tap any day to see the full breakdown. Maintained by JP — always current.</p>
  `;

  $$('.wl-head').forEach(btn => btn.addEventListener('click', () => {
    const row = btn.closest('.wl-row');
    const items = row.querySelector('.wl-items');
    const chev = row.querySelector('.wl-chev');
    const open = items.style.display !== 'none';
    items.style.display = open ? 'none' : 'block';
    chev.style.transform = open ? 'none' : 'rotate(180deg)';
  }));
}

init();
