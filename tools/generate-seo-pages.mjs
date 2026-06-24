import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const siteUrl = 'https://fwwheelz.com';
const heroImage = `${siteUrl}/images/hero.jpg`;

const products = {
  ah02: {
    name: 'AODHAN AH02',
    image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_SML_01.jpg?width=400',
    slug: '/wheels/aodhan-ah02',
  },
  ah03: {
    name: 'AODHAN AH03',
    image: 'https://www.aodhanwheels.com/cdn/shop/products/AH03_1895_SMF_01.jpg?width=400',
    slug: '/wheels/aodhan',
  },
  ah09: {
    name: 'AODHAN AH09',
    image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_MS_D_01.jpg?width=400',
    slug: '/wheels/aodhan',
  },
  ds02: {
    name: 'AODHAN DS02',
    image: 'https://www.aodhanwheels.com/cdn/shop/products/DS02_1885_SMF_03.jpg?width=400',
    slug: '/wheels/aodhan',
  },
  ds05: {
    name: 'AODHAN DS05',
    image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_BRZ_1885_03.jpg?width=400',
    slug: '/wheels/aodhan',
  },
  ds08: {
    name: 'AODHAN DS08',
    image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1885_BZ_03.jpg?width=400',
    slug: '/wheels/aodhan',
  },
  mfr1: {
    name: 'MFlow Racing MFR1',
    image: 'https://www.mflowracing.com/cdn/shop/files/MFR1-2085-MACHINEDSILVER1.jpg?v=1771531382&width=400',
    slug: '/wheels/mflow-racing',
  },
  mfr2: {
    name: 'MFlow Racing MFR2',
    image: 'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-black-unleashedwheels.jpg?v=1724881053&width=400',
    slug: '/wheels/mflow-racing',
  },
  mfr3: {
    name: 'MFlow Racing MFR3',
    image: 'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-gloss-black-unleashedwheels.jpg?v=1724886960&width=400',
    slug: '/wheels/mflow-racing',
  },
  mfr4: {
    name: 'MFlow Racing MFR4',
    image: 'https://www.mflowracing.com/cdn/shop/files/MFR4HyperSilverMachinedTip.jpg?v=1771542352&width=400',
    slug: '/wheels/mflow-racing',
  },
  mfl1: {
    name: 'MFlow Racing MFL1',
    image: 'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-chrome-unleashedwheels.jpg?v=1725407132&width=400',
    slug: '/wheels/mflow-racing',
  },
  mf01: {
    name: 'MFlow Racing MF01',
    image: 'https://wheelplususa.com/cdn/shop/files/ML1-Matte-Bronze-Wheels-Rims_3ad8bf49-f08a-49bb-9302-06533e4b7df0.jpg?v=1760723096&width=400',
    slug: '/wheels/mflow-racing',
  },
  'vors-tr4': {
    name: 'Vors TR4',
    image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_HB.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-tr10': {
    name: 'Vors TR10',
    image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR10_18X85_BK_1.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-tr37': {
    name: 'Vors TR37',
    image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X85_HB.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-tr88': {
    name: 'Vors TR88',
    image: 'https://www.vorswheels.com/cdn/shop/files/TR88_19X95_S_1.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-vr8': {
    name: 'Vors VR8',
    image: 'https://www.vorswheels.com/cdn/shop/files/VR8_19X95_S_1.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-sp1': {
    name: 'Vors SP1',
    image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X9_SILVER_2KPX.jpg?width=400',
    slug: '/wheels/vors',
  },
  'vors-lt53': {
    name: 'Vors LT53',
    image: 'https://www.vorswheels.com/cdn/shop/files/LT53_18X9_BK_1.jpg?width=400',
    slug: '/wheels/vors',
  },
};

const pages = [
  {
    file: 'wheels/vors.html',
    path: '/wheels/vors',
    title: 'Vors Wheels | TR4, TR37, TR88 & More | FW Wheels',
    description: 'Shop Vors wheels from FW Wheels, including TR4, TR37, TR88, VR8, SP1 and LT53 options with fitment help before you order.',
    h1: 'Vors Wheels',
    lead: 'Vors is a strong first stop for clean street fitment, aggressive split-spoke designs, and accessible pricing across popular 5-lug setups.',
    breadcrumbs: [['Home', '/'], ['Wheels', '/wheels'], ['Vors Wheels', '/wheels/vors']],
    stats: [['TR Series', 'Street-focused split-spoke options'], ['15-20 in', 'Common diameter coverage'], ['Fitment help', 'Size, offset, and bolt pattern checks']],
    introTitle: 'Why shop Vors at FW Wheels',
    intro: 'Vors gives buyers the look they search for without forcing them into custom forged pricing. FW Wheels keeps the page simple: pick the model, check the specs, and ask for fitment help before buying.',
    bulletsTitle: 'Popular Vors directions',
    bullets: ['TR4 and TR37 for aggressive split-spoke street builds.', 'TR88 and VR8 for deeper face and concave styling.', 'SP1, LT53, and UO2 for simpler daily-driver setups.'],
    productIds: ['vors-tr4', 'vors-tr37', 'vors-tr88', 'vors-vr8', 'vors-sp1', 'vors-lt53'],
    miniCards: [
      ['Vors TR4', 'A high-demand street wheel with clean spoke depth and broad fitment appeal.'],
      ['Vors TR37', 'A motorsport-style look for buyers searching Vors wheels by model.'],
      ['Vors VR8', 'A stronger visual option for concave wheel shoppers.'],
    ],
  },
  {
    file: 'wheels/mflow-racing.html',
    path: '/wheels/mflow-racing',
    title: 'MFlow Racing Wheels | MFR, MFL & Offroad | FW Wheels',
    description: 'Shop MFlow Racing wheels from FW Wheels, including MFR, MFL, and MF offroad styles with size, finish, and fitment guidance.',
    h1: 'MFlow Racing Wheels',
    lead: 'MFlow Racing covers street, luxury-lip, and truck/SUV styles, which makes it useful for buyers comparing clean daily setups against bolder builds.',
    breadcrumbs: [['Home', '/'], ['Wheels', '/wheels'], ['MFlow Racing Wheels', '/wheels/mflow-racing']],
    stats: [['MFR', 'Street wheel series'], ['MFL', 'Luxury lip looks'], ['MF', 'Truck and SUV options']],
    introTitle: 'MFlow styles without the guessing',
    intro: 'MFlow buyers usually care about finish, stance, and whether the wheel will clear the vehicle cleanly. FW Wheels keeps the catalog tied to fitment help so the order is based on the actual car, not just the photo.',
    bulletsTitle: 'Where MFlow fits',
    bullets: ['MFR1 through MFR4 for street cars and clean performance builds.', 'MFL1 and MFL2 for chrome or machined-lip styling.', 'MF01 through MF06 for offroad and truck/SUV applications.'],
    productIds: ['mfr1', 'mfr2', 'mfr3', 'mfr4', 'mfl1', 'mf01'],
    miniCards: [
      ['MFR Series', 'Street-oriented wheels with simple finishes and modern spoke layouts.'],
      ['MFL Series', 'Luxury-lip styling for buyers who want a more polished setup.'],
      ['MF Offroad', 'Truck and SUV wheels with stronger visual weight.'],
    ],
  },
  {
    file: 'wheels/aodhan.html',
    path: '/wheels/aodhan',
    title: 'Aodhan Wheels | AH, DS & AFF Series | FW Wheels',
    description: 'Shop Aodhan wheels from FW Wheels, including AH02, DS02, DS05, DS08 and AFF options with bolt pattern and offset guidance.',
    h1: 'Aodhan Wheels',
    lead: 'Aodhan is the core catalog for buyers who want aggressive fitment, concave faces, and proven model names like AH02, DS02, DS05, and DS08.',
    breadcrumbs: [['Home', '/'], ['Wheels', '/wheels'], ['Aodhan Wheels', '/wheels/aodhan']],
    stats: [['AH Series', 'Classic multi-spoke options'], ['DS Series', 'Deep dish and concave looks'], ['AFF Series', 'Flow form performance styles']],
    introTitle: 'Aodhan model pages built around fitment',
    intro: 'Aodhan has the search volume, but it also has more competition. This page supports the broader Aodhan keyword while the AH02 page targets the model search directly.',
    bulletsTitle: 'Common Aodhan searches',
    bullets: ['AH02 for simple multi-spoke styling across 17, 18, and 19 inch sizes.', 'DS02, DS05, and DS08 for more concave street setups.', 'AFF models for buyers comparing flow form options.'],
    productIds: ['ah02', 'ds02', 'ds05', 'ds08', 'ah03', 'ah09'],
    miniCards: [
      ['Aodhan AH02', 'The priority model page because buyers search the exact model name.'],
      ['Aodhan DS02', 'A strong concave option for stance and street fitment searches.'],
      ['Aodhan DS08', 'A popular dish-style wheel for more aggressive builds.'],
    ],
  },
  {
    file: 'wheels/aodhan-ah02.html',
    path: '/wheels/aodhan-ah02',
    title: 'Aodhan AH02 Wheels | Sizes, Bolt Patterns & Fitment | FW Wheels',
    description: 'Shop Aodhan AH02 wheels at FW Wheels. Compare 17, 18, and 19 inch AH02 sizes, 5x114.3 options, finishes, offsets, and fitment help.',
    h1: 'Aodhan AH02 Wheels',
    lead: 'The Aodhan AH02 is a clean multi-spoke wheel for buyers who want a simple street look, common 5-lug fitments, and finish options like gloss black or silver with machined lip.',
    breadcrumbs: [['Home', '/'], ['Wheels', '/wheels'], ['Aodhan', '/wheels/aodhan'], ['Aodhan AH02', '/wheels/aodhan-ah02']],
    stats: [['17-19 in', 'Common AH02 diameters'], ['5x114.3', 'Popular bolt pattern coverage'], ['73.1mm', 'Common center bore, with 72.6mm on 5x120']],
    introTitle: 'AH02 fitment basics',
    intro: 'AH02 works well as a model-specific landing page because the search intent is clear: shoppers usually know the wheel and need the right size, offset, bolt pattern, and finish.',
    bulletsTitle: 'AH02 spec notes',
    bullets: ['17x8, 18x8.5, 18x9.5, 19x8.5, 19x9.5, and 19x11 sizes are represented in the catalog.', 'Common bolt patterns include 5x100, 5x112, 5x114.3, and 5x120 depending on size.', 'Offsets vary by size, so final fitment should be checked against the actual vehicle.'],
    productIds: ['ah02', 'ah03', 'ah09', 'ds02'],
    miniCards: [
      ['Best for', 'Clean street builds that need a simple multi-spoke design.'],
      ['Check first', 'Bolt pattern, center bore, offset, and tire size before checkout.'],
      ['Alternatives', 'AH03 and DS02 are useful nearby options when AH02 sizing is not ideal.'],
    ],
    productSchema: {
      name: 'Aodhan AH02 Wheels',
      image: ['https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_SML_01.jpg?width=800'],
      description: 'Aodhan AH02 aftermarket wheels with multiple sizes, finishes, and common 5-lug bolt patterns.',
      brand: { '@type': 'Brand', name: 'Aodhan' },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: '237', highPrice: '262', offerCount: '6', availability: 'https://schema.org/InStock' },
    },
  },
  {
    file: 'fitment.html',
    path: '/fitment',
    title: 'Wheel Fitment Help | Size, Offset & Bolt Pattern | FW Wheels',
    description: 'Use FW Wheels fitment help to check wheel size, bolt pattern, center bore, offset, and vehicle compatibility before ordering.',
    h1: 'Wheel Fitment Help',
    lead: 'Fitment is where wheel orders go right or wrong. FW Wheels helps match diameter, width, offset, bolt pattern, center bore, and hardware before checkout.',
    breadcrumbs: [['Home', '/'], ['Fitment', '/fitment']],
    stats: [['Bolt pattern', 'Match the hub first'], ['Offset', 'Control poke and clearance'], ['Center bore', 'Confirm hub-centric fit']],
    introTitle: 'What to check before ordering wheels',
    intro: 'A wheel can look perfect in a photo and still be wrong for the vehicle. The safest path is to match the bolt pattern, confirm the center bore, choose an offset that clears the suspension, and pair the wheel with the right tire size.',
    bulletsTitle: 'Fitment checks',
    bullets: ['Bolt pattern must match the vehicle hub, including dual-drilled wheels.', 'Center bore must be equal to or larger than the vehicle hub bore.', 'Offset and width decide how far the wheel moves inward or outward.'],
    productIds: ['ah02', 'vors-tr4', 'mfr1'],
    miniCards: [
      ['5x114.3 wheels', 'A common 5-lug search for Honda, Toyota, Nissan, Lexus, Mazda, and more.'],
      ['Concave wheels', 'Useful for buyers shopping by stance and face depth.'],
      ['AH02 fitment', 'A model-specific search that deserves its own page.'],
    ],
    faq: [
      ['What is wheel fitment?', 'Wheel fitment is the match between the wheel specs and the vehicle specs, including size, width, offset, bolt pattern, and center bore.'],
      ['Can FW Wheels check my fitment?', 'Yes. Send the vehicle year, make, model, trim, and the wheel you want so the specs can be checked before ordering.'],
    ],
  },
  {
    file: 'fitment/5x114-3-wheels.html',
    path: '/fitment/5x114-3-wheels',
    title: '5x114.3 Wheels | Fitment Guide & Popular Models | FW Wheels',
    description: 'Shop 5x114.3 wheels and learn what to check before ordering: offset, center bore, width, tire sizing, and common 5x114.3 model options.',
    h1: '5x114.3 Wheels',
    lead: '5x114.3 is one of the most common 5-lug bolt patterns, but the bolt pattern alone is not enough. Width, offset, center bore, and tire sizing still decide whether the setup works.',
    breadcrumbs: [['Home', '/'], ['Fitment', '/fitment'], ['5x114.3 Wheels', '/fitment/5x114-3-wheels']],
    stats: [['5 lugs', '114.3mm bolt circle'], ['Offset check', 'Clearance still matters'], ['Hub bore', 'Must be confirmed']],
    introTitle: 'How to shop 5x114.3 wheels',
    intro: 'Start with the bolt pattern, then narrow the wheel by diameter, width, offset, and center bore. A 5x114.3 wheel can fit many vehicles, but the wrong offset or tire can still rub.',
    bulletsTitle: 'Before you buy 5x114.3',
    bullets: ['Confirm the vehicle actually uses 5x114.3, not 5x112 or 5x120.', 'Compare wheel center bore against the vehicle hub bore.', 'Check offset and width together because they change inner clearance and outer poke.'],
    productIds: ['ah02', 'ds02', 'vors-tr4', 'vors-tr37', 'mfr1', 'mfl1'],
    miniCards: [
      ['Aodhan AH02', 'Popular 5x114.3 options across multiple sizes.'],
      ['Vors TR4', 'A clean street wheel for common 5-lug applications.'],
      ['MFlow MFR1', 'A modern MFlow option for 5-lug shoppers.'],
    ],
    faq: [
      ['What cars use 5x114.3 wheels?', 'Many Honda, Acura, Toyota, Lexus, Nissan, Infiniti, Mazda, Hyundai, Kia, Ford, and Chrysler applications use 5x114.3, but the exact vehicle must be checked.'],
      ['Is 5x114.3 the same as 5x4.5?', 'Yes, 5x4.5 inches is the imperial version of 5x114.3mm.'],
      ['Do all 5x114.3 wheels fit every 5x114.3 car?', 'No. Offset, width, center bore, brake clearance, tire size, and load rating still matter.'],
    ],
  },
  {
    file: 'collections/concave-wheels.html',
    path: '/collections/concave-wheels',
    title: 'Concave Wheels | Deep Face Street Wheels | FW Wheels',
    description: 'Shop concave wheels from Aodhan, Vors, and MFlow Racing. Compare deep face designs, sizes, offsets, and fitment help before ordering.',
    h1: 'Concave Wheels',
    lead: 'Concave wheels are about face depth, stance, and how the wheel sits under the car. The look depends on width and offset as much as the model name.',
    breadcrumbs: [['Home', '/'], ['Concave Wheels', '/collections/concave-wheels']],
    stats: [['Deep face', 'More visual depth'], ['Width + offset', 'The real fitment drivers'], ['Street builds', 'Aodhan, Vors, and MFlow options']],
    introTitle: 'How to choose concave wheels',
    intro: 'A concave wheel has spokes that pull inward toward the hub. More concavity usually comes from wider sizes and lower offsets, so fitment guidance matters before ordering.',
    bulletsTitle: 'Concave wheel notes',
    bullets: ['Wider wheels usually create a deeper face, but they also affect tire and fender clearance.', 'Lower offsets can create more poke and a stronger stance.', 'Model photos can vary by size, so check the exact size and finish before ordering.'],
    productIds: ['ds02', 'ds05', 'ds08', 'vors-tr4', 'vors-tr37', 'vors-vr8'],
    miniCards: [
      ['Aodhan DS Series', 'A natural target for buyers searching deep dish or concave Aodhan wheels.'],
      ['Vors TR Series', 'Good value options for aggressive street fitment searches.'],
      ['Fitment check', 'Concave setups need extra attention to offset and tire clearance.'],
    ],
    faq: [
      ['What makes a wheel concave?', 'A concave wheel has spokes that angle inward from the outer lip toward the hub, creating visible depth.'],
      ['Are concave wheels harder to fit?', 'They can be, because the deeper look often comes with wider sizes or lower offsets. Clearance should be checked before ordering.'],
      ['Can FW Wheels help choose a concave setup?', 'Yes. Send the vehicle and the style you want, and FW Wheels can help narrow the size and offset.'],
    ],
  },
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char]));
}

