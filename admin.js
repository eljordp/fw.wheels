(function () {
  const rowsEl = document.getElementById('inventoryRows');
  const searchEl = document.getElementById('inventorySearch');
  const statusFilterEl = document.getElementById('statusFilter');
  const copyBtn = document.getElementById('copyInventoryJson');
  const downloadBtn = document.getElementById('downloadInventoryJson');
  const catalog = window.FW_WHEEL_DATA || {};
  const overrides = {};

  function brandForId(id) {
    if (id.startsWith('vors-')) return 'Vors';
    if (id.startsWith('mf')) return 'Mflow Racing';
    return 'Aodhan';
  }

  function normalizeStatus(status) {
    return status || 'active';
  }

  function getCurrentPayload() {
    const items = {};
    Object.entries(overrides).forEach(([id, record]) => {
      const status = normalizeStatus(record.status);
      const note = (record.note || '').trim();
      if (status !== 'active' || note) {
        items[id] = { status };
        if (note) items[id].note = note;
      }
    });

    return {
      updatedAt: new Date().toISOString().slice(0, 10),
      notes: 'Manual inventory overrides. Status options: active, preorder, backorder, sold_out, hidden.',
      items
    };
  }

  function renderRows() {
    const query = (searchEl.value || '').trim().toLowerCase();
    const statusFilter = statusFilterEl.value;
    const entries = Object.entries(catalog).filter(([id, wheel]) => {
      const record = overrides[id] || {};
      const status = normalizeStatus(record.status);
      const haystack = [id, wheel.name, wheel.series, brandForId(id)].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!statusFilter || status === statusFilter);
    });

    rowsEl.innerHTML = entries.map(([id, wheel]) => {
      const record = overrides[id] || { status: 'active', note: '' };
      return `
        <tr data-id="${id}">
          <td>
            <strong>${wheel.name}</strong>
            <span>${id} · ${wheel.series || ''}</span>
          </td>
          <td>${brandForId(id)}</td>
          <td>${wheel.priceRange || ''}</td>
          <td>
            <select class="admin-status" data-field="status">
              ${['active', 'preorder', 'backorder', 'sold_out', 'hidden'].map(status =>
                `<option value="${status}" ${normalizeStatus(record.status) === status ? 'selected' : ''}>${status.replace('_', ' ')}</option>`
              ).join('')}
            </select>
          </td>
          <td><input class="admin-note-input" data-field="note" value="${String(record.note || '').replace(/"/g, '&quot;')}" placeholder="ETA, supplier note, call first..."></td>
        </tr>
      `;
    }).join('');

    rowsEl.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('change', () => {
        const row = input.closest('tr');
        const id = row.dataset.id;
        overrides[id] = overrides[id] || { status: 'active', note: '' };
        overrides[id][input.dataset.field] = input.value;
      });
      input.addEventListener('input', () => {
        if (input.dataset.field !== 'note') return;
        const row = input.closest('tr');
        const id = row.dataset.id;
        overrides[id] = overrides[id] || { status: 'active', note: '' };
        overrides[id].note = input.value;
      });
    });
  }

  async function loadOverrides() {
    try {
      const response = await fetch('/data/inventory-overrides.json?v=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Inventory file not found');
      const data = await response.json();
      Object.assign(overrides, data.items || {});
    } catch (err) {
      console.warn('Inventory overrides not loaded:', err.message);
    }
    renderRows();
  }

  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(getCurrentPayload(), null, 2);
    await navigator.clipboard.writeText(json);
    copyBtn.textContent = 'Copied';
    setTimeout(() => { copyBtn.textContent = 'Copy JSON'; }, 1200);
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getCurrentPayload(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-overrides.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  searchEl.addEventListener('input', renderRows);
  statusFilterEl.addEventListener('change', renderRows);
  loadOverrides();
})();

/* ─── Admin auth (single shared bearer token in sessionStorage) ──────────── */
function adminToken() {
  let t = sessionStorage.getItem('fw_admin_token');
  if (!t) {
    t = (window.prompt('Admin token (paste from Vercel ADMIN_TOKEN env):') || '').trim();
    if (t) sessionStorage.setItem('fw_admin_token', t);
  }
  return t;
}
async function adminFetch(url) {
  const token = adminToken();
  const res = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  if (res.status === 401) {
    sessionStorage.removeItem('fw_admin_token');
    throw new Error('Unauthorized — token wrong or missing');
  }
  return res;
}

