// Newsletter / lead capture — posts to Supabase `leads` (anon insert allowed by RLS).
// Hides the signup UI for visitors who already subscribed or completed checkout
// so returning customers never get prompted again.
(function () {
  var URL = window.FW_SUPABASE_URL, ANON = window.FW_SUPABASE_ANON;
  var FLAG = 'fw_subscribed';

  function isSubscribed() {
    try { return localStorage.getItem(FLAG) === '1'; } catch (_) { return false; }
  }
  function markSubscribed() {
    try { localStorage.setItem(FLAG, '1'); } catch (_) {}
    hideAllSignupBlocks();
  }
  function hideAllSignupBlocks() {
    document.querySelectorAll('.footer-signup, [data-signup-block]').forEach(function (el) {
      el.style.display = 'none';
    });
  }
  // Stripe success redirect — mark them so the signup form goes away post-checkout.
  function captureCheckoutSuccess() {
    if (location.search.indexOf('checkout=success') === -1) return;
    markSubscribed();
  }

  function wire(form) {
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.lead-msg');
      var emailEl = form.querySelector('[name="email"]');
      var phoneEl = form.querySelector('[name="phone"]');
      var smsEl = form.querySelector('[name="sms"]');
      var vehicleEl = form.querySelector('[name="vehicle"]');
      var email = emailEl ? emailEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.trim() : '';
      var vehicle = vehicleEl ? vehicleEl.value.trim() : '';
      if (vehicleEl && !vehicle) { show(msg, 'Tell us what you drive.', false); return; }
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
          meta: vehicle
            ? { path: location.pathname, vehicle: vehicle }
            : { path: location.pathname },
        }),
      }).then(function (r) {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Join'; }
        if (r.ok) {
          form.reset();
          show(msg, vehicle
            ? 'Saved your ' + vehicle + " — we'll hit you when wheels for it drop."
            : "You're on the list. We'll hit you with drops & restocks.", true);
          markSubscribed();
          if (window.fwTrack) window.fwTrack('lead_signup', { meta: { source: form.dataset.source || 'footer' } });
        } else if (r.status === 409) {
          // Email already a lead. If they added a car, merge it onto the existing
          // row so Enay still gets the vehicle (the 409 proves email is unique,
          // so on_conflict=email is safe here).
          if (vehicle) {
            fetch(URL + '/rest/v1/leads?on_conflict=email', {
              method: 'POST',
              headers: {
                apikey: ANON, Authorization: 'Bearer ' + ANON,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal,resolution=merge-duplicates',
              },
              body: JSON.stringify({
                email: email || null,
                source: form.dataset.source || 'footer',
                meta: { path: location.pathname, vehicle: vehicle },
              }),
            });
          }
          form.reset();
          show(msg, vehicle
            ? 'Saved your ' + vehicle + " — we'll hit you when wheels for it drop."
            : "You're already on the list — you're good.", true);
          markSubscribed();
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

  function init() {
    captureCheckoutSuccess();
    // Hide the footer newsletter for returning subscribers, but still wire every
    // lead form — the garage "save your car" box stays usable for everyone.
    if (isSubscribed()) hideAllSignupBlocks();
    document.querySelectorAll('form.lead-form').forEach(wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