function nav() {
  return `
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="/" class="logo">FW<span>WHEELS</span></a>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <ul class="nav-links" id="navLinks">
        <li><a href="/">Home</a></li>
        <li class="nav-has-sub" id="navBrandsItem">
          <div class="nav-brand-row">
            <a href="/wheels" class="nav-brands-link">Brands</a>
            <button class="nav-sub-toggle" id="navSubToggle" aria-label="Open brand menu">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <ul class="nav-sub-menu" id="navSubMenu"></ul>
        </li>
        <li><a href="/accessories">Accessories</a></li>
        <li><a href="/fitment">Fitment</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <a href="https://www.instagram.com/fw.wheels/" target="_blank" rel="noopener" class="nav-ig" aria-label="FW Wheels on Instagram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </a>
        <button class="nav-cart" id="cartBtn" aria-label="Open cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-badge" id="cartBadge">0</span>
        </button>
      </div>
    </div>
  </nav>
  <div class="nav-backdrop" id="navBackdrop"></div>`;
}

function footer() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-signup">
        <div class="footer-signup-text">
          <h3>Get the drops first</h3>
          <p>New wheels, restocks &amp; deals - straight to you. No spam.</p>
        </div>
        <form class="lead-form" data-source="footer">
          <div class="lead-fields">
            <input type="email" name="email" placeholder="Your email" autocomplete="email" />
            <input type="tel" name="phone" placeholder="Phone (optional)" autocomplete="tel" />
            <button type="submit" class="btn btn-primary">Join</button>
          </div>
          <label class="lead-sms"><input type="checkbox" name="sms" /> Text me drops &amp; deals too</label>
          <p class="lead-msg" role="status" aria-live="polite"></p>
        </form>
      </div>
      <div class="footer-content">
        <div class="footer-brand">
          <a href="/" class="logo">FW<span>WHEELS</span></a>
          <p>Certified Friendly Neighborhood Wheel &amp; Tire</p>
        </div>
        <div class="footer-links">
          <a href="/wheels">Brands</a>
          <a href="/wheels/vors">Vors</a>
          <a href="/wheels/mflow-racing">MFlow Racing</a>
          <a href="/wheels/aodhan">Aodhan</a>
          <a href="/fitment">Fitment</a>
          <a href="/fitment/5x114-3-wheels">5x114.3 Wheels</a>
          <a href="/collections/concave-wheels">Concave Wheels</a>
          <a href="/accessories">Accessories</a>
          <a href="/contact">Contact</a>
          <a href="https://www.instagram.com/fw.wheels/" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="footer-bottom"><p>&copy; 2026 FW Wheels LLC. All rights reserved.</p></div>
    </div>
  </footer>`;
}

function modalShell() {
  return `
  <div class="dont-forget-overlay" id="dontForgetModal">
    <div class="dont-forget-modal">
      <button class="modal-close" id="dontForgetClose" aria-label="Close accessories suggestions">&times;</button>
      <h3 class="dont-forget-title">Don't Forget To Add These</h3>
      <p class="dont-forget-sub">Complete your build with the right accessories.</p>
      <a href="/accessories" class="btn btn-primary" id="dontForgetCta" style="margin-top:24px;display:inline-block;">Shop Accessories</a>
    </div>
  </div>
  <div class="wheel-modal-overlay" id="wheelModal">
    <div class="wheel-modal">
      <button class="modal-close" id="modalClose" aria-label="Close wheel details">&times;</button>
      <div class="modal-content">
        <div class="modal-images" id="modalImages"></div>
        <div class="modal-info">
          <h3 class="modal-title" id="modalTitle"></h3>
          <div class="modal-specs" id="modalSpecs"></div>
          <button class="btn btn-primary btn-full modal-quote-btn" id="modalQuoteBtn">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
  <div class="wheel-modal-overlay" id="accessoryModal">
    <div class="wheel-modal accessory-modal">
      <button class="modal-close" id="accessoryModalClose" aria-label="Close accessory details">&times;</button>
      <div class="modal-content">
        <div class="modal-images" id="accessoryModalImages"></div>
        <div class="modal-info">
          <h3 class="modal-title" id="accessoryModalTitle"></h3>
          <div class="modal-specs" id="accessoryModalSpecs"></div>
          <button class="btn btn-primary btn-full modal-quote-btn" id="accessoryAddBtn" disabled>Select Options</button>
        </div>
      </div>
    </div>
  </div>
  <div class="cart-backdrop" id="cartBackdrop"></div>
  <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping cart">
    <div class="cart-header">
      <h3 class="cart-title">Your Cart</h3>
      <button class="cart-close" id="cartClose" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-empty" id="cartEmpty">
      <p>Your cart is empty.</p>
      <span>Add wheels or accessories to get started.</span>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-footer">
      <div class="cart-subtotal-row"><span>Subtotal</span><strong id="cartSubtotal">$0</strong></div>
      <p class="cart-disclaimer">Free shipping. Taxes &amp; sales tax calculated at checkout based on your address.</p>
      <button class="btn btn-primary btn-full" id="cartCheckoutBtn" disabled>Checkout</button>
    </div>
  </aside>`;
}

function breadcrumbHtml(items) {
  return `<div class="seo-breadcrumb">${items.map(([label, href], index) => {
    const part = index === items.length - 1
      ? `<span>${esc(label)}</span>`
      : `<a href="${esc(href)}">${esc(label)}</a>`;
    return index === 0 ? part : `<span>/</span>${part}`;
  }).join('')}</div>`;
}

function statsHtml(stats) {
  return `<div class="seo-stat-row">${stats.map(([value, label]) => `
    <div class="seo-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</div>`;
}

function productCards(ids) {
  return `<div class="wheel-grid">${ids.map((id) => {
    const product = products[id];
    return `
      <div class="wheel-card" data-wheel="${esc(id)}">
        <div class="wheel-img-wrap"><img decoding="async" src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy"></div>
        <div class="wheel-card-info">
          <p class="wheel-name">${esc(product.name)}</p>
          <p class="wheel-price"></p>
          <div class="wheel-swatches"></div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

function schemas(page) {
  const listItems = (page.productIds || []).map((id, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${siteUrl}${products[id].slug}`,
    name: products[id].name,
  }));

  const result = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FW Wheels',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/favicon.png`,
      sameAs: ['https://www.instagram.com/fw.wheels/'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map(([name, item], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: `${siteUrl}${item === '/' ? '/' : item}`,
      })),
    },
  ];

  if (page.productSchema) {
    result.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      ...page.productSchema,
      url: `${siteUrl}${page.path}`,
    });
  } else if (listItems.length) {
    result.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: page.h1,
      url: `${siteUrl}${page.path}`,
      description: page.description,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: listItems,
      },
    });
  }

  if (page.faq?.length) {
    result.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return result;
}