/* ─── Tab switching ──────────────────────────────────────────────────────── */
(function () {
  const tabs = document.querySelectorAll('.admin-tab');
  const panes = document.querySelectorAll('.admin-tab-pane');
  tabs.forEach(t => t.addEventListener('click', () => {
    const id = t.dataset.tab;
    tabs.forEach(x => {
      const active = x.dataset.tab === id;
      x.classList.toggle('is-active', active);
      x.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panes.forEach(p => p.classList.toggle('is-active', p.dataset.pane === id));
    if (id === 'contacts' && !window._contactsLoaded) loadContacts();
    if (id === 'orders' && !window._ordersLoaded) loadOrders();
  }));
})();

/* ─── Work Log data + render ─────────────────────────────────────────────── */
const FW_WORK_LOG = [
  { date: '2026-06-17', cat: 'Admin', title: 'Owner admin v2 — tabs, work log, contacts', detail: 'Restructured this admin into tabs and added a full work log + a unified Contacts view.', items: [
    'Added tabbed admin: Inventory, Work Log, Contacts',
    'Built this Work Log so you can see every update at a glance',
    'Wired the Contacts table to capture every Stripe buyer automatically',
    'Set up the backend (Supabase) so email & SMS sign-ups can drop in next',
  ] },
  { date: '2026-06-16', cat: 'Admin', title: 'Owner admin portal launch', detail: 'First version of the owner admin — manage inventory statuses and publish updates to the live site.', items: [
    'Built the inventory admin with status controls (Active, Preorder, Backorder, Sold out, Hidden)',
    'Per-product owner notes',
    'One-click Copy/Download JSON to publish updates',
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
    'Removed the Builds section that didn\'t fit the shop flow',
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
  { date: '2026-04-11', cat: 'Imagery', title: 'Image fixes + Enay\'s 4/1 change list', detail: 'Knocked out Enay\'s requested fixes and corrected three broken wheel card images.', items: [
    'Fixed 3 broken Vors wheel card images',
    'Fixed SP1 card and modal images via Shopify CDN',
    'Implemented Enay\'s 4/1 change list end-to-end',
  ] },
  { date: '2026-03-28', cat: 'Imagery', title: 'Enay\'s feedback round', detail: 'Implemented Enay\'s feedback list and fixed several wheel images.', items: [
    'Implemented 5 feedback items from Enay',
    'Fixed AFF3 images (corrected CDN path)',
    'Fixed DS06 card image — bronze to silver to match the DS family',
  ] },
  { date: '2026-03-18', cat: 'Store', title: 'Catalog upgrade — nav, modal, pricing', detail: 'Major UX day: 3-level navigation, finish/bolt/size selection in modals, set-of-4 discount, and hero image work.', items: [
    'Built a 3-level nav accordion with brand dropdowns and series flyouts',
    'Added finish selection, bolt pattern selection, and set-of-4 discount in the wheel modal',
    'Brand-click now shows series tabs only (not all wheels at once)',
    'Added the model jump, size select, qty stepper, and free shipping badge',
    'Fixed brand set price ranges (computed dynamically)',
    'Fixed set-of-4 pricing to show full range when prices vary by size',
    'Made the hero full viewport height (44vh → 100vh) with background image and dark overlay',
    '5-lug ordering first; fixed AH02/AH06/AH07/AH08 default finishes and images',
  ] },
  { date: '2026-03-06', cat: 'Imagery', title: 'Per-finish images + Vors brand + light theme redesign', detail: 'Added live finish-swatch image swaps for every wheel, added Vors as a third brand, and redesigned the site with a clean light theme.', items: [
    'Per-finish image map for all wheel models — swatch clicks now show correct finish images',
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

(function () {
  const statsEl = document.getElementById('worklogStats');
  const entriesEl = document.getElementById('worklogEntries');
  if (!statsEl || !entriesEl) return;

  const days = new Set(FW_WORK_LOG.map(e => e.date)).size;
  const months = new Set(FW_WORK_LOG.map(e => e.date.slice(0, 7))).size;
  const first = FW_WORK_LOG[FW_WORK_LOG.length - 1].date;
  const totalItems = FW_WORK_LOG.reduce((s, e) => s + e.items.length, 0);
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtYear = d => d.slice(0, 4);

  statsEl.innerHTML = [
    { label: 'Build sessions', value: days },
    { label: 'Months active', value: months },
    { label: 'Updates shipped', value: FW_WORK_LOG.length },
    { label: 'Line items', value: totalItems },
    { label: 'First build', value: fmt(first) },
  ].map(s => `
    <div class="worklog-stat">
      <p class="worklog-stat-label">${s.label}</p>
      <p class="worklog-stat-value">${s.value}</p>
    </div>
  `).join('');

  entriesEl.innerHTML = FW_WORK_LOG.map((e, i) => {
    const catCls = 'cat-' + e.cat.toLowerCase();
    const itemsHtml = e.items.map(it => `<li>${it}</li>`).join('');
    return `
      <div class="worklog-entry" data-i="${i}">
        <button class="worklog-entry-header" type="button" aria-expanded="false">
          <div class="worklog-entry-date-wrap">
            <p class="worklog-entry-date">${fmt(e.date)}</p>
            <p class="worklog-entry-year">${fmtYear(e.date)}</p>
          </div>
          <div class="worklog-entry-body">
            <div class="worklog-entry-meta">
              <span class="worklog-entry-cat ${catCls}">${e.cat}</span>
              <span class="worklog-entry-title">${e.title}</span>
              <span class="worklog-entry-count">· ${e.items.length} ${e.items.length === 1 ? 'item' : 'items'}</span>
            </div>
            <p class="worklog-entry-detail">${e.detail}</p>
          </div>
          <span class="worklog-entry-chevron">▾</span>
        </button>
        <ul class="worklog-entry-items">${itemsHtml}</ul>
      </div>
    `;
  }).join('');

  entriesEl.querySelectorAll('.worklog-entry-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = btn.closest('.worklog-entry');
      const isOpen = entry.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
})();

/* ─── Contacts loader ────────────────────────────────────────────────────── */
async function loadContacts() {
  window._contactsLoaded = true;
  const statsEl = document.getElementById('contactsStats');
  const emptyEl = document.getElementById('contactsEmpty');
  try {
    const res = await adminFetch('/api/admin-contacts');
    if (!res.ok) throw new Error('contacts api failed (' + res.status + ')');
    const { contacts = [] } = await res.json();
    if (contacts.length === 0) return; // keep empty-state visible
    emptyEl.style.display = 'none';

    const buyers = contacts.filter(c => (c.total_spent || 0) > 0).length;
    const leads = contacts.length - buyers;
    const revenue = contacts.reduce((s, c) => s + (Number(c.total_spent) || 0), 0);

    statsEl.innerHTML = [
      { label: 'Total contacts', value: contacts.length },
      { label: 'Buyers', value: buyers },
      { label: 'Leads', value: leads },
      { label: 'Revenue', value: '$' + revenue.toFixed(0) },
    ].map(s => `
      <div class="worklog-stat">
        <p class="worklog-stat-label">${s.label}</p>
        <p class="worklog-stat-value">${s.value}</p>
      </div>
    `).join('');

    // Render a simple table after the stats
    const table = document.createElement('div');
    table.className = 'admin-table-wrap';
    table.style.marginTop = '18px';
    table.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Source</th>
            <th>Spent</th>
            <th>Added</th>
          </tr>
        </thead>
        <tbody>
          ${contacts.map(c => `
            <tr>
              <td>${(c.first_name || '') + ' ' + (c.last_name || '')}</td>
              <td>${c.email || '—'}</td>
              <td>${c.phone || '—'}</td>
              <td>${c.source || '—'}</td>
              <td>${c.total_spent ? '$' + Number(c.total_spent).toFixed(0) : '—'}</td>
              <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    statsEl.after(table);
  } catch {
    // silently fall back to the empty state
  }
}


/* ─── Orders loader (Stripe via /api/admin-orders) ───────────────────────── */
async function loadOrders() {
  window._ordersLoaded = true;
  const statsEl = document.getElementById('ordersStats');
  const bodyEl = document.getElementById('ordersBody');

  try {
    const res = await adminFetch('/api/admin-orders');
    if (!res.ok) throw new Error('orders api failed (' + res.status + ')');
    const { orders = [], totals = {} } = await res.json();

    statsEl.innerHTML = [
      { label: 'Orders', value: totals.count || 0 },
      { label: 'Today', value: totals.today || 0 },
      { label: 'This week', value: totals.week || 0 },
      { label: 'Revenue (all time)', value: '$' + (totals.revenue || 0).toFixed(0) },
    ].map(s => `
      <div class="worklog-stat">
        <p class="worklog-stat-label">${s.label}</p>
        <p class="worklog-stat-value">${s.value}</p>
      </div>
    `).join('');

    if (orders.length === 0) {
      bodyEl.innerHTML = `
        <div class="admin-empty">
          <p class="admin-empty-title">No orders yet.</p>
          <p>Once a customer checks out through Stripe, their order shows here automatically.</p>
        </div>`;
      return;
    }

    bodyEl.innerHTML = `
      <div class="admin-table-wrap" style="margin-top: 18px;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Stripe</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${o.date}</td>
                <td>${o.name || '—'}</td>
                <td>${o.email || '—'}</td>
                <td>$${(o.amount || 0).toFixed(0)}</td>
                <td><span class="worklog-entry-cat cat-${o.statusCat}">${o.status}</span></td>
                <td><a href="${o.url}" target="_blank" rel="noopener">View</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    bodyEl.innerHTML = `
      <div class="admin-empty">
        <p class="admin-empty-title">Couldn't load orders.</p>
        <p>${err.message}. Check that <code>STRIPE_SECRET_KEY</code> is set in Vercel env.</p>
      </div>`;
  }
}
