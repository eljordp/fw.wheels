// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== BRAND FILTER TABS =====
const brandTabs = document.querySelectorAll('.brand-tab');
const brandSections = document.querySelectorAll('.brand-section');

brandTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const brand = tab.dataset.brand;

    // Update active tab
    brandTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show/hide brand sections
    brandSections.forEach(section => {
      if (brand === 'all') {
        section.classList.remove('hidden');
      } else {
        section.classList.toggle('hidden', section.dataset.brand !== brand);
      }
    });
  });
});

// ===== QUOTE FORM =====
const quoteForm = document.getElementById('quoteForm');
quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(quoteForm);
  const data = Object.fromEntries(formData);

  // Build mailto link as a simple email solution
  const subject = encodeURIComponent(`FW Wheels Quote Request - ${data.vehicle || 'New Inquiry'}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phone || 'Not provided'}\n` +
    `Vehicle: ${data.vehicle}\n` +
    `Brand Interest: ${data.brand || 'Not specified'}\n\n` +
    `Message:\n${data.message || 'No additional details'}`
  );

  window.location.href = `mailto:fwwheelsllc@gmail.com?subject=${subject}&body=${body}`;

  // Show confirmation
  const btn = quoteForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Opening Email...';
  btn.style.background = '#22c55e';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 3000);
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Animate sections on scroll
document.querySelectorAll('.brand-section, .gallery-item, .about-point, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
