// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const navBackdrop = document.getElementById('navBackdrop');

function openMobileMenu() {
  mobileToggle.classList.add('active');
  navLinks.classList.add('open');
  navBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileToggle.classList.remove('active');
  navLinks.classList.remove('open');
  navBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

mobileToggle.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

navBackdrop.addEventListener('click', closeMobileMenu);

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// ===== BRAND FILTER TABS =====
const brandTabs = document.querySelectorAll('.brand-tab');
const brandSections = document.querySelectorAll('.brand-section');
const seriesTabsContainer = document.getElementById('seriesTabs');

// Series definitions per brand
const brandSeriesMap = {
  aodhan: [
    { id: 'all', label: 'All Series' },
    { id: 'ah', label: 'AH Series' },
    { id: 'ds', label: 'DS Series' },
    { id: 'aff', label: 'AFF Series' }
  ],
  mflow: [
    { id: 'all', label: 'All Series' },
    { id: 'mfr', label: 'MFR Series' },
    { id: 'mfl', label: 'MFL Series' },
    { id: 'mf', label: 'MF Offroad' }
  ]
};

function renderSeriesTabs(brand) {
  const series = brandSeriesMap[brand];
  if (!series) {
    seriesTabsContainer.innerHTML = '';
    return;
  }
  seriesTabsContainer.innerHTML = series.map((s, i) =>
    `<button class="series-tab${i === 0 ? ' active' : ''}" data-series="${s.id}" data-brand="${brand}">${s.label}</button>`
  ).join('');

  // Attach click handlers
  seriesTabsContainer.querySelectorAll('.series-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const seriesId = tab.dataset.series;
      const parentBrand = tab.dataset.brand;

      // Update active sub-tab
      seriesTabsContainer.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter series groups within the brand section
      const brandSection = document.querySelector(`.brand-section[data-brand="${parentBrand}"]`);
      if (!brandSection) return;
      brandSection.querySelectorAll('.series-group[data-series]').forEach(group => {
        if (seriesId === 'all') {
          group.classList.remove('series-hidden');
        } else {
          group.classList.toggle('series-hidden', group.dataset.series !== seriesId);
        }
      });
    });
  });
}

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
      // Reset series visibility when switching brands
      section.querySelectorAll('.series-group[data-series]').forEach(g => g.classList.remove('series-hidden'));
    });

    // Render series sub-tabs
    renderSeriesTabs(brand);
  });
});

