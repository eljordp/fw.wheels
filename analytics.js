// Lightweight first-party analytics for fw.wheels.
// Writes events to Supabase (anon insert allowed by RLS). No cookies, no PII.
(function () {
  var URL = window.FW_SUPABASE_URL;
  var ANON = window.FW_SUPABASE_ANON;
  if (!URL || !ANON) return;

  // anonymous session id (persists per browser)
  var sid;
  try {
    sid = localStorage.getItem('fw_sid');
    if (!sid) {
      sid = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('fw_sid', sid);
    }
  } catch (e) { sid = 's_' + Date.now().toString(36); }

  function send(type, data) {
    data = data || {};
    var row = {
      type: type,
      session_id: sid,
      path: location.pathname + location.search,
      referrer: document.referrer || null,
      product_slug: data.product_slug || null,
      size: data.size || null,
      value: (typeof data.value === 'number') ? data.value : null,
      meta: data.meta || null,
      user_agent: navigator.userAgent
    };
    var body = JSON.stringify(row);
    // sendBeacon survives page navigation (important for begin_checkout)
    try {
      var blob = new Blob([body], { type: 'application/json' });
      // beacon can't set apikey header, so use fetch keepalive instead
    } catch (e) {}
    fetch(URL + '/rest/v1/events', {
      method: 'POST',
      keepalive: true,
      headers: {
        apikey: ANON,
        Authorization: 'Bearer ' + ANON,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: body
    }).catch(function () {});
  }

  window.fwTrack = send;

  // auto page view
  send('page_view');

  // apply admin-managed settings (announcement bar, contact info, meta description)
  fetch(URL + '/rest/v1/settings?select=key,value', {
    headers: { apikey: ANON, Authorization: 'Bearer ' + ANON }
  }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
    var s = {};
    (rows || []).forEach(function (row) { s[row.key] = row.value; });
    if (s.meta_description) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', s.meta_description);
    }
    if (s.announcement && String(s.announcement).trim()) {
      var bar = document.createElement('div');
      bar.textContent = s.announcement;
      bar.style.cssText = 'background:#e63946;color:#fff;text-align:center;padding:8px 14px;font-size:13px;font-weight:600;position:relative;z-index:200';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }).catch(function () {});
})();
