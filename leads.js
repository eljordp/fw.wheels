// Newsletter / lead capture — posts to Supabase `leads` (anon insert allowed by RLS).
(function () {
  var URL = window.FW_SUPABASE_URL, ANON = window.FW_SUPABASE_ANON;

  function wire(form) {
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.lead-msg');
      var emailEl = form.querySelector('[name="email"]');
      var phoneEl = form.querySelector('[name="phone"]');
      var smsEl = form.querySelector('[name="sms"]');
      var email = emailEl ? emailEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.trim() : '';
      if (!email && !phone) { show(msg, 'Enter an email or phone.', false); return; }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { show(msg, 'Enter a valid email.', false); return; }
      if (!URL || !ANON) { show(msg, 'Something went wrong. Try later.', false); return; }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = '…'; }

      fetch(URL + '/rest/v1/leads', {
        method: 'POST',
        headers: {
          apikey: ANON, Authorization: 'Bearer ' + ANON,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          sms_opt_in: smsEl ? !!smsEl.checked : false,
          source: form.dataset.source || 'footer',
          meta: { path: location.pathname },
        }),
      }).then(function (r) {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Join'; }
        if (r.ok) {
          form.reset();
          show(msg, "You're on the list. We'll hit you with drops & restocks.", true);
          if (window.fwTrack) window.fwTrack('lead_signup', { meta: { source: form.dataset.source || 'footer' } });
        } else if (r.status === 409) {
          // already subscribed (unique email) — treat as success
          form.reset();
          show(msg, "You're already on the list — you're good.", true);
        } else {
          show(msg, 'Could not sign you up. Try again.', false);
        }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Join'; }
        show(msg, 'Network error. Try again.', false);
      });
    });
  }

  function show(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#3ba776' : '#ff8088';
  }

  function init() { document.querySelectorAll('form.lead-form').forEach(wire); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