// ===== WHEEL DATA =====
const wheelData = {
  // AH Series
  ah01: {
    name: 'AODHAN AH01',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Silver Machined Face'],
    sizes: ['15x8', '16x8', '17x9', '18x9.5'],
    boltPatterns: ['4x100/114.3', '5x100/114.3', '5x100'],
    offsets: ['+20', '+15', '+25', '+35'],
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH01_1580_SMF_03_c945adcb-3d0e-462c-9707-484af09d073f.jpg?v=1749494722&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH01_179010H_SMF_03_bc9a113f-5723-437e-9612-804713c35078.jpg?v=1749494722&width=800'
    ]
  },
  ah02: {
    name: 'AODHAN AH02',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Gloss Black'],
    sizes: ['17x8', '18x8.5', '18x9.5'],
    boltPatterns: ['4x100/114.3', '5x100/114.3', '5x100', '5x114.3', '5x120'],
    offsets: ['+35'],
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$237 – $262 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AH02_17808H_GB_03.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AH02_1885_GB_03.jpg?width=800'
    ]
  },
  ah03: {
    name: 'AODHAN AH03',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Gloss Black'],
    sizes: ['15x8', '16x8', '17x9', '18x9.5'],
    boltPatterns: ['4x100/114.3', '5x100/114.3', '5x114.3'],
    offsets: ['+20', '+15', '+25', '+30'],
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH03_179010H_GB_03_bbc5dc32-4ddb-4e58-9cfc-fe188386f434.jpg?v=1749494710&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH03_1680_GB_03_e689a6b9-0a5c-45d8-b50b-0deba830a440.jpg?v=1749494709&width=800'
    ]
  },
  ah04: {
    name: 'AODHAN AH04',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Silver Machined Face'],
    sizes: ['15x8', '16x8', '17x9', '18x9.5'],
    boltPatterns: ['4x100/114.3', '5x100/114.3', '5x100'],
    offsets: ['+20', '+15', '+25', '+35'],
    centerBore: '73.1mm',
    priceRange: '$162 – $207 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH04_179010H_SMF_03_f34e9704-835d-4c3b-b356-7287ebf406b7.jpg?v=1749494706&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH04_1580_MS_03.jpg?v=1749494706&width=800'
    ]
  },
  ah05: {
    name: 'AODHAN AH05',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Gloss Black'],
    sizes: ['15x8', '16x8', '17x9', '18x8.5'],
    boltPatterns: ['4x100/114.3', '5x100/114.3', '5x114.3'],
    offsets: ['+20', '+15', '+25', '+35'],
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH05_179010H_GB_03_94785440-bdb2-43bf-b0df-b7755d450e40.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH05_1885_GB_03_156efae4-7220-4320-bfe1-0743b65e5149.jpg?width=800'
    ]
  },
  ah06: {
    name: 'AODHAN AH06',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Textured Bronze'],
    sizes: ['17x9', '18x9'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30'],
    centerBore: '73.1mm',
    priceRange: '$224 – $249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1790_BRZ_03_ed0915fe-14b1-4289-8a92-cfb5977428dc.jpg?v=1749494698&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_BRZ_03_0b441f17-3a38-44d3-96bb-b8ddf4fc1635.jpg?v=1749494698&width=800'
    ]
  },
  ah07: {
    name: 'AODHAN AH07',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Textured Bronze', 'Gloss Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH07_1885_BRZ_02_47a7ed17-066a-4429-a93a-68d8278a5877.jpg?v=1749494695&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH07_1885_GB_02_4c7a50c2-a127-4ba6-8a47-395e8b214986.jpg?v=1749494695&width=800'
    ]
  },
  ah08: {
    name: 'AODHAN AH08',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Textured Bronze', 'Gloss Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH08_1885_BRZ_03_698bc731-eaf4-4451-a92f-efdf6f91b5f4.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH08_1885_GB_03.jpg?width=800'
    ]
  },
  ah09: {
    name: 'AODHAN AH09',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Silver Machined Face'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100'],
    offsets: ['+35'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH09_1885_MS_D_03.jpg?v=1749494596&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH09_1895_MS_D_03.jpg?v=1749494596&width=800'
    ]
  },
  ahx: {
    name: 'AODHAN AHX',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Hyper Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x112', '5x114.3', '5x120'],
    offsets: ['+35'],
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AHX_1885_HBLK_03.jpg?v=1752518439&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AHX_1895_HBLK_03.jpg?v=1752518439&width=800'
    ]
  },
  ah11: {
    name: 'AODHAN AH11',
    series: 'AH Series — Classic Multi-Spoke',
    finishes: ['Silver Machined Face'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5'],
    boltPatterns: ['5x112', '5x114.3'],
    offsets: ['+35'],
    centerBore: '73.1mm',
    priceRange: '$249 – $299 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AH11_1885_MS_03.jpg?v=1749494550&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AH11_1895_MS_03.jpg?v=1749494550&width=800'
    ]
  },
  // DS Series
  ds01: {
    name: 'AODHAN DS01',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip', 'Gloss Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS01_1885_BRONZE_03_52b41525-7011-44e1-8919-62f099957031.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS01_1885_GB_03_458fba51-fb98-477c-b57e-6dbf8172a167.jpg?width=800'
    ]
  },
  ds02: {
    name: 'AODHAN DS02',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22', '+15'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS02_1885_BRZ_03_bae8b50d-0182-4be2-813e-493b07e46567.jpg?v=1749494658&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS02_1895_BRZML_03.jpg?v=1749494658&width=800'
    ]
  },
  ds03: {
    name: 'AODHAN DS03',
    series: 'DS Series — Deep Concave',
    finishes: ['Silver w/ Machined Face'],
    sizes: ['18x9.5', '18x10.5', '19x9.5', '19x10.5', '19x11'],
    boltPatterns: ['5x100', '5x114.3', '5x120', '5x127'],
    offsets: ['+30', '+35', '+40', '+45'],
    centerBore: '73.1mm',
    priceRange: '$249 – $299 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/DS03_1895_MS_03D.jpg?v=1749494676&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/DS03_1895_MS_03P.jpg?v=1749494676&width=800'
    ]
  },
  ds05: {
    name: 'AODHAN DS05',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS05_BRZ_1885_03.jpg?v=1749494649&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS05_1895_BRZ_03.jpg?v=1749494649&width=800'
    ]
  },
  ds06: {
    name: 'AODHAN DS06',
    series: 'DS Series — Deep Concave',
    finishes: ['Gloss Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS06_1885_GB_03_832affc0-0e8d-428b-8cec-6b468e1ea0c8.jpg?v=1749494619&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS06_1895_GB_03_750b5340-59be-4d9b-9936-a2533b79e034.jpg?v=1749494619&width=800'
    ]
  },
  ds07: {
    name: 'AODHAN DS07',
    series: 'DS Series — Deep Concave',
    finishes: ['Gloss Black'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22', '+15'],
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS07_1885_GB_03.jpg?v=1749494614&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS07_1895_GB_03.jpg?v=1749494614&width=800'
    ]
  },
  ds08: {
    name: 'AODHAN DS08',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22'],
    centerBore: '73.1mm',
    priceRange: '$274 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS08_1885_BZ_03.jpg?v=1749494587&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS08_1895_BZ_03.jpg?v=1749494587&width=800'
    ]
  },
  ds09: {
    name: 'AODHAN DS09',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22'],
    centerBore: '73.1mm',
    priceRange: '$274 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS09_1885_BZML_03_0d6eac8f-3909-498f-8d30-fed270016d8a.jpg?v=1749494569&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS09_1995_BZML_03_349edecc-c85b-44d8-a6df-c35936768370.jpg?v=1749494569&width=800'
    ]
  },
  dsx: {
    name: 'AODHAN DSX',
    series: 'DS Series — Deep Concave',
    finishes: ['Bronze w/ Machined Lip'],
    sizes: ['18x8.5', '18x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35', '+30', '+22'],
    centerBore: '73.1mm',
    priceRange: '$206 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DSX_1885_BZML_03.jpg?v=1749494544&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DSX_1895_BZML_03.jpg?v=1749494544&width=800'
    ]
  },
  // AFF Series
  aff1: {
    name: 'AODHAN AFF1',
    series: 'AFF Series — Flow Form',
    finishes: ['Matte Black', 'Matte Bronze'],
    sizes: ['20x9', '20x10.5'],
    boltPatterns: ['5x114.3', '5x120'],
    offsets: ['+32', '+45', '+30', '+35'],
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF1_2090_MB_03_e46a0924-dbb8-4456-a6a5-b44a706063d8.jpg?v=1749494680&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF1_2090_MBRZ_03_7574050d-541f-4e91-8398-7c77c4f8a342.jpg?v=1749494680&width=800'
    ]
  },
  aff2: {
    name: 'AODHAN AFF2',
    series: 'AFF Series — Flow Form',
    finishes: ['Silver Machined Face'],
    sizes: ['19x8.5', '19x9.5'],
    boltPatterns: ['5x112', '5x114.3'],
    offsets: ['+35'],
    centerBore: '66.6mm (5x112) / 73.1mm (5x114.3)',
    priceRange: '$224 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF02_1985_SMF_03.jpg?v=1749494562&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF02_1995_SMF_03.jpg?v=1749494562&width=800'
    ]
  },
  aff3: {
    name: 'AODHAN AFF3',
    series: 'AFF Series — Flow Form',
    finishes: ['Silver Machined Face'],
    sizes: ['20x9', '20x10.5'],
    boltPatterns: ['5x114.3', '5x120'],
    offsets: ['+32', '+45', '+30', '+35'],
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF03_2090_MS_03.jpg?v=1749494576&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF03_20105_MS_03.jpg?v=1749494576&width=800'
    ]
  },
  aff7: {
    name: 'AODHAN AFF7',
    series: 'AFF Series — Flow Form',
    finishes: ['Silver Machined Face'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5', '20x9', '20x10.5'],
    boltPatterns: ['5x112'],
    offsets: ['+35', '+30'],
    centerBore: '66.6mm',
    priceRange: '$274 – $362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF7_1885_SMF_03.jpg?v=1749494580&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF7_2090_SMF_03.jpg?v=1749494581&width=800'
    ]
  },
  aff9: {
    name: 'AODHAN AFF9',
    series: 'AFF Series — Flow Form',
    finishes: ['Matte Black', 'Matte Bronze', 'Gloss Silver Machined Face'],
    sizes: ['20x9', '20x10.5'],
    boltPatterns: ['5x120'],
    offsets: ['+30', '+35'],
    centerBore: '72.6mm',
    priceRange: '$362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF9_2090_MB_03_f7785824-4973-49ac-856b-12205908e088.jpg?v=1749494553&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF9_2090_MBZ_03_2efee466-3cb1-4d9e-b2d7-959f57cd23ea.jpg?v=1749494553&width=800'
    ]
  },
  // ===== MFLOW RACING =====
  // MFR Series
  mfr1: {
    name: 'MFLOW MFR1',
    series: 'MFR Series — Flow Form',
    finishes: ['Matte Black', 'Hyper Black', 'Matte Bronze'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5', '20x8.5', '20x9.5'],
    boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'],
    offsets: ['+30', '+35', '+38'],
    centerBore: '73.1mm',
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-hyper-black-unleashedwheels.jpg?v=1724878850&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-matte-bronze-unleashedwheels.jpg?v=1724879474&width=800'
    ]
  },
  mfr2: {
    name: 'MFLOW MFR2',
    series: 'MFR Series — Flow Form',
    finishes: ['Matte Black', 'Matte Bronze'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5', '20x8.5', '20x9.5'],
    boltPatterns: ['5x112', '5x114.3', '5x120'],
    offsets: ['+35', '+38'],
    centerBore: '73.1mm',
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-black-unleashedwheels.jpg?v=1724881053&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-bronze-unleashedwheels.jpg?v=1724884011&width=800'
    ]
  },
  mfr3: {
    name: 'MFLOW MFR3',
    series: 'MFR Series — Flow Form',
    finishes: ['Gloss Black', 'Hyper Silver', 'Matte Bronze'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5'],
    boltPatterns: ['5x100', '5x114.3'],
    offsets: ['+35'],
    centerBore: '73.1mm',
    priceRange: '$212 – $237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-gloss-black-unleashedwheels.jpg?v=1724886960&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-hyper-silver-unleashedwheels.jpg?v=1724884908&width=800'
    ]
  },
  mfr4: {
    name: 'MFLOW MFR4',
    series: 'MFR Series — Flow Form',
    finishes: ['Matte Black Machined Lip', 'Matte Bronze Machined Lip'],
    sizes: ['18x8.5', '19x8.5', '19x9.5', '20x8.5', '20x9.5'],
    boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'],
    offsets: ['+35', '+38'],
    centerBore: '73.1mm',
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-black-unleashedwheels.jpg?v=1743713898&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-bronze-unleashedwheels.jpg?v=1743711412&width=800'
    ]
  },
  // MFL Series
  mfl1: {
    name: 'MFLOW MFL1',
    series: 'MFL Series — Flow Forming',
    finishes: ['PVD Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5', '20x8.5', '20x9.5'],
    boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'],
    offsets: ['+30', '+35', '+38'],
    centerBore: '73.1mm',
    priceRange: '$212 – $324 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-chrome-unleashedwheels.jpg?v=1725407132&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-matte-black-machined-lip.jpg?v=1725060775&width=800'
    ]
  },
  mfl2: {
    name: 'MFLOW MFL2',
    series: 'MFL Series — Flow Forming',
    finishes: ['PVD Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'],
    sizes: ['18x8.5', '18x9.5', '19x8.5', '19x9.5', '20x8.5', '20x9.5'],
    boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'],
    offsets: ['+30', '+35', '+38'],
    centerBore: '73.1mm',
    priceRange: '$212 – $324 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-chrome-unleashedwheels.jpg?v=1725491264&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-matte-bronze-unleashedwheels.jpg?v=1725490367&width=800'
    ]
  },
  // MF Series (Offroad)
  mf01: {
    name: 'MFLOW MF01',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x9'],
    boltPatterns: ['5x127'],
    offsets: ['-12', '+12'],
    centerBore: '71.5mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML1-Matte-Bronze-Wheels-Rims_3ad8bf49-f08a-49bb-9302-06533e4b7df0.jpg?v=1760723096&width=800'
    ]
  },
  mf02: {
    name: 'MFLOW MF02',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x9'],
    boltPatterns: ['5x127', '6x135', '6x139.7'],
    offsets: ['-12', '0', '+12'],
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML2-Matte-Bronze-Wheels-Rims_fb68a9cd-c705-430c-8528-82482fadc791.jpg?v=1760723100&width=800'
    ]
  },
  mf03: {
    name: 'MFLOW MF03',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x9'],
    boltPatterns: ['6x135', '6x139.7'],
    offsets: ['-12', '0'],
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML3-Matte-Bronze-Wheels-Rims_cbb74392-f31f-4e29-a763-a3baa6144e46.jpg?v=1760723105&width=800'
    ]
  },
  mf04: {
    name: 'MFLOW MF04',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x9'],
    boltPatterns: ['6x127', '6x135', '6x139.7'],
    offsets: ['-12', '0', '+12'],
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML4-Matte-Bronze-Wheels-Rims_11ea4bd5-2319-4dac-99cf-e21577708852.jpg?v=1760723110&width=800'
    ]
  },
  mf05: {
    name: 'MFLOW MF05',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x8.5', '17x9'],
    boltPatterns: ['5x127', '6x139.7'],
    offsets: ['-12', '0', '+5', '+12', '+25'],
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML5-Matte-Bronze-Wheels-Rims_1169e107-97e2-4715-aa91-370bbd559acc.jpg?v=1760723116&width=800'
    ]
  },
  mf06: {
    name: 'MFLOW MF06',
    series: 'MF Series — Offroad',
    finishes: ['Matte Bronze', 'Matte Black'],
    sizes: ['17x8.5', '17x9'],
    boltPatterns: ['6x139.7'],
    offsets: ['0', '+5', '+25'],
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML6-Matte-Bronze-Wheels-Rims_703504bc-3243-4c2f-9474-de40328a625c.jpg?v=1760723123&width=800'
    ]
  }
};