function pageHtml(page) {
  const canonical = `${siteUrl}${page.path}`;
  const schema = schemas(page).map((item) => `<script type="application/ld+json">${JSON.stringify(item, null, 2)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script src="/ga.js?v=20260617-1"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${esc(canonical)}">
  <meta name="theme-color" content="#0d0d0d">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/favicon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FW Wheels">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${heroImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${heroImage}">
  <link rel="stylesheet" href="/styles.css?v=20260618-1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ${schema}
</head>
<body class="seo-page">
${nav()}
  <main>
    <section class="seo-hero">
      <div class="container">
        ${breadcrumbHtml(page.breadcrumbs)}
        <h1>${esc(page.h1)}</h1>
        <p class="seo-hero-copy">${esc(page.lead)}</p>
        ${statsHtml(page.stats)}
      </div>
    </section>

    <section class="seo-section">
      <div class="container seo-intro-grid">
        <div class="seo-copy-card">
          <h2>${esc(page.introTitle)}</h2>
          <p>${esc(page.intro)}</p>
        </div>
        <div class="seo-list-card">
          <h2>${esc(page.bulletsTitle)}</h2>
          <ul>${page.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>

    <section class="seo-section alt">
      <div class="container">
        <h2 class="section-title">Popular Options</h2>
        <p class="section-subtitle">Tap a wheel to compare sizes, finishes, bolt patterns, and pricing.</p>
        ${productCards(page.productIds || [])}
      </div>
    </section>

    <section class="seo-section">
      <div class="container">
        <div class="seo-mini-grid">
          ${page.miniCards.map(([title, text]) => `<div class="seo-mini-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')}
        </div>
      </div>
    </section>

    ${page.faq?.length ? `<section class="seo-section alt"><div class="container"><h2 class="section-title">Questions Buyers Ask</h2><div class="seo-faq">${page.faq.map(([q, a]) => `<div class="seo-list-card"><h2>${esc(q)}</h2><p>${esc(a)}</p></div>`).join('')}</div></div></section>` : ''}

    <section class="seo-section">
      <div class="container">
        <div class="seo-cta-band">
          <div>
            <h2>Need the exact fitment checked?</h2>
            <p>Send the vehicle and the wheel you like. FW Wheels can check bolt pattern, size, offset, center bore, and hardware before checkout.</p>
          </div>
          <a class="btn btn-primary" href="/contact">Ask Fitment</a>
        </div>
      </div>
    </section>
  </main>
${footer()}
${modalShell()}
  <script src="/config.js?v=20260616-6"></script>
  <script src="/leads.js?v=20260617-3"></script>
  <script src="/analytics.js?v=20260616-6"></script>
  <script src="/script.js?v=20260618-1"></script>
</body>
</html>
`;
}

for (const page of pages) {
  const destination = path.join(root, page.file);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, pageHtml(page));
  console.log(`Wrote ${page.file}`);
}