// ===== WHEEL MODAL =====
const wheelModal = document.getElementById('wheelModal');
const modalClose = document.getElementById('modalClose');
const modalImages = document.getElementById('modalImages');
const modalTitle = document.getElementById('modalTitle');
const modalSpecs = document.getElementById('modalSpecs');
const modalQuoteBtn = document.getElementById('modalQuoteBtn');

function openWheelModal(wheelId) {
  const wheel = wheelData[wheelId];
  if (!wheel) return;

  modalTitle.textContent = wheel.name;

  // Render images
  modalImages.innerHTML = wheel.images.map(src =>
    `<img decoding="async" src="${src}" alt="${wheel.name}" loading="lazy">`
  ).join('');

  // Render specs
  modalSpecs.innerHTML = `
    <div class="spec-group">
      <div class="spec-label">Series</div>
      <div class="spec-value">${wheel.series}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Price Range</div>
      <div class="spec-value" style="color: var(--gold); font-weight: 600;">${wheel.priceRange}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Available Finishes</div>
      <div class="spec-chips">${wheel.finishes.map(f => `<span class="spec-chip">${f}</span>`).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Sizes</div>
      <div class="spec-chips">${wheel.sizes.map(s => `<span class="spec-chip">${s}</span>`).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Bolt Patterns</div>
      <div class="spec-chips">${wheel.boltPatterns.map(b => `<span class="spec-chip">${b}</span>`).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Offsets</div>
      <div class="spec-chips">${wheel.offsets.map(o => `<span class="spec-chip">${o}</span>`).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Center Bore</div>
      <div class="spec-value">${wheel.centerBore}</div>
    </div>
  `;

  wheelModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWheelModal() {
  wheelModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Click on wheel cards to open modal
document.querySelectorAll('.wheel-card[data-wheel]').forEach(card => {
  card.addEventListener('click', () => {
    openWheelModal(card.dataset.wheel);
  });
});

// Close modal
modalClose.addEventListener('click', closeWheelModal);
wheelModal.addEventListener('click', (e) => {
  if (e.target === wheelModal) closeWheelModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWheelModal();
});

// Close modal + scroll to contact on quote button
modalQuoteBtn.addEventListener('click', () => {
  closeWheelModal();
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
