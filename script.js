// ===== CONFIG =====
const SET_OF_4_DISCOUNT = 0.05; // 5% off a full set of 4 wheels

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
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        history.pushState(null, '', href);
        return;
      }
    }
    closeMobileMenu();
  });
});

// ===== NAV BRANDS ACCORDION (mobile) =====
const navSubToggle = document.getElementById('navSubToggle');
const navSubMenu = document.getElementById('navSubMenu');

navSubToggle.addEventListener('click', (e) => {
  e.preventDefault();
  const isOpen = navSubMenu.classList.contains('open');
  navSubMenu.classList.toggle('open', !isOpen);
  navSubToggle.classList.toggle('open', !isOpen);
});

// Nav brand sub-links — built dynamically after wheelData loads (see buildNavBrands below)

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
  ],
  vors: [
    { id: 'all', label: 'All Series' },
    { id: 'tr', label: 'TR Series' },
    { id: 'vr', label: 'VR Series' },
    { id: 'splt', label: 'SP/LT Series' }
  ]
};

function renderSeriesTabs(brand) {
  const series = brandSeriesMap[brand];
  if (!series) {
    seriesTabsContainer.innerHTML = '';
    return;
  }
  // Skip the "All Series" tab — user picks a specific series to expand
  const specificSeries = series.filter(s => s.id !== 'all');
  seriesTabsContainer.innerHTML = specificSeries.map(s =>
    `<button class="series-tab" data-series="${s.id}" data-brand="${brand}">${s.label}</button>`
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

// ===== MODEL JUMP DROPDOWN =====
const modelJumpWrap = document.getElementById('modelJumpWrap');
const modelJumpSelect = document.getElementById('modelJumpSelect');

function getBrandWheelKeys(brand) {
  const prefixes = {
    aodhan: (id) => id.startsWith('ah') || id.startsWith('ds') || id.startsWith('aff'),
    mflow: (id) => id.startsWith('mf'),
    vors: (id) => id.startsWith('vors-')
  };
  const test = prefixes[brand];
  if (!test) return [];
  return Object.keys(wheelData).filter(test);
}

function populateModelJump(brand) {
  if (brand === 'all') {
    modelJumpWrap.classList.remove('visible');
    return;
  }
  const keys = getBrandWheelKeys(brand);
  modelJumpSelect.innerHTML = '<option value="">Jump to a model...</option>' +
    keys.map(id => `<option value="${id}">${wheelData[id]?.name || id}</option>`).join('');
  modelJumpWrap.classList.add('visible');
}

modelJumpSelect.addEventListener('change', () => {
  const id = modelJumpSelect.value;
  if (!id) return;
  openWheelModal(id);
  modelJumpSelect.value = '';
});

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
        // Show all series groups when viewing all brands
        section.querySelectorAll('.series-group[data-series]').forEach(g => g.classList.remove('series-hidden'));
      } else {
        section.classList.toggle('hidden', section.dataset.brand !== brand);
        // Hide all series groups — user must pick a series first
        section.querySelectorAll('.series-group[data-series]').forEach(g => g.classList.add('series-hidden'));
      }
    });

    // Render series sub-tabs
    renderSeriesTabs(brand);

    // Populate model jump dropdown
    populateModelJump(brand);
  });
});

// ===== WHEEL DATA =====
const wheelData = {
  // AH Series
  ah01: {
    name: 'AODHAN AH01',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH01_1580_SMF_03_c945adcb-3d0e-462c-9707-484af09d073f.jpg?v=1749494722&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH01_179010H_SMF_03_bc9a113f-5723-437e-9612-804713c35078.jpg?v=1749494722&width=800'
    ],
    variants: {
      '15x8': { finishes: ['Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH01_1580_SMF_03_c945adcb-3d0e-462c-9707-484af09d073f.jpg?width=800'},
      '16x8': { finishes: ['Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+15'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH01_1680_SMF_03_e91ea0ef-8aa6-4435-b88f-491023376d59.jpg?width=800'},
      '17x9': { finishes: ['Silver Machined Face'], boltPatterns: ['5x100/114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH01_179010H_SMF_03_bc9a113f-5723-437e-9612-804713c35078.jpg?width=800'},
      '18x9.5': { finishes: ['Silver Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH01_1895_SMF_01_df5a9c47-bc13-41c4-b8b0-419f67d20bbe.jpg?width=800'}
    }
  },
  ah02: {
    name: 'AODHAN AH02',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$237 – $262 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AH02_17808H_GB_03.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AH02_1885_GB_03.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['4x100/114.3', '5x100/114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_17808H_SML_03.jpg?width=800'},
      '18x8.5': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x100', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1885_SML_03.jpg?width=800'},
      '18x9.5': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x100', '5x114.3', '5x120'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_SML_03.jpg?width=800'},
      '19x11': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1911_SML_03.jpg?width=800'},
      '19x8.5': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+32', '+35'] },
      '19x9.5': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+12', '+22', '+30', '+35'], boltOffsets: { '5x112': ['+12', '+22', '+30'], '5x114.3': ['+12', '+22', '+30'], '5x120': ['+35'] }, image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1995_SML_03.jpg?width=800'}
    }
  },
  ah03: {
    name: 'AODHAN AH03',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH03_179010H_GB_03_bbc5dc32-4ddb-4e58-9cfc-fe188386f434.jpg?v=1749494710&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH03_1680_GB_03_e689a6b9-0a5c-45d8-b50b-0deba830a440.jpg?v=1749494709&width=800'
    ],
    variants: {
      '15x8': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1580_GB_03_da29ffaa-b6a5-4a78-8d82-602abd95a940.jpg?width=800'},
      '16x8': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+15'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1680_SMF_01_e9fcb650-f943-4132-89ed-fd8fe1d74501.jpg?width=800'},
      '17x9': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x100/114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_179010H_GB_03_bbc5dc32-4ddb-4e58-9cfc-fe188386f434.jpg?width=800'},
      '18x10.5': { finishes: ['Silver Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_18105_SMF_01_8cb940d3-1603-442d-a82c-6ea58fbb9ec8.jpg?width=800'},
      '18x9.5': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1895_SMF_01_a9be5c1a-f60b-4ffe-94fe-848c3f2429d4.jpg?width=800'},
      '19x11': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1911_SMF_01_58680268-b465-4fd4-825a-92f512485f5e.jpg?width=800'},
      '19x9.5': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+12', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1995_GB_01_2f6052cd-2a7b-4f05-a898-5a8722850406.jpg?width=800'}
    }
  },
  ah04: {
    name: 'AODHAN AH04',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$162 – $207 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH04_179010H_SMF_03_f34e9704-835d-4c3b-b356-7287ebf406b7.jpg?v=1749494706&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH04_1580_MS_03.jpg?v=1749494706&width=800'
    ],
    variants: {
      '15x8': { finishes: ['Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH04_1580_MS_03.jpg?width=800'},
      '16x8': { finishes: ['Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+15'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH04_1680_SMF_01_e0b8e762-8a2d-4751-ae7f-49bce4849870.jpg?width=800'},
      '17x9': { finishes: ['Silver Machined Face'], boltPatterns: ['5x100/114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH04_179010H_SMF_03_f34e9704-835d-4c3b-b356-7287ebf406b7.jpg?width=800'},
      '18x9.5': { finishes: ['Silver Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH04_1895_SMF_03_da941199-cf64-4056-95de-e499e6d860b0.jpg?width=800'}
    }
  },
  ah05: {
    name: 'AODHAN AH05',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$162 – $237 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH05_179010H_GB_03_94785440-bdb2-43bf-b0df-b7755d450e40.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH05_1885_GB_03_156efae4-7220-4320-bfe1-0743b65e5149.jpg?width=800'
    ],
    variants: {
      '15x8': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1580_SMF_03_dd5e4bbd-06dd-49ff-85fb-8b3a5471a9b8.jpg?width=800'},
      '16x8': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['4x100/114.3'], offsets: ['+15'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1680_SMF_03.jpg?width=800'},
      '17x9': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x100/114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_179010H_SMF_03_e40f1159-e01d-4d42-b54a-50915d26f5ca.jpg?width=800'},
      '18x8.5': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1885_SMF_03.jpg?width=800'},
      '18x9.5': { finishes: ['Gloss Black', 'Silver Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1895_SMF_03.jpg?width=800'}
    }
  },
  ah06: {
    name: 'AODHAN AH06',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$224 – $249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_MS_01.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_BRZ_03_0b441f17-3a38-44d3-96bb-b8ddf4fc1635.jpg?v=1749494698&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Machined Silver', 'Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://www.aodhanwheels.com/cdn/shop/products/AH06_1790_MS_01.jpg?width=800'},
      '18x10': { finishes: ['Machined Silver', 'Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x114.3'], offsets: ['+25'], image: 'https://www.aodhanwheels.com/cdn/shop/products/AH06_1810_MS_01.jpg?width=800'},
      '18x9': { finishes: ['Machined Silver', 'Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30'], image: 'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_MS_01.jpg?width=800'}
    }
  },
  ah07: {
    name: 'AODHAN AH07',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH07_1885_BRZ_02_47a7ed17-066a-4429-a93a-68d8278a5877.jpg?v=1749494695&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH07_1885_GB_02_4c7a50c2-a127-4ba6-8a47-395e8b214986.jpg?v=1749494695&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Gloss Black', 'Gloss White', 'Hyper Black', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1885_BRZ_01_4879e738-46cc-437f-96f6-e30943f06adb.jpg?width=800'},
      '18x9.5': { finishes: ['Gloss Black', 'Gloss White', 'Hyper Black', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1895_GB_01_f88ba417-d4bd-4e8c-8cc1-d0ea6256a622.jpg?width=800'}
    }
  },
  ah08: {
    name: 'AODHAN AH08',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH08_1885_BRZ_03_698bc731-eaf4-4451-a92f-efdf6f91b5f4.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH08_1885_GB_03.jpg?width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Gloss Black', 'Gloss White', 'Hyper Black', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1885_HB_03.jpg?width=800'},
      '18x9.5': { finishes: ['Gloss Black', 'Gloss White', 'Hyper Black', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1895_HB_03.jpg?width=800'}
    }
  },
  ah09: {
    name: 'AODHAN AH09',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AH09_1885_MS_D_03.jpg?v=1749494596&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH09_1895_MS_D_03.jpg?v=1749494596&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Hyper Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x100', '5x108', '5x112', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_MS_D_03.jpg?width=800'},
      '18x9.5': { finishes: ['Hyper Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1895_MS_D_03.jpg?width=800'}
    }
  },
  ahx: {
    name: 'AODHAN AHX',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AHX_1885_HBLK_03.jpg?v=1752518439&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AHX_1895_HBLK_03.jpg?v=1752518439&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1885_MS_03.jpg?width=800'},
      '18x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1895_MS_03.jpg?width=800'},
      '19x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1985_MS_03.jpg?width=800'},
      '19x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1995_MS_03.jpg?width=800'}
    }
  },
  ah11: {
    name: 'AODHAN AH11',
    series: 'AH Series — Classic Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$249 – $299 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/AH11_1885_MS_03.jpg?v=1749494550&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/AH11_1895_MS_03.jpg?v=1749494550&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1885_MS_03.jpg?width=800'},
      '18x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1895_MS_03.jpg?width=800'},
      '19x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] }
    }
  },
  // DS Series
  ds01: {
    name: 'AODHAN DS01',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS01_1885_BRONZE_03_52b41525-7011-44e1-8919-62f099957031.jpg?width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS01_1885_GB_03_458fba51-fb98-477c-b57e-6dbf8172a167.jpg?width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Black Vacuum (PVD)', 'Gloss Black', 'Silver w/Machined Lip', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+15', '+22', '+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_18105_SML_01_f90c839c-4c87-4001-ab75-c4ecb1ec3445.jpg?width=800'},
      '18x8.5': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gloss Black', 'Gold Vacuum (PVD)', 'Silver w/Machined Lip', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_GB_01_ed615246-dbd4-48bb-872d-a5e5de8997b8.jpg?width=800'},
      '18x9.5': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gloss Black', 'Gold Vacuum (PVD)', 'Silver w/Machined Lip', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x100', '5x114.3', '5x120'], offsets: ['+15', '+22', '+25', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1895_GB_03_b5e41f49-f72c-48c3-8b26-e740338ecdd3.jpg?width=800'},
      '19x10.5': { finishes: ['Black Vacuum (PVD)', 'Gloss Black', 'Gold Vacuum (PVD)', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_19105_GB_03_ecd77ede-0d1f-43fc-a2d0-b9e7476eba81.jpg?width=800'},
      '19x9.5': { finishes: ['Black Vacuum (PVD)', 'Gloss Black', 'Gold Vacuum (PVD)', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1995_VG_03_c8d341de-23cd-4bf2-ab54-6bdb51413097.jpg?width=800'}
    }
  },
  ds02: {
    name: 'AODHAN DS02',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS02_1885_BRZ_03_bae8b50d-0182-4be2-813e-493b07e46567.jpg?v=1749494658&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS02_1895_BRZML_03.jpg?v=1749494658&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gold Vacuum (PVD)', 'Hyper Black', 'Silver w/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_18105_SMF_03.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Hyper Black', 'Silver w/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1885_SMF_03.jpg?width=800'},
      '18x9.5': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gold Vacuum (PVD)', 'Hyper Black', 'Silver w/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1895_SMF_03.jpg?width=800'},
      '19x11': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gold Vacuum (PVD)', 'Hyper Black', 'Silver W/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1911_SMF_03.jpg?width=800'},
      '19x8.5': { finishes: ['Bronze w/Machined Lip', 'Hyper Black', 'Silver W/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Black Vacuum (PVD)', 'Bronze w/Machined Lip', 'Gold Vacuum (PVD)', 'Hyper Black', 'Silver W/Machined Face', 'Vacuum Chrome (PVD)'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22', '+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1995_SMF_03.jpg?width=800'}
    }
  },
  ds03: {
    name: 'AODHAN DS03',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 – $299 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/files/DS03_1895_MS_03D.jpg?v=1749494676&width=800',
      'https://www.aodhanwheels.com/cdn/shop/files/DS03_1895_MS_03P.jpg?v=1749494676&width=800'
    ],
    variants: {
      '18x9.5': { finishes: ['Black Vacuum', 'Gold Vacuum', 'Silver w/Machined Face', 'Vacuum Chrome'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/DS03_1895_MS_03D.jpg?width=800'}
    }
  },
  ds05: {
    name: 'AODHAN DS05',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS05_BRZ_1885_03.jpg?v=1749494649&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS05_1895_BRZ_03.jpg?v=1749494649&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_18105_SMF_03_c437ea07-45c2-4142-9724-46d04ccb75c6.jpg?width=800'},
      '18x8.5': { finishes: ['Black Vacuum', 'Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1885_GB_03_ca49bed6-bd5f-4255-b6af-5615052c480d.jpg?width=800'},
      '18x9.5': { finishes: ['Black Vacuum', 'Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1895_BRZ_03.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1911_SMF_03_b1dabeee-6f3a-49e3-9b26-a9c9da66c8be.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1995_GB_03_ef7987c3-f768-4000-b993-7309ae7a51bc.jpg?width=800'}
    }
  },
  ds06: {
    name: 'AODHAN DS06',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS06_1885_GB_03_832affc0-0e8d-428b-8cec-6b468e1ea0c8.jpg?v=1749494619&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS06_1895_GB_03_750b5340-59be-4d9b-9936-a2533b79e034.jpg?v=1749494619&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_18105_SMF_01.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1885_BRONZE_01_e3844a1a-8486-4f93-80ba-5b33c98343ad.jpg?width=800'},
      '18x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1895_SMF_03_ff12ed63-e6c7-4cbc-88ad-574207d444d9.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1911_SMF_03_f7a1269a-4d89-4a86-b852-a7998704de1f.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1995_SMF_03_e54ad052-9b75-4375-81a0-42d2ea1f2d6d.jpg?width=800'}
    }
  },
  ds07: {
    name: 'AODHAN DS07',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$249 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS07_1885_GB_03.jpg?v=1749494614&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS07_1895_GB_03.jpg?v=1749494614&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_18105_SMF_03.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1885_GB_03.jpg?width=800'},
      '18x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1895_SMF_03.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1911_SMF_03.jpg?width=800'},
      '19x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1985_SMF_03.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22', '+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1995_SMF_03.jpg?width=800'}
    }
  },
  ds08: {
    name: 'AODHAN DS08',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$274 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS08_1885_BZ_03.jpg?v=1749494587&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS08_1895_BZ_03.jpg?v=1749494587&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_18105_MS_03.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1885_MS_03.jpg?width=800'},
      '18x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3', '5x120'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1895_MS_03.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1911_MS_03.jpg?width=800'},
      '19x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1985_MS_03.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black', 'Silver w/Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1995_MS_03.jpg?width=800'}
    }
  },
  ds09: {
    name: 'AODHAN DS09',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$274 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DS09_1885_BZML_03_0d6eac8f-3909-498f-8d30-fed270016d8a.jpg?v=1749494569&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DS09_1995_BZML_03_349edecc-c85b-44d8-a6df-c35936768370.jpg?v=1749494569&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_18105_GB_01_c83f1724-139b-493b-b62d-daec0abbc491.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1885_SMF_01_c1d7efa9-e364-41ad-a9b4-4f4b1390c558.jpg?width=800'},
      '18x9.5': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1895_GB_01_9e5cf815-37d9-4033-9eeb-11ad9e45fd1b.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1911_GB_01_f3204c5d-188c-4b98-8e54-d071b4546cf9.jpg?width=800'},
      '19x8.5': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1985_CR_01_83d7cdcd-d4c2-4be8-8999-eff1c4482c0a.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Candy Red w/ (Chrome Rivets)', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22', '+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1995_SMF_03_c8e78d8a-fa29-4f18-8dc9-0734f00c0e32.jpg?width=800'}
    }
  },
  dsx: {
    name: 'AODHAN DSX',
    series: 'DS Series — Deep Concave',
    centerBore: '73.1mm',
    priceRange: '$206 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/DSX_1885_BZML_03.jpg?v=1749494544&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/DSX_1895_BZML_03.jpg?v=1749494544&width=800'
    ],
    variants: {
      '18x10.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_18105_SMF_03.jpg?width=800'},
      '18x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1885_SMF_03.jpg?width=800'},
      '18x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+15', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1895_SMF_03.jpg?width=800'},
      '19x11': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1911_SMF_03.jpg?width=800'},
      '19x8.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1985_SMF_03.jpg?width=800'},
      '19x9.5': { finishes: ['Bronze w/Machined Lip', 'Gloss Black W /Gold Rivets', 'Silver w/Machined Face'], boltPatterns: ['5x114.3'], offsets: ['+15', '+22', '+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1995_SMF_03.jpg?width=800'}
    }
  },
  // AFF Series
  aff1: {
    name: 'AODHAN AFF1',
    series: 'AFF Series — Flow Form',
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF1_2090_MB_03_e46a0924-dbb8-4456-a6a5-b44a706063d8.jpg?v=1749494680&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF1_2090_MBRZ_03_7574050d-541f-4e91-8398-7c77c4f8a342.jpg?v=1749494680&width=800'
    ],
    variants: {
      '20x10.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+35', '+45'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF1_20105_SMF_03_dce2b951-ff5e-4171-9323-44c3b64e9a72.jpg?width=800'},
      '20x9': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+30', '+32'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF1_2090_MB_03_e46a0924-dbb8-4456-a6a5-b44a706063d8.jpg?width=800'}
    }
  },
  aff2: {
    name: 'AODHAN AFF2',
    series: 'AFF Series — Flow Form',
    centerBore: '66.6mm (5x112) / 73.1mm (5x114.3)',
    priceRange: '$224 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF02_1985_SMF_03.jpg?v=1749494562&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF02_1995_SMF_03.jpg?v=1749494562&width=800'
    ],
    variants: {
      '19x8.5': { finishes: ['Matte Black', 'Matte Bronze', 'Matte Gray', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1985_SMF_03.jpg?width=800'},
      '19x9.5': { finishes: ['Matte Black', 'Matte Bronze', 'Matte Gray', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1995_SMF_03.jpg?width=800'},
      '20x10.5': { finishes: ['Matte Black', 'Matte Bronze', 'Matte Gray', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+45'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_20105_SMF_03.jpg?width=800'},
      '20x9': { finishes: ['Matte Black', 'Matte Bronze', 'Matte Gray', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30', '+32'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_2090_SMF_03.jpg?width=800'}
    }
  },
  aff3: {
    name: 'AODHAN AFF3',
    series: 'AFF Series — Flow Form',
    centerBore: '73.1mm (72.6 for 5x120)',
    priceRange: '$362 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_2090_MS_03.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_20105_MS_03.jpg?width=800'
    ],
    variants: {
      '20x10.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+35', '+45'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_20105_MS_03.jpg?width=800'},
      '20x9': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+30', '+32'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_2090_MS_03.jpg?width=800'}
    }
  },
  aff7: {
    name: 'AODHAN AFF7',
    series: 'AFF Series — Flow Form',
    centerBore: '66.6mm',
    priceRange: '$274 – $362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF7_1885_SMF_03.jpg?v=1749494580&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF7_2090_SMF_03.jpg?v=1749494581&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1885_SMF_03.jpg?width=800'},
      '18x9.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1895_SMF_03.jpg?width=800'},
      '19x8.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1985_SMF_03.jpg?width=800'},
      '19x9.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1995_SMF_03.jpg?width=800'},
      '20x10.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_20105_SMF_03.jpg?width=800'},
      '20x9': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_2090_SMF_03.jpg?width=800'}
    }
  },
  aff9: {
    name: 'AODHAN AFF9',
    series: 'AFF Series — Flow Form',
    centerBore: '72.6mm',
    priceRange: '$362 /wheel',
    images: [
      'https://www.aodhanwheels.com/cdn/shop/products/AFF9_2090_MB_03_f7785824-4973-49ac-856b-12205908e088.jpg?v=1749494553&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF9_2090_MBZ_03_2efee466-3cb1-4d9e-b2d7-959f57cd23ea.jpg?v=1749494553&width=800'
    ],
    variants: {
      '20x10.5': { finishes: ['Gloss Silver Machined Face', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF9_20105_SMF_01_d2b00b4d-163a-46bf-9a86-cfcd731f9606.jpg?width=800'},
      '20x9': { finishes: ['Gloss Silver Machined Face', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF9_2090_SMF_03_f31ad647-da5f-45ae-94ab-39688d506389.jpg?width=800'}
    }
  },
  // ===== MFLOW RACING =====
  // MFR Series
  mfr1: {
    name: 'MFLOW MFR1',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$237 /wheel',
    images: [
      'https://www.mflowracing.com/cdn/shop/files/MFR1-2085-MACHINEDSILVER1.jpg?v=1771531382&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-hyper-black-unleashedwheels.jpg?v=1724878850&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-matte-bronze-unleashedwheels.jpg?v=1724879474&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'] } },
      '20x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'], '5x120': ['+38'] } }
    }
  },
  mfr2: {
    name: 'MFLOW MFR2',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-black-unleashedwheels.jpg?v=1724881053&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-bronze-unleashedwheels.jpg?v=1724884011&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'], '5x120': ['+38'] } },
      '20x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'] } }
    }
  },
  mfr3: {
    name: 'MFLOW MFR3',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-gloss-black-unleashedwheels.jpg?v=1724886960&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-hyper-silver-unleashedwheels.jpg?v=1724884908&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-matte-bronze-unleashedwheels.jpg?v=1724886960&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Gloss Black', 'Hyper Silver', 'Matte Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Gloss Black', 'Hyper Silver', 'Matte Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Gloss Black', 'Hyper Silver', 'Matte Bronze'], boltPatterns: ['5x114.3'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Gloss Black', 'Hyper Silver', 'Matte Bronze'], boltPatterns: ['5x114.3'], offsets: ['+35'] }
    }
  },
  mfr4: {
    name: 'MFLOW MFR4',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://www.mflowracing.com/cdn/shop/files/MFR4HyperSilverMachinedTip.jpg?v=1771542352&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-black-unleashedwheels.jpg?v=1743713898&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-bronze-unleashedwheels.jpg?v=1743711412&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Matte Black Machine Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Matte Black Machine Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Matte Black Machine Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'], boltOffsets: { '5x100': ['+35'], '5x114.3': ['+35'], '5x112': ['+38'], '5x120': ['+38'] } }
    }
  },
  // MFL Series
  mfl1: {
    name: 'MFLOW MFL1',
    series: 'MFL Series — Flow Forming',
    centerBore: '73.1mm',
    priceRange: '$237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-chrome-unleashedwheels.jpg?v=1725407132&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-matte-black-machined-lip.jpg?v=1725060775&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-matte-bronze-unleashedwheels.jpg?v=1725407132&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30', '+35', '+38'], boltOffsets: { '5x114.3': ['+30', '+35'], '5x112': ['+38'], '5x120': ['+38'] } },
      '20x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'], '5x120': ['+38'] } }
    }
  },
  mfl2: {
    name: 'MFLOW MFL2',
    series: 'MFL Series — Flow Forming',
    centerBore: '73.1mm',
    priceRange: '$237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-chrome-unleashedwheels.jpg?v=1725491264&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-matte-bronze-unleashedwheels.jpg?v=1725490367&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'] },
      '19x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30', '+38'], boltOffsets: { '5x114.3': ['+30'], '5x112': ['+38'], '5x120': ['+38'] } },
      '20x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'], boltOffsets: { '5x114.3': ['+35'], '5x112': ['+38'], '5x120': ['+38'] } }
    }
  },
  // MF Series (Offroad)
  mf01: {
    name: 'MFLOW MF01',
    series: 'MF Series — Offroad',
    centerBore: '71.5mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML1-Matte-Bronze-Wheels-Rims_3ad8bf49-f08a-49bb-9302-06533e4b7df0.jpg?v=1760723096&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['5x127'], offsets: ['-12', '+12'] }
    }
  },
  mf02: {
    name: 'MFLOW MF02',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML2-Matte-Bronze-Wheels-Rims_fb68a9cd-c705-430c-8528-82482fadc791.jpg?v=1760723100&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['5x127', '6x135', '6x139.7'], offsets: ['-12', '+0', '+12'] }
    }
  },
  mf03: {
    name: 'MFLOW MF03',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML3-Matte-Bronze-Wheels-Rims_cbb74392-f31f-4e29-a763-a3baa6144e46.jpg?v=1760723105&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['6x135', '6x139.7'], offsets: ['-12', '+0'] }
    }
  },
  mf04: {
    name: 'MFLOW MF04',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML4-Matte-Bronze-Wheels-Rims_11ea4bd5-2319-4dac-99cf-e21577708852.jpg?v=1760723110&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['5x127', '6x135', '6x139.7'], offsets: ['-12', '+0', '+12'] }
    }
  },
  mf05: {
    name: 'MFLOW MF05',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML5-Matte-Bronze-Wheels-Rims_1169e107-97e2-4715-aa91-370bbd559acc.jpg?v=1760723116&width=800'
    ],
    variants: {
      '17x8.5': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['6x139.7'], offsets: ['+5', '+25'] },
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['5x127', '6x135', '6x139.7'], offsets: ['-12', '+0', '+12'] }
    }
  },
  mf06: {
    name: 'MFLOW MF06',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$224 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML6-Matte-Bronze-Wheels-Rims_703504bc-3243-4c2f-9474-de40328a625c.jpg?v=1760723123&width=800'
    ],
    variants: {
      '17x8.5': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['6x139.7'], offsets: ['+5', '+25'] },
      '17x9': { finishes: ['Matte Black', 'Matte Bronze', 'Machined Silver'], boltPatterns: ['6x135', '6x139.7'], offsets: ['-12', '+0'] }
    }
  },
  // ===== VORS =====
  // TR Series
  'vors-tr4': {
    name: 'VORS TR4',
    series: 'TR Series — Track Road',
    centerBore: '73.1mm',
    priceRange: '$195 – $295 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_HB.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_17X8_SILVER.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_17X8_SILVER.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_17X9_HB_1.jpg?width=800'},
      '18x10.5': { finishes: ['Black', 'Hyper Black', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X105_BK_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_HB.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+22', '+35'], boltOffsets: { '5x100': ['+35'], '5x114.3': ['+22', '+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X95_HB_8446ef59-62df-4edc-b33d-6f6db88dfbaa.jpg?width=800'},
      '19x10.5': { finishes: ['Black', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X105_GLOSS_BLACK_bb0d763c-2c8d-4e6c-8822-de430178cce8.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X85_BK_1.jpg?width=800'},
      '19x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22', '+35'], boltOffsets: { '5x114.3': ['+22', '+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X95_HB_1.jpg?width=800'},
      '20x8.5': { finishes: ['Black', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_20X85_HB_1.jpg?width=800'},
      '20x9.5': { finishes: ['Black', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_20X95_HB_1.jpg?width=800'}
    }
  },
  'vors-tr10': {
    name: 'VORS TR10',
    series: 'TR Series — Track Road',
    centerBore: '73.1mm',
    priceRange: '$175 – $250 /wheel',
    images: [
      'https://www.vorswheels.com/cdn/shop/files/TR10_18X85_BK_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/TR10_18X85_W_1.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '17x9': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'] },
      '18x8.5': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR10_18X85_BK_1.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR10_18X95_BK_1.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Black', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] }
    }
  },
  'vors-tr14': {
    name: 'VORS TR14',
    series: 'TR Series — Track Road',
    centerBore: '73.1mm',
    priceRange: '$195 – $250 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X8_S_1.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X9_S_1.jpg?width=800'
    ],
    variants: {
      '18x8': { finishes: ['Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X8_S_1.jpg?width=800'},
      '18x9': { finishes: ['Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X9_S_1.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] }
    }
  },
  'vors-tr37': {
    name: 'VORS TR37',
    series: 'TR Series — Track Road',
    centerBore: '73.1mm',
    priceRange: '$165 – $275 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X85_HB.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_17X8_BR_1.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_17X8_BR_1.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_17X9_W_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X85_HB.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], boltOffsets: { '5x114.3': ['+22', '+35'], '5x108': ['+35'], '5x110': ['+35'], '5x112': ['+35'], '5x115': ['+35'], '5x120': ['+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_HB.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_19X85_W_1.jpg?width=800'},
      '19x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], boltOffsets: { '5x114.3': ['+22', '+35'], '5x108': ['+35'], '5x110': ['+35'], '5x112': ['+35'], '5x115': ['+35'], '5x120': ['+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_19X95_BR_1.jpg?width=800'}
    }
  },
  'vors-tr88': {
    name: 'VORS TR88',
    series: 'TR Series — Track Road',
    centerBore: '73.1mm',
    priceRange: '$220 – $325 /wheel',
    images: [
      'https://www.vorswheels.com/cdn/shop/files/TR88_19X95_S_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/TR88_18X95_MBR_1.jpg?width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_18X95_MBR_1.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_19X95_S_1.jpg?width=800'},
      '20x10.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+38'] },
      '20x9': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_20X9_BK_1.jpg?width=800'}
    }
  },
  // VR Series
  'vors-vr8': {
    name: 'VORS VR8',
    series: 'VR Series — Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$220 – $365 /wheel',
    images: [
      'https://www.vorswheels.com/cdn/shop/files/VR8_19X95_S_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/VR8_18X9_HB_CR_MAIN_grande.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '18x8': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x100', '5x105', '5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_18X8_HB_ML_CR.jpg?width=800'},
      '18x9': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_18X9_HB_CR_MAIN.jpg?width=800'},
      '19x8.5': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_19X85_HB_1.jpg?width=800'},
      '19x9.5': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], boltOffsets: { '5x114.3': ['+22', '+35'], '5x108': ['+35'], '5x110': ['+35'], '5x112': ['+35'], '5x115': ['+35'], '5x120': ['+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_19X95_S_1.jpg?width=800'},
      '20x8.5': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_20X85_GB_1_5ae9b9d4-fd34-4dde-97bc-008bfe2aa565.jpg?width=800'},
      '20x9.5': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_20X95_S_1.jpg?width=800'}
    }
  },
  'vors-ar1': {
    name: 'VORS AR1',
    series: 'VR Series — Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$185 – $235 /wheel',
    images: [
      'https://www.vorswheels.com/cdn/shop/files/AR01_18X85_SILVER_STD.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/AR01_18X95_SILVER_STD.jpg?width=800'
    ],
    variants: {
      '17x8.5': { finishes: ['Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '18x8.5': { finishes: ['Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR01_18X85_SILVER_STD.jpg?width=800'},
      '18x9.5': { finishes: ['Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR01_18X95_SILVER_STD.jpg?width=800'}
    }
  },
  'vors-ar5': {
    name: 'VORS AR5',
    series: 'VR Series — Multi-Spoke',
    centerBore: '73.1mm',
    priceRange: '$210 – $285 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X9_BK_1.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR05_18X95_SILVER_STD.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X8_BK_1.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X9_BK_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR05_18X95_SILVER_STD.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30', '+35'], boltOffsets: { '5x114.3': ['+30', '+35'], '5x108': ['+30'], '5x110': ['+30'], '5x112': ['+30'], '5x115': ['+30'], '5x120': ['+30'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR05_18x95_SILVER_STD_400179be-62a3-4ca6-9796-4f0ec060c171.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_19X85_BK_1.jpg?width=800'},
      '19x9.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_19X95_BK_1.jpg?width=800'}
    }
  },
  // SP/LT Series
  'vors-sp1': {
    name: 'VORS SP1',
    series: 'SP/LT Series — Sport Entry',
    centerBore: '73.1mm',
    priceRange: '$165 – $280 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X9_SILVER_2KPX.jpg?width=800',
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X8_HB.jpg?width=800'
    ],
    variants: {
      '15x7': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100', '4x108'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_15X7_HB_1.jpg?width=800'},
      '15x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_15X8_HB_ML.jpg?width=800'},
      '16x7': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+38'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_16X7_HB_1.jpg?width=800'},
      '16x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_16X8_WHITE_1.jpg?width=800'},
      '17x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108', '5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+30', '+35'], boltOffsets: { '4x100/114.3': ['+35'], '4x108': ['+35'], '5x100/114.3': ['+30', '+35'], '5x105': ['+30', '+35'], '5x108': ['+30', '+35'], '5x110': ['+30', '+35'], '5x112': ['+30', '+35'], '5x115': ['+30', '+35'], '5x120': ['+30', '+35'] }, image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_17X8_8H_HBML_1.jpg?width=800'},
      '17x9': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined'], boltPatterns: ['5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_17X9_10H_SILVER_1.jpg?width=800'},
      '18x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X8_HB.jpg?width=800'},
      '18x9': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X9_SILVER_2KPX.jpg?width=800'},
      '19x8.5': { finishes: ['Hyper Black', 'Silver Machined'], boltPatterns: ['5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_19X85_SF_1.jpg?width=800'},
      '19x9.5': { finishes: ['Hyper Black', 'Silver Machined'], boltPatterns: ['5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+35'] }
    }
  },
  'vors-lt53': {
    name: 'VORS LT53',
    series: 'SP/LT Series — Sport Entry',
    centerBore: '73.1mm',
    priceRange: '$215 – $245 /wheel',
    images: [
      'https://www.vorswheels.com/cdn/shop/files/LT53_18X9_BK_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/LT53_18X9_GM_1.jpg?width=800'
    ],
    variants: {
      '18x8': { finishes: ['Black', 'Gun Metal'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/LT53_18X8_GM_1.jpg?width=800'},
      '18x9': { finishes: ['Black', 'Gun Metal'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/LT53_18X9_GM_1.jpg?width=800'}
    }
  },
  'vors-uo2': {
    name: 'VORS UO2',
    series: 'SP/LT Series — Sport Entry',
    centerBore: '73.1mm',
    priceRange: '$230 – $248 /wheel',
    images: [
      'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/UO2_18X85_S_1.jpg?width=800'
    ],
    variants: {
      '19x8.5': { finishes: ['Black', 'Hyper Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Black', 'Hyper Silver'], boltPatterns: ['5x114.3'], offsets: ['+35', '+40'] }
    }
  }
};

// ===== WEIGHT & LIP DATA (from manufacturer sites) =====
// Format: { 'wheelId': { 'size': { weight: lbs, lip: inches } } }
const wheelSpecs = {
  ah02: {
    '17x8':   { weight: 19.8, lip: '2.02"' },
    '18x8.5': { weight: 21.1, lip: '2"' },
    '18x9.5': { weight: 21.7, lip: '2.69"' },
    '19x8.5': { weight: 23.6, lip: '2"' },
    '19x9.5': { weight: 24.2, lip: '2.99"' },
    '19x11':  { weight: 25.6, lip: '3.9"' }
  },
  ah03: {
    '15x8':   { weight: 16.7, lip: '2.75"' },
    '16x8':   { weight: 17.9, lip: '2.9"' },
    '17x9':   { weight: 23.6, lip: '3"' },
    '18x9.5': { weight: 25.9, lip: '3"' },
    '19x9.5': { weight: 27.5, lip: '3"' },
    '19x11':  { weight: 28.2, lip: '3.9"' }
  },
  ah04: {
    '15x8':   { weight: 17.2, lip: '2"' },
    '16x8':   { weight: 18.1, lip: '2"' },
    '17x9':   { weight: 21.9, lip: '1.9"' },
    '18x9.5': { weight: 24.5, lip: '2"' }
  },
  ah05: {
    '15x8':   { weight: 16.7, lip: '2.5"' },
    '16x8':   { weight: 18.5, lip: '2.5"' },
    '17x9':   { weight: 22.5, lip: '2.25"' },
    '18x8.5': { weight: 25.6, lip: '2"' },
    '18x9.5': { weight: 26, lip: '2.5"' }
  },
  ah06: {
    '17x9':   { weight: 17.8, lip: '2.38"' },
    '18x9':   { weight: 19.2, lip: '2.37"' },
    '18x10':  { weight: 20.1, lip: '2.9"' }
  },
  ah07: {
    '18x8.5': { weight: 19.6, lip: '1.67"' },
    '18x9.5': { weight: 20.4, lip: '1.73"' }
  },
  ah08: {
    '18x8.5': { weight: 19.6, lip: '2.03"' },
    '18x9.5': { weight: 20.9, lip: '2.03"' }
  },
  ah09: {
    '18x8.5': { weight: 19.3, lip: '1.57"' },
    '18x9.5': { weight: 19.9, lip: '2.26"' }
  },
  ahx: {
    '18x8.5': { weight: 20.3, lip: '1.88"' },
    '18x9.5': { weight: 20.9, lip: '2.38"' },
    '19x8.5': { weight: 22.9, lip: '1.88"' },
    '19x9.5': { weight: 22.9, lip: '2.38"' }
  },
  ah11: {
    '18x8.5': { weight: 18.8, lip: '1.83"' },
    '18x9.5': { weight: 19.4, lip: '2.31"' },
    '19x8.5': { weight: 21.6, lip: '1.85"' },
    '19x9.5': { weight: 21.7, lip: '2.33"' }
  },
  ds01: {
    '18x8.5':  { weight: 24, lip: '2.15"' },
    '18x9.5':  { weight: 25.7, lip: '2.5"' },
    '18x10.5': { weight: 25.5, lip: '3.5"' },
    '19x9.5':  { weight: 28, lip: '2.6"' },
    '19x10.5': { weight: 27.5, lip: '3.7"' }
  },
  ds02: {
    '18x8.5':  { weight: 23.6, lip: '2.04"' },
    '18x9.5':  { weight: 23.8, lip: '2.63"' },
    '18x10.5': { weight: 25.1, lip: '3.5"' },
    '19x8.5':  { weight: 24.8, lip: '2.04"' },
    '19x9.5':  { weight: 25.6, lip: '2.5"' },
    '19x11':   { weight: 28.6, lip: '3.5"' }
  },
  ds03: {
    '18x9.5': { weight: 26.2, lip: '2.95"' }
  },
  ds05: {
    '18x8.5':  { weight: null, lip: '2.09"' },
    '18x9.5':  { weight: null, lip: '2.28"' },
    '18x10.5': { weight: null, lip: '3.07"' },
    '19x9.5':  { weight: null, lip: '2.28"' },
    '19x11':   { weight: null, lip: '3.27"' }
  },
  ds06: {
    '18x8.5':  { weight: null, lip: '2.08"' },
    '18x9.5':  { weight: null, lip: '2.28"' },
    '18x10.5': { weight: null, lip: '3.07"' },
    '19x9.5':  { weight: null, lip: '2.28"' },
    '19x11':   { weight: null, lip: '3.27"' }
  },
  ds07: {
    '18x8.5':  { weight: null, lip: '2.08"' },
    '18x9.5':  { weight: null, lip: '2.44"' },
    '18x10.5': { weight: null, lip: '3.34"' },
    '19x8.5':  { weight: null, lip: '2.08"' },
    '19x9.5':  { weight: null, lip: '2.56"' },
    '19x11':   { weight: null, lip: '3.46"' }
  },
  ds08: {
    '18x8.5':  { weight: 21.3, lip: '2.16"' },
    '18x9.5':  { weight: 22.6, lip: '2.56"' },
    '18x10.5': { weight: 22.7, lip: '3.07"' },
    '19x8.5':  { weight: 22.4, lip: '2.16"' },
    '19x9.5':  { weight: 24.1, lip: '2.5"' },
    '19x11':   { weight: 24.6, lip: '3.32"' }
  },
  ds09: {
    '18x8.5':  { weight: 21.3, lip: '2.16"' },
    '18x9.5':  { weight: 22, lip: '2.56"' },
    '18x10.5': { weight: 23.1, lip: '3.07"' },
    '19x8.5':  { weight: 23.1, lip: '2.16"' },
    '19x9.5':  { weight: 24.9, lip: '2.5"' },
    '19x11':   { weight: 25.7, lip: '3.32"' }
  },
  dsx: {
    '18x8.5':  { weight: 20.9, lip: '2.16"' },
    '18x9.5':  { weight: 22.5, lip: '2.56"' },
    '18x10.5': { weight: 23.1, lip: '3.07"' },
    '19x8.5':  { weight: 23.9, lip: '2.16"' },
    '19x9.5':  { weight: 25, lip: '2.5"' },
    '19x11':   { weight: 25.4, lip: '3.32"' }
  },
  aff1: {
    '20x9':    { weight: 26.2, lip: '1.8"' },
    '20x10.5': { weight: 26.4, lip: '2.7"' }
  },
  aff2: {
    '19x8.5':  { weight: null, lip: null },
    '19x9.5':  { weight: null, lip: null },
    '20x9':    { weight: 25.2, lip: '1.97"' },
    '20x10.5': { weight: 25.7, lip: '2.8"' }
  },
  aff3: {
    '20x9':    { weight: 25.9, lip: '1.18"' },
    '20x10.5': { weight: 25.1, lip: '2.63"' }
  },
  aff7: {
    '18x8.5':  { weight: 19.6, lip: '1.68"' },
    '18x9.5':  { weight: 19.7, lip: '2.4"' },
    '19x8.5':  { weight: 20.6, lip: '1.79"' },
    '19x9.5':  { weight: 20.7, lip: '2.48"' },
    '20x9':    { weight: 23.8, lip: '2.26"' },
    '20x10.5': { weight: 23.9, lip: '2.8"' }
  },
  aff9: {
    '20x9':    { weight: 24.5, lip: '2.4"' },
    '20x10.5': { weight: 25.6, lip: '2.95"' }
  },
  // MFlow Racing
  mfr1: {
    '18x8.5': { weight: 21.2, lip: null },
    '18x9.5': { weight: 21.8, lip: null },
    '19x8.5': { weight: 23.4, lip: null },
    '19x9.5': { weight: 23.8, lip: null },
    '20x8.5': { weight: 24.9, lip: null },
    '20x9.5': { weight: 26.5, lip: null }
  },
  mfr2: {
    '18x8.5': { weight: 20.1, lip: null },
    '19x8.5': { weight: 22.7, lip: null },
    '19x9.5': { weight: 22.7, lip: null },
    '20x8.5': { weight: 24.5, lip: null },
    '20x9.5': { weight: 25.1, lip: null }
  },
  mfr3: {
    '18x8.5': { weight: 20.7, lip: null },
    '18x9.5': { weight: 21.2, lip: null },
    '19x8.5': { weight: 22, lip: null },
    '19x9.5': { weight: 22.9, lip: null }
  },
  mfr4: {
    '18x8.5': { weight: 20, lip: null },
    '19x8.5': { weight: 20, lip: null },
    '19x9.5': { weight: 20, lip: null }
  },
  mf01: {
    '17x9': { weight: 21.8, lip: null }
  },
  mf02: {
    '17x9': { weight: 20.5, lip: null }
  },
  mf03: {
    '17x9': { weight: 20.7, lip: null }
  },
  mf04: {
    '17x9': { weight: 19.5, lip: null }
  },
  mf05: {
    '17x8.5': { weight: 19.5, lip: null },
    '17x9': { weight: 20.3, lip: null }
  },
  mf06: {
    '17x8.5': { weight: 19.5, lip: null },
    '17x9': { weight: 19.5, lip: null }
  },
  // Vors
  'vors-tr4': {
    '17x8':    { weight: 21.5, lip: '2.3"' },
    '17x9':    { weight: 22.7, lip: '3.2"' },
    '18x8.5':  { weight: 21.7, lip: '2.5"' },
    '18x9.5':  { weight: 24.3, lip: '2.96"' },
    '18x10.5': { weight: 26.4, lip: '3.9"' },
    '19x8.5':  { weight: 23.8, lip: '2.4"' },
    '19x9.5':  { weight: 25.5, lip: '3.03"' },
    '19x10.5': { weight: 27.4, lip: '3.9"' },
    '20x8.5':  { weight: 28, lip: '2.48"' },
    '20x9.5':  { weight: 30, lip: '2.84"' }
  },
  'vors-tr37': {
    '17x8':   { weight: 19, lip: '1.33"' },
    '17x9':   { weight: 20.2, lip: '1.34"' },
    '18x8.5': { weight: 20.2, lip: '1.8"' },
    '18x9.5': { weight: 22, lip: '1.91"' },
    '19x8.5': { weight: 25.8, lip: '1.8"' },
    '19x9.5': { weight: 26.4, lip: '1.91"' }
  },
  'vors-vr8': {
    '17x8':   { weight: 19.6, lip: '1.77"' },
    '18x8':   { weight: 22.5, lip: '1.64"' },
    '18x9':   { weight: 22.5, lip: '2.59"' },
    '19x8.5': { weight: 24.5, lip: '1.83"' },
    '19x9.5': { weight: 25, lip: '2.79"' },
    '20x8.5': { weight: 27.2, lip: '1.83"' },
    '20x9.5': { weight: 28.2, lip: '2.4"' }
  },
  'vors-sp1': {
    '15x7':   { weight: 12.8, lip: '1.43"' },
    '15x8':   { weight: 12.5, lip: '2.53"' },
    '16x7':   { weight: 14.5, lip: '1.43"' },
    '16x8':   { weight: 17, lip: '2.68"' },
    '17x8':   { weight: 20.6, lip: '1.97"' },
    '17x9':   { weight: 20.8, lip: '2.68"' },
    '18x8':   { weight: 21.2, lip: '2"' },
    '18x9':   { weight: 21.4, lip: '2.94"' },
    '19x8.5': { weight: 23.6, lip: '2.26"' },
    '19x9.5': { weight: 24.4, lip: '2.76"' }
  }
};

// ===== EXACT PRICING (from manufacturer inventory spreadsheets) =====
// Base price per size. If all colors cost the same, just the size→price map.
const wheelPrices = {
  // Aodhan AH Series
  ah01: { '15x8': 162, '16x8': 175, '17x9': 212, '18x9.5': 237 },
  ah02: { '17x8': 237, '18x8.5': 262, '18x9.5': 262, '19x8.5': 300, '19x9.5': 300, '19x11': 300 },
  ah03: { '15x8': 162, '16x8': 175, '17x9': 212, '18x9.5': 237, '18x10.5': 237, '19x9.5': 275, '19x11': 275 },
  ah04: { '15x8': 162, '16x8': 175, '17x9': 212, '18x9.5': 237 },
  ah05: { '15x8': 162, '16x8': 175, '17x9': 212, '18x8.5': 237, '18x9.5': 237 },
  ah06: { '17x9': 225, '18x9': 250, '18x10': 255 },
  ah07: { '18x8.5': 250, '18x9.5': 250 },
  ah08: { '18x8.5': 250, '18x9.5': 250 },
  ah09: { '18x8.5': 250, '18x9.5': 250 },
  ahx:  { '18x8.5': 250, '18x9.5': 250, '19x8.5': 300, '19x9.5': 300 },
  ah11: { '18x8.5': 250, '18x9.5': 250, '19x8.5': 300, '19x9.5': 300 },
  // Aodhan DS Series
  ds01: { '18x8.5': 250, '18x9.5': 250, '18x10.5': 250, '19x9.5': 287, '19x10.5': 287 },
  ds02: { '18x8.5': 250, '18x9.5': 250, '18x10.5': 250, '19x8.5': 287, '19x9.5': 287, '19x11': 287 },
  ds03: { '18x9.5': 250 },
  ds05: { '18x8.5': 250, '18x9.5': 250, '18x10.5': 250, '19x9.5': 287, '19x11': 287 },
  ds06: { '18x8.5': 250, '18x9.5': 250, '18x10.5': 250, '19x9.5': 287, '19x11': 287 },
  ds07: { '18x8.5': 250, '18x9.5': 250, '18x10.5': 250, '19x8.5': 287, '19x9.5': 287, '19x11': 287 },
  ds08: { '18x8.5': 275, '18x9.5': 275, '18x10.5': 275, '19x8.5': 300, '19x9.5': 300, '19x11': 300 },
  ds09: { '18x8.5': 275, '18x9.5': 275, '18x10.5': 275, '19x8.5': 300, '19x9.5': 300, '19x11': 300 },
  dsx:  { '18x8.5': 275, '18x9.5': 275, '18x10.5': 275, '19x8.5': 300, '19x9.5': 300, '19x11': 300 },
  // Aodhan AFF Series
  aff1: { '20x9': 362, '20x10.5': 362 },
  aff2: { '19x8.5': 300, '19x9.5': 300, '20x9': 362, '20x10.5': 362 },
  aff3: { '20x9': 362, '20x10.5': 362 },
  aff7: { '18x8.5': 275, '18x9.5': 275, '19x8.5': 300, '19x9.5': 300, '20x9': 362, '20x10.5': 362 },
  aff9: { '20x9': 362, '20x10.5': 362 },
  // MFlow Racing (from inventory spreadsheet MAP prices — per-size pricing)
  mfr1: { '18x8.5': 212, '18x9.5': 212, '19x8.5': 237, '19x9.5': 237, '20x8.5': 274, '20x9.5': 274 },
  mfr2: { '18x8.5': 212, '19x8.5': 237, '19x9.5': 237, '20x8.5': 274, '20x9.5': 274 },
  mfr3: { '18x8.5': 212, '18x9.5': 212, '19x8.5': 237, '19x9.5': 237 },
  mfr4: { '18x8.5': 212, '19x8.5': 237, '19x9.5': 237, '20x8.5': 274, '20x9.5': 274 },
  mfl1: { '18x8.5': 212, '18x9.5': 212, '19x8.5': 237, '19x9.5': 237, '20x8.5': 274, '20x9.5': 274 },
  mfl2: { '18x8.5': 212, '18x9.5': 212, '19x8.5': 237, '19x9.5': 237, '20x8.5': 274, '20x9.5': 274 },
  mf01: { '17x9': 199 },
  mf02: { '17x9': 199 },
  mf03: { '17x9': 199 },
  mf04: { '17x9': 199 },
  mf05: { '17x8.5': 199, '17x9': 199 },
  mf06: { '17x8.5': 199, '17x9': 199 },
  // Vors (from inventory spreadsheet MAP prices)
  'vors-tr4':  { '17x8': 210, '17x9': 210, '18x8.5': 235, '18x9.5': 235, '18x10.5': 255, '19x8.5': 260, '19x9.5': 260, '19x10.5': 280, '20x8.5': 310, '20x9.5': 310 },
  'vors-tr10': { '17x8': 210, '17x9': 210, '18x8.5': 235, '18x9.5': 235, '19x8.5': 260, '19x9.5': 260 },
  'vors-tr14': { '18x8': 235, '18x9': 235, '19x8.5': 260 },
  'vors-tr37': { '17x8': 210, '17x9': 210, '18x8.5': 235, '18x9.5': 235, '19x8.5': 260, '19x9.5': 260 },
  'vors-tr88': { '18x8.5': 235, '18x9.5': 235, '19x8.5': 260, '19x9.5': 260, '20x9': 310, '20x10.5': 310 },
  'vors-vr8':  { '17x8': 210, '18x8': 265, '18x9': 235, '19x8.5': 260, '19x9.5': 260, '20x8.5': 335, '20x9.5': 335 },
  'vors-ar1':  { '17x8.5': 210, '18x8.5': 235, '18x9.5': 235 },
  'vors-ar5':  { '17x8': 210, '17x9': 210, '18x8.5': 235, '18x9.5': 235, '19x8.5': 260, '19x9.5': 260 },
  'vors-sp1':  { '15x7': 165, '15x8': 165, '16x7': 195, '16x8': 195, '17x8': 210, '17x9': 210, '18x8': 235, '18x9': 235, '19x8.5': 260, '19x9.5': 260 },
  'vors-lt53': { '18x8': 215, '18x9': 215 },
  'vors-uo2':  { '19x8.5': 260, '19x9.5': 260 }
};

// Color-specific price overrides (PVD/Chrome finishes cost more)
const colorPriceOverrides = {
  ds01: {
    'Black Vacuum (PVD)':    { '18x8.5': 300, '18x9.5': 300, '19x9.5': 337, '19x10.5': 337 },
    'Vacuum Chrome (PVD)':   { '18x8.5': 300, '18x9.5': 300, '19x9.5': 337, '19x10.5': 337 },
    'Gold Vacuum (PVD)':     { '18x8.5': 300, '18x9.5': 300, '19x9.5': 337, '19x10.5': 337 }
  },
  ds02: {
    'Black Vacuum (PVD)':    { '18x9.5': 300, '18x10.5': 300, '19x9.5': 337, '19x11': 337 },
    'Vacuum Chrome (PVD)':   { '18x8.5': 300, '18x9.5': 300, '18x10.5': 300, '19x8.5': 337, '19x9.5': 337, '19x11': 337 },
    'Gold Vacuum (PVD)':     { '18x9.5': 300, '18x10.5': 300, '19x9.5': 337, '19x11': 337 }
  },
  ds03: {
    'Black Vacuum':          { '18x9.5': 300 },
    'Vacuum Chrome':         { '18x9.5': 300 },
    'Gold Vacuum':           { '18x9.5': 300 }
  }
};

// ===== BOLT CONFIGS (from Enay's inventory — source of truth for bolt+offset+center bore) =====
// Each config: { bolt, offset, cb } — replaces separate boltPatterns/offsets/boltOffsets
const wheelBoltConfigs = {
  ah01: {
    '15x8': [{bolt:'4x100/114.3',offset:'+20',cb:'73.1'}],
    '16x8': [{bolt:'4x100/114.3',offset:'+15',cb:'73.1'}],
    '17x9': [{bolt:'5x100/114.3',offset:'+25',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}]
  },
  ah02: {
    '17x8': [{bolt:'4x100/114.3',offset:'+35',cb:'73.1'},{bolt:'5x100/114.3',offset:'+35',cb:'73.1'}],
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+32',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+12',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x11': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}]
  },
  ah03: {
    '15x8': [{bolt:'4x100/114.3',offset:'+20',cb:'73.1'}],
    '16x8': [{bolt:'4x100/114.3',offset:'+15',cb:'73.1'}],
    '17x9': [{bolt:'5x100/114.3',offset:'+25',cb:'73.1'}],
    '18x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+12',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}]
  },
  ah04: {
    '15x8': [{bolt:'4x100/114.3',offset:'+20',cb:'73.1'}],
    '16x8': [{bolt:'4x100/114.3',offset:'+15',cb:'73.1'}],
    '17x9': [{bolt:'5x100/114.3',offset:'+25',cb:'73.1'}],
    '18x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'}]
  },
  ah05: {
    '15x8': [{bolt:'4x100/114.3',offset:'+20',cb:'73.1'}],
    '16x8': [{bolt:'4x100/114.3',offset:'+15',cb:'73.1'}],
    '17x9': [{bolt:'5x100/114.3',offset:'+25',cb:'73.1'}],
    '18x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}]
  },
  ah06: {
    '17x9': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9': [{bolt:'5x100',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}],
    '18x10': [{bolt:'5x114.3',offset:'+25',cb:'73.1'}]
  },
  ah07: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}]
  },
  ah08: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}]
  },
  ah09: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}]
  },
  ahx: {
    '18x8.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  ah11: {
    '18x8.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  ds01: {
    '18x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+25',cb:'72.6'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+25',cb:'72.6'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  ds02: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}]
  },
  ds03: { '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}] },
  ds05: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  ds06: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  ds07: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  ds08: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x11': [{bolt:'5x114.3',offset:'+15',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'}]
  },
  ds09: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  dsx: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '18x10.5': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}],
    '19x11': [{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+15',cb:'73.1'}]
  },
  aff1: {
    '20x9': [{bolt:'5x114.3',offset:'+32',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'72.6'}],
    '20x10.5': [{bolt:'5x114.3',offset:'+45',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  aff2: {
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9': [{bolt:'5x112',offset:'+30',cb:'66.6'},{bolt:'5x114.3',offset:'+32',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'72.6'}],
    '20x10.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+45',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  aff3: {
    '20x9': [{bolt:'5x114.3',offset:'+32',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'72.6'}],
    '20x10.5': [{bolt:'5x114.3',offset:'+45',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  aff7: {
    '18x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9': [{bolt:'5x112',offset:'+30',cb:'66.6'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'72.6'}],
    '20x10.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  aff9: {
    '20x9': [{bolt:'5x112',offset:'+30',cb:'66.6'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'72.6'}],
    '20x10.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  // ===== VORS (from inventory spreadsheet) =====
  'vors-tr4': {
    '17x8': [{bolt:'4x100/4x114.3',offset:'+35',cb:'73.1'},{bolt:'4x98',offset:'+35',cb:'73.1'},{bolt:'4x108',offset:'+35',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '17x9': [{bolt:'5x100',offset:'+30',cb:'73.1'},{bolt:'5x105',offset:'+30',cb:'73.1'},{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x10.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x10.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'}],
    '20x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '20x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-tr10': {
    '17x8': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '17x9': [{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '18x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-tr14': {
    '18x8': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-tr37': {
    '17x8': [{bolt:'4x100',offset:'+35',cb:'73.1'},{bolt:'4x108',offset:'+35',cb:'73.1'},{bolt:'4x114.3',offset:'+35',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '17x9': [{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '18x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-tr88': {
    '18x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '20x9': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '20x10.5': [{bolt:'5x108',offset:'+38',cb:'73.1'},{bolt:'5x110',offset:'+38',cb:'73.1'},{bolt:'5x112',offset:'+38',cb:'73.1'},{bolt:'5x114.3',offset:'+38',cb:'73.1'},{bolt:'5x115',offset:'+38',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'73.1'}]
  },
  'vors-vr8': {
    '17x8': [{bolt:'4x100',offset:'+35',cb:'73.1'},{bolt:'4x108',offset:'+35',cb:'73.1'},{bolt:'4x114.3',offset:'+35',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x8': [{bolt:'4x100',offset:'+35',cb:'73.1'},{bolt:'4x108',offset:'+35',cb:'73.1'},{bolt:'4x114.3',offset:'+35',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9': [{bolt:'5x100',offset:'+20',cb:'73.1'},{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+20',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+20',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+20',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+20',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+22',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+22',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+22',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+22',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+22',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+22',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '20x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '20x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-ar1': {
    '17x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-ar5': {
    '17x8': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '17x9': [{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '18x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '19x8.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-sp1': {
    '15x7': [{bolt:'4x98',offset:'+35',cb:'73.1'},{bolt:'4x100',offset:'+35',cb:'73.1'},{bolt:'4x108',offset:'+35',cb:'73.1'}],
    '15x8': [{bolt:'4x98',offset:'+20',cb:'73.1'},{bolt:'4x100/4x114.3',offset:'+20',cb:'73.1'},{bolt:'4x108',offset:'+20',cb:'73.1'}],
    '16x7': [{bolt:'4x98',offset:'+38',cb:'73.1'},{bolt:'4x100/4x114.3',offset:'+38',cb:'73.1'},{bolt:'4x108',offset:'+38',cb:'73.1'}],
    '16x8': [{bolt:'4x98',offset:'+20',cb:'73.1'},{bolt:'4x100/4x114.3',offset:'+20',cb:'73.1'},{bolt:'4x108',offset:'+20',cb:'73.1'}],
    '17x8': [{bolt:'4x98',offset:'+30',cb:'73.1'},{bolt:'4x100/4x114.3',offset:'+30',cb:'73.1'},{bolt:'4x108',offset:'+30',cb:'73.1'},{bolt:'5x100/5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '17x9': [{bolt:'5x100/5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x105',offset:'+30',cb:'73.1'},{bolt:'5x108',offset:'+30',cb:'73.1'},{bolt:'5x110',offset:'+30',cb:'73.1'},{bolt:'5x112',offset:'+30',cb:'73.1'},{bolt:'5x115',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+30',cb:'73.1'}],
    '18x8': [{bolt:'5x100/5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9': [{bolt:'5x100/5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x100/5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x100/5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x105',offset:'+35',cb:'73.1'},{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  'vors-lt53': {
    '18x8': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}],
    '18x9': [{bolt:'5x108',offset:'+35',cb:'73.1'},{bolt:'5x110',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x115',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'73.1'}]
  },
  // ===== MFLOW (from inventory spreadsheet) =====
  mfr1: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}],
    '20x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}]
  },
  mfr2: {
    '18x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}],
    '20x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '20x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}]
  },
  mfr3: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x8.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '19x9.5': [{bolt:'5x114.3',offset:'+35',cb:'73.1'}]
  },
  mfr4: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}],
    '20x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}]
  },
  mfl1: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}],
    '20x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}]
  },
  mfl2: {
    '18x8.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+35',cb:'73.1'}],
    '18x9.5': [{bolt:'5x100',offset:'+35',cb:'73.1'},{bolt:'5x114.3',offset:'+30',cb:'73.1'}],
    '19x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '19x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+30',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}],
    '20x8.5': [{bolt:'5x112',offset:'+35',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+35',cb:'72.6'}],
    '20x9.5': [{bolt:'5x112',offset:'+38',cb:'66.6'},{bolt:'5x114.3',offset:'+35',cb:'73.1'},{bolt:'5x120',offset:'+38',cb:'72.6'}]
  },
  mf01: { '17x9': [{bolt:'5x127',offset:'+12',cb:'71.5'}] },
  mf02: { '17x9': [{bolt:'5x127',offset:'+12',cb:'71.5'},{bolt:'6x139.7',offset:'+0',cb:'106.1'}] },
  mf03: { '17x9': [{bolt:'6x139.7',offset:'+0',cb:'106.1'}] },
  mf04: { '17x9': [{bolt:'5x127',offset:'+12',cb:'71.5'},{bolt:'6x139.7',offset:'+0',cb:'106.1'}] },
  mf05: {
    '17x8.5': [{bolt:'6x139.7',offset:'+0',cb:'93.1'},{bolt:'6x139.7',offset:'+5',cb:'106.1'},{bolt:'6x139.7',offset:'+25',cb:'95.1'}],
    '17x9': [{bolt:'5x127',offset:'+12',cb:'71.5'},{bolt:'6x139.7',offset:'+0',cb:'106.1'}]
  },
  mf06: {
    '17x8.5': [{bolt:'6x139.7',offset:'+0',cb:'93.1'},{bolt:'6x139.7',offset:'+5',cb:'106.1'},{bolt:'6x139.7',offset:'+25',cb:'95.1'}],
    '17x9': [{bolt:'6x139.7',offset:'+0',cb:'106.1'}]
  }
};

// Build spec chart HTML from wheel variants + wheelSpecs data
function buildSpecChart(wheelId, wheel) {
  if (!wheel.variants) return '';
  const specs = wheelSpecs[wheelId] || {};
  const sizes = Object.keys(wheel.variants);
  const hasWeight = sizes.some(s => specs[s]?.weight);
  const hasLip = sizes.some(s => specs[s]?.lip);

  let rows = sizes.map(size => {
    const v = wheel.variants[size];
    const s = specs[size] || {};
    return `<tr>
      <td>${size}</td>
      <td>${v.boltPatterns.join(', ')}</td>
      <td>${v.offsets.join(', ')}</td>
      ${hasWeight ? `<td>${s.weight ? s.weight + ' lbs' : '—'}</td>` : ''}
      ${hasLip ? `<td>${s.lip || '—'}</td>` : ''}
    </tr>`;
  }).join('');

  return `
    <div class="spec-group spec-chart-wrap">
      <div class="spec-label spec-chart-toggle" id="specChartToggle">
        Sizing Chart <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="spec-chart" id="specChart">
        <table>
          <thead><tr>
            <th>Size</th><th>Bolt Pattern</th><th>Offset</th>
            ${hasWeight ? '<th>Weight</th>' : ''}
            ${hasLip ? '<th>Lip</th>' : ''}
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== WHEEL HELPERS =====
function getWheelSizes(wheel) {
  if (wheel.variants) return Object.keys(wheel.variants);
  return wheel.sizes || [];
}

function getVariantData(wheel, size) {
  if (wheel.variants && wheel.variants[size]) return wheel.variants[size];
  return {
    finishes: wheel.finishes || [],
    boltPatterns: wheel.boltPatterns || [],
    offsets: wheel.offsets || [],
    image: null
  };
}

// Get exact per-wheel price for a given size and optional color
function getWheelPrice(wheelId, size, color) {
  const priceMap = wheelPrices[wheelId];
  if (!priceMap) return null;

  // Check color-specific override first
  if (color && colorPriceOverrides[wheelId] && colorPriceOverrides[wheelId][color]) {
    const colorPrice = colorPriceOverrides[wheelId][color][size];
    if (colorPrice) return colorPrice;
  }

  return priceMap[size] || null;
}

// ===== ACCESSORY DATA =====
const accessoryProducts = {
  spl35: {
    id: 'spl35',
    category: 'lug-nuts',
    name: 'Spline Lug Nuts (SPL35)',
    pack: 'Set of 20',
    price: 39.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/SPL35_1215_BLACK_01.jpg?v=1749494642',
    description: 'Conical seat, 35mm overall size. 6-spline for 12x1.25, 12x1.5, and 1/2; 7-spline for 14x1.5.',
    options: [
      { id: 'threadPitch', label: 'Thread Pitch', required: true, values: ['12x1.5', '12x1.25', '1/2', '14x1.5'] },
      { id: 'color', label: 'Color', required: true, values: ['Black', 'Blue', 'Chrome', 'Gold', 'Neo Chrome', 'Red'] }
    ],
    fitmentKind: 'lug-nut'
  },
  xt51: {
    id: 'xt51',
    category: 'lug-nuts',
    name: 'Extended Lug Nuts (XT51)',
    pack: 'Set of 20',
    price: 34.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/XT51_Grey_01.jpg?v=1773946635',
    description: 'Open end, conical seat, 51mm overall length.',
    options: [
      { id: 'threadPitch', label: 'Thread Pitch', required: true, values: ['12x1.25', '12x1.5', '14x1.5'] },
      { id: 'color', label: 'Color', required: true, values: ['Neo Chrome', 'Gold', 'Red', 'Chrome', 'Blue', 'Black', 'Purple'] }
    ],
    fitmentKind: 'lug-nut'
  },
  xt92: {
    id: 'xt92',
    category: 'lug-nuts',
    name: 'Spiked Extended Lug Nuts (XT92)',
    pack: 'Set of 20',
    price: 55.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/XT92_Black_01.jpg?v=1773952481',
    description: 'Conical seat, 92mm overall length.',
    options: [
      { id: 'threadPitch', label: 'Thread Pitch', required: true, values: ['12x1.5', '12x1.25', '14x1.5'] },
      { id: 'color', label: 'Color', required: true, values: ['Black', 'Blue', 'Chrome', 'Gold', 'Neo Chrome', 'Purple', 'Red'] }
    ],
    fitmentKind: 'lug-nut'
  },
  polyHubRings: {
    id: 'polyHubRings',
    category: 'hub-rings',
    name: 'Polycarbonate Hub Ring Set',
    pack: 'Set of 4',
    price: 14.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/All.jpg?v=1749494624',
    description: 'Polycarbonate rings to reduce vibration and center the wheel on the vehicle hub.',
    options: [
      {
        id: 'ringSize',
        label: 'Ring Size',
        required: true,
        values: [
          'Wheel: 74.10mm | Hub: 72.60mm',
          'Wheel: 72.62mm | Hub: 66.56mm',
          'Wheel: 72.62mm | Hub: 57.10mm',
          'Wheel: 72.62mm | Hub: 59.61mm',
          'Wheel: 72.62mm | Hub: 60.06mm',
          'Wheel: 72.62mm | Hub: 64.15mm',
          'Wheel: 72.62mm | Hub: 66.06mm',
          'Wheel: 72.62mm | Hub: 56.15mm',
          'Wheel: 72.62mm | Hub: 67.06mm',
          'Wheel: 72.62mm | Hub: 54.06mm',
          'Wheel: 72.62mm | Hub: 70.10mm',
          'Wheel: 73.00mm | Hub: 66.56mm',
          'Wheel: 73.00mm | Hub: 57.10mm',
          'Wheel: 73.00mm | Hub: 60.06mm',
          'Wheel: 73.00mm | Hub: 64.15mm',
          'Wheel: 73.00mm | Hub: 66.06mm',
          'Wheel: 73.00mm | Hub: 56.15mm',
          'Wheel: 73.00mm | Hub: 67.06mm',
          'Wheel: 73.00mm | Hub: 54.06mm',
          'Wheel: 73.00mm | Hub: 70.10mm',
          'Wheel: 66.60mm | Hub: 57.10mm',
          'Wheel: 67.10mm | Hub: 56.10mm',
          'Wheel: 67.10mm | Hub: 54.10mm'
        ]
      }
    ],
    fitmentKind: 'hub-ring'
  },
  aluminumHubRings: {
    id: 'aluminumHubRings',
    category: 'hub-rings',
    name: 'Aluminum Hub Ring Set',
    pack: 'Set of 4',
    price: 24.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/All_Aluminum.jpg?v=1749494622',
    description: 'Aluminum rings for a durable hub-centric fit between the wheel center bore and vehicle hub.',
    options: [
      {
        id: 'ringSize',
        label: 'Ring Size',
        required: true,
        values: [
          'Wheel: 74.10mm | Hub: 72.60mm',
          'Wheel: 73.10mm | Hub: 54.06mm',
          'Wheel: 73.10mm | Hub: 56.15mm',
          'Wheel: 73.10mm | Hub: 57.10mm',
          'Wheel: 73.10mm | Hub: 60.06mm',
          'Wheel: 73.10mm | Hub: 66.06mm',
          'Wheel: 73.10mm | Hub: 66.56mm',
          'Wheel: 73.10mm | Hub: 67.06mm',
          'Wheel: 73.10mm | Hub: 70.10mm'
        ]
      }
    ],
    fitmentKind: 'hub-ring'
  },
  v1ValveStems: {
    id: 'v1ValveStems',
    category: 'valve-stems',
    name: 'Aluminum Valve Stems (V1)',
    pack: 'Set of 4',
    price: 13.99,
    image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V1_Silver_02_c78b0cb9-1e19-461f-83c0-322f6d1b855c.jpg?v=1776204641&width=400',
    description: 'Universal fitment for standard 0.453 inch stem holes, 1.89 inch long.',
    options: [
      { id: 'color', label: 'Color', required: true, values: ['Silver', 'Red', 'Blue', 'Black'] }
    ],
    fitmentKind: 'valve-stem'
  },
  v2ValveStems: {
    id: 'v2ValveStems',
    category: 'valve-stems',
    name: 'Aluminum Valve Stems (V2)',
    pack: 'Set of 4',
    price: 19.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/V2_Red_02_1eacf0c5-68d8-42c8-85c3-75b6ef533fe0.jpg?v=1749494604',
    description: 'Universal fitment for standard 0.453 inch stem holes, 1.8 inch long.',
    options: [
      { id: 'color', label: 'Color', required: true, values: ['Red', 'Blue'] }
    ],
    fitmentKind: 'valve-stem'
  },
  v3ValveStems: {
    id: 'v3ValveStems',
    category: 'valve-stems',
    name: 'Aluminum Valve Stems (V3)',
    pack: 'Set of 4',
    price: 19.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/products/Aodhan_V3_Valve_Silver_1_a3fa2cf6-130a-4872-8c1a-af4f234f876a.jpg?v=1749494604',
    description: 'Universal fitment for standard 0.453 inch stem holes, 1.45 inch long.',
    options: [
      { id: 'color', label: 'Color', required: true, values: ['Silver', 'Red', 'Blue', 'Black', 'Gold', 'Gray'] }
    ],
    fitmentKind: 'valve-stem'
  },
  lb55: {
    id: 'lb55',
    category: 'lug-bolts',
    name: 'Lug Bolts (LB55)',
    pack: 'Set of 20',
    price: 59.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/files/LB55_Black_1.jpg?v=1749494604',
    description: 'Conical seat lug bolts, 28mm shank and 55mm overall length.',
    options: [
      { id: 'threadPitch', label: 'Thread Pitch', required: true, values: ['12x1.25', '12x1.5', '14x1.25', '14x1.5'] },
      { id: 'color', label: 'Color', required: true, values: ['Black', 'Gold', 'Neo Chrome'] }
    ],
    fitmentKind: 'lug-bolt'
  },
  lkb51: {
    id: 'lkb51',
    category: 'lug-bolts',
    name: 'Locking Lug Bolts (LKB51)',
    pack: 'Set',
    price: 29.99,
    image: 'https://www.aodhanwheels.com/cdn/shop/products/BLK-OG.jpg?v=1749494604',
    description: 'Security locking lug bolts, conical seat, 51mm overall length.',
    options: [
      { id: 'threadPitch', label: 'Thread Pitch', required: true, values: ['12x1.25', '12x1.5', '14x1.25'] },
      { id: 'color', label: 'Color', required: true, values: ['Black'] }
    ],
    fitmentKind: 'lug-bolt'
  }
};

const accessoryVariantImages = {
  spl35: {
    '12x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_BLACK_01.jpg?v=1749494642',
    '12x1.5 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_BLUE_01.jpg?v=1749494643',
    '12x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_CHROME_01.jpg?v=1749494643',
    '12x1.5 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_GOLD_01.jpg?v=1749494643',
    '12x1.5 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_NEO_CHROME_01.jpg?v=1749494643',
    '12x1.5 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_RED_01.jpg?v=1749494643',
    '12x1.25 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_BLACK_01.jpg?v=1749494642',
    '12x1.25 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_12125_BLUE_01.jpg?v=1749494643',
    '12x1.25 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_12125_CHROME_01.jpg?v=1749494643',
    '12x1.25 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_12125_GOLD_01.jpg?v=1749494643',
    '12x1.25 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_12125_NEO_CHROME_01.jpg?v=1749494644',
    '12x1.25 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_12125_RED_01.jpg?v=1749494644',
    '1/2 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_BLACK_01.jpg?v=1749494642',
    '1/2 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_CHROME_01.jpg?v=1749494643',
    '1/2 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1215_RED_01.jpg?v=1749494643',
    '14x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1415_BLACK_01.jpg?v=1749494644',
    '14x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1415_CHROME_01.jpg?v=1749494644',
    '14x1.5 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/SPL35_1415_RED_01.jpg?v=1749494644'
  },
  xt51: {
    '12x1.25 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_NeoChrome_01.jpg?v=1773946529',
    '12x1.25 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Gold_01.jpg?v=1773946529',
    '12x1.25 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Red_01.jpg?v=1773946529',
    '12x1.25 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Chrome_01.jpg?v=1773946529',
    '12x1.25 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Blue_01.jpg?v=1773946529',
    '12x1.25 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Black_01.jpg?v=1773946529',
    '12x1.25 / Purple': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Purple_01.jpg?v=1773946529',
    '12x1.5 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_NeoChrome_01.jpg?v=1773946529',
    '12x1.5 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Gold_01.jpg?v=1773946529',
    '12x1.5 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Red_01.jpg?v=1773946529',
    '12x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Chrome_01.jpg?v=1773946529',
    '12x1.5 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Blue_01.jpg?v=1773946529',
    '12x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Black_01.jpg?v=1773946529',
    '12x1.5 / Purple': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Purple_01.jpg?v=1773946529',
    '14x1.5 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Red_01.jpg?v=1773946529',
    '14x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT51_Black_01.jpg?v=1773946529'
  },
  xt92: {
    '12x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Black_01.jpg?v=1773952481',
    '12x1.5 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Blue_01.jpg?v=1773952482',
    '12x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Chrome_01.jpg?v=1773952481',
    '12x1.5 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Gold_01.jpg?v=1773952481',
    '12x1.5 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_NeoChrome_01.jpg?v=1773952481',
    '12x1.5 / Purple': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Purple_01.jpg?v=1773952481',
    '12x1.5 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Red_01.jpg?v=1773952481',
    '12x1.25 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Black_01.jpg?v=1773952481',
    '12x1.25 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Blue_01.jpg?v=1773952482',
    '12x1.25 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Gold_01.jpg?v=1773952481',
    '12x1.25 / Grey': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Grey_01.jpg?v=1773952481',
    '12x1.25 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_NeoChrome_01.jpg?v=1773952481',
    '12x1.25 / Purple': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Purple_01.jpg?v=1773952481',
    '12x1.25 / Red': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Red_01.jpg?v=1773952481',
    '14x1.5 / Blue': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Blue_01.jpg?v=1773952482',
    '14x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/XT92_Chrome_01.jpg?v=1773952481'
  },
  lb55: {
    '12x1.25 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Black_1.jpg?v=1749494631',
    '12x1.25 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Gold_1.jpg?v=1749494632',
    '12x1.25 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_NeoChrome_1.jpg?v=1749494632',
    '12x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Black_1.jpg?v=1749494631',
    '12x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Chrome_1.jpg?v=1749494632',
    '12x1.5 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Gold_1.jpg?v=1749494632',
    '14x1.25 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Black_1.jpg?v=1749494631',
    '14x1.25 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Chrome_1.jpg?v=1749494632',
    '14x1.5 / Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Black_1.jpg?v=1749494631',
    '14x1.5 / Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Chrome_1.jpg?v=1749494632',
    '14x1.5 / Gold': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_Gold_1.jpg?v=1749494632',
    '14x1.5 / Neo Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/LB55_NeoChrome_1.jpg?v=1749494632'
  },
  v1ValveStems: {
    Silver: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V1_Silver_02_c78b0cb9-1e19-461f-83c0-322f6d1b855c.jpg?v=1776204641',
    Red: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V1_Red_02_61c1f233-0261-4f0c-a505-fb5de1ec4c82.jpg?v=1776204641',
    Blue: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V1_Blue_02_521e9105-55eb-46cc-a37a-e1b8e0ae9269.jpg?v=1776204641',
    Black: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V1_Black_03_ab598615-5299-4065-aacb-75a13b9be2fa.jpg?v=1776204641'
  },
  v2ValveStems: {
    Red: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V2_Red_02_1eacf0c5-68d8-42c8-85c3-75b6ef533fe0.jpg?v=1776204643',
    Blue: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/V2_Blue_02_b69cf959-09b6-496f-a5e6-e1a066049612.jpg?v=1776204643'
  },
  v3ValveStems: {
    Silver: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Silver_1_a3fa2cf6-130a-4872-8c1a-af4f234f876a.jpg?v=1749494604',
    Red: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Red_1_f40f786d-a11f-4966-b77a-51c58080245c.jpg?v=1749494604',
    Blue: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Blue_1_ee46a185-85a0-4392-bd1d-7c9e403a801d.jpg?v=1749494604',
    Black: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Black_1_22fb3186-fa5d-4e1a-ba6a-64b162495e61.jpg?v=1749494604',
    Gold: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Gold_1_2a2a2d64-313b-4db9-a12e-ea09827d6808.jpg?v=1749494604',
    Gray: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/Aodhan_V3_Valve_Gray_1_324b091c-62ee-4993-bccc-8bb53c761f9f.jpg?v=1749494605'
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function formatMoney(value) {
  return '$' + Number(value).toLocaleString(undefined, {
    minimumFractionDigits: Number(value) % 1 ? 2 : 0,
    maximumFractionDigits: 2
  });
}

// ===== CART STATE =====
const CART_KEY = 'fwwheels_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  // Merge identical configured line items.
  const existing = cart.findIndex(c =>
    (c.cartKey && item.cartKey && c.cartKey === item.cartKey) ||
    (
      !c.cartKey && !item.cartKey &&
      c.wheelId === item.wheelId && c.size === item.size &&
      c.finish === item.finish && c.boltConfig === item.boltConfig
    )
  );
  if (existing > -1) {
    cart[existing].qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  if (window.fwTrack) window.fwTrack('add_to_cart', {
    product_slug: item.wheelId || item.accessoryId || null,
    size: item.size || null,
    value: (Number(item.price) || 0) * (Number(item.qty) || 1),
    meta: { name: item.name, finish: item.finish || null, type: item.productType || 'wheel' }
  });
}

function removeFromCart(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}

function updateCartQty(idx, qty) {
  const cart = getCart();
  if (qty < 1) return;
  cart[idx].qty = qty;
  saveCart(cart);
  renderCart();
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = getCartCount();
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }
}

function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const emptyEl = document.getElementById('cartEmpty');

  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = '';
    emptyEl.classList.add('visible');
    checkoutBtn.disabled = true;
    subtotalEl.textContent = '$0';
    return;
  }

  emptyEl.classList.remove('visible');
  checkoutBtn.disabled = false;

  itemsEl.innerHTML = cart.map((item, idx) => {
    const metaLines = item.metaLines || [
      [item.size, item.finish].filter(Boolean).join(' · '),
      [item.boltConfig, item.cb ? item.cb + 'mm CB' : ''].filter(Boolean).join(' · ')
    ].filter(Boolean);

    return `
    <div class="cart-item" data-type="${escapeHtml(item.productType || 'wheel')}">
      <div class="cart-item-img"><img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}" loading="lazy"></div>
      <div class="cart-item-body">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        ${metaLines.map(line => `<div class="cart-item-meta">${escapeHtml(line)}</div>`).join('')}
        <div class="cart-item-row">
          <div class="cart-qty">
            <button class="cart-qty-btn" data-action="dec" data-idx="${idx}">−</button>
            <span>${item.qty}</span>
            <button class="cart-qty-btn" data-action="inc" data-idx="${idx}">+</button>
          </div>
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</div>
        </div>
        <button class="cart-remove" data-idx="${idx}">Remove</button>
      </div>
    </div>
  `;
  }).join('');

  subtotalEl.textContent = '$' + getCartTotal().toLocaleString();

  // Wire up qty + remove buttons
  itemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const item = getCart()[idx];
      const newQty = btn.dataset.action === 'inc' ? item.qty + 1 : item.qty - 1;
      updateCartQty(idx, newQty);
    });
  });
  itemsEl.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.idx)));
  });
}

async function startCheckout() {
  const btn = document.getElementById('cartCheckoutBtn');
  const cart = getCart();
  if (!cart.length) return;

  btn.disabled = true;
  btn.textContent = 'Loading...';

  if (window.fwTrack) window.fwTrack('begin_checkout', {
    value: cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
    meta: { items: cart.length }
  });

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, origin: window.location.origin })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Checkout failed');
    }
  } catch (err) {
    alert('Checkout error: ' + err.message + '\n\nIf payment isn\'t set up yet, message us on Instagram @fw.wheels or call (925) 905-6277 to place your order.');
    btn.disabled = false;
    btn.textContent = 'Checkout';
  }
}

// Detect ?checkout=success on page load
(function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') {
    localStorage.removeItem(CART_KEY);
    setTimeout(() => alert('Thanks for your order! We\'ll text you confirmation shortly.'), 200);
    history.replaceState({}, '', window.location.pathname);
  } else if (params.get('checkout') === 'canceled') {
    history.replaceState({}, '', window.location.pathname);
  }
})();

// ===== WHEEL MODAL =====
const wheelModal = document.getElementById('wheelModal');
const modalClose = document.getElementById('modalClose');
const modalImages = document.getElementById('modalImages');
const modalTitle = document.getElementById('modalTitle');
const modalSpecs = document.getElementById('modalSpecs');
const modalQuoteBtn = document.getElementById('modalQuoteBtn');

function openWheelModal(wheelId, preferred = {}) {
  const wheel = wheelData[wheelId];
  if (!wheel) return;

  if (window.fwTrack) window.fwTrack('product_view', {
    product_slug: wheelId, meta: { name: wheel.name, brand: wheel.series || null }
  });

  modalTitle.textContent = wheel.name;

  const sizes = getWheelSizes(wheel);
  const defaultSize = sizes.includes(preferred.size) ? preferred.size : sizes[0];

  const perWheelPrice = getWheelPrice(wheelId, defaultSize);

  modalSpecs.innerHTML = `
    <div class="spec-group">
      <div class="spec-label">Series</div>
      <div class="spec-value">${wheel.series}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Select Size</div>
      <select class="size-select" id="sizeSelect">
        ${sizes.map(s => `<option value="${s}" ${s === defaultSize ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="spec-group">
      <div class="spec-label">Price</div>
      <div class="spec-value" style="color: var(--gold); font-weight: 600;">
        <span id="perWheelPrice">${perWheelPrice ? '$' + perWheelPrice.toLocaleString() : wheel.priceRange}</span> /wheel <span class="free-ship-badge">Free Shipping</span>
      </div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Quantity (Wheels)</div>
      <div class="qty-row">
        <div class="qty-stepper">
          <button class="qty-btn" id="qtyMinus">−</button>
          <span class="qty-value" id="qtyValue">4</span>
          <button class="qty-btn" id="qtyPlus">+</button>
        </div>
        <div class="qty-total" id="qtyTotal">${perWheelPrice ? 'Total: <strong>$' + (perWheelPrice * 4).toLocaleString() + '</strong>' : ''}</div>
      </div>
    </div>
    <div id="dynamicSpecs"></div>
    <div class="spec-group">
      <div class="spec-label">Center Bore</div>
      <div class="spec-value" id="centerBoreDisplay">${wheel.centerBore}</div>
    </div>
    ${buildSpecChart(wheelId, wheel)}
    <div id="similarWheels"></div>
  `;

  // Price update helper — reads selected size + color (exposed globally for finish chip click)
  function updatePriceDisplay() {
    const currentSize = document.getElementById('sizeSelect').value;
    const activeFinish = document.querySelector('#finishChips .spec-chip--active');
    const color = activeFinish ? activeFinish.dataset.finish : null;
    const price = getWheelPrice(wheelId, currentSize, color);
    const qtyEl = document.getElementById('qtyValue');
    const q = parseInt(qtyEl.textContent);
    const priceEl = document.getElementById('perWheelPrice');
    const totalEl = document.getElementById('qtyTotal');
    if (price) {
      priceEl.textContent = '$' + price.toLocaleString();
      totalEl.innerHTML = 'Total: <strong>$' + (price * q).toLocaleString() + '</strong>';
    }
  }
  window._fwUpdatePrice = updatePriceDisplay;

  // Size select handler
  document.getElementById('sizeSelect').addEventListener('change', (e) => {
    updateModalVariant(wheelId, e.target.value);
    updatePriceDisplay();
  });

  // Quantity stepper — default to 4 wheels
  let qty = 4;
  document.getElementById('qtyMinus').addEventListener('click', () => {
    if (qty > 1) { qty--; document.getElementById('qtyValue').textContent = qty; updatePriceDisplay(); }
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty++;
    document.getElementById('qtyValue').textContent = qty;
    updatePriceDisplay();
  });

  updateModalVariant(wheelId, defaultSize, preferred);
  updatePriceDisplay();

  // Spec chart toggle
  const specToggle = document.getElementById('specChartToggle');
  const specChart = document.getElementById('specChart');
  if (specToggle && specChart) {
    specToggle.addEventListener('click', () => {
      specChart.classList.toggle('open');
      specToggle.classList.toggle('open');
    });
  }

  // Build similar wheels
  buildSimilarWheels(wheelId, wheel);

  // Store current wheel/qty for contact button
  modalQuoteBtn.dataset.wheel = wheelId;
  modalQuoteBtn.dataset.size = defaultSize;
  document.getElementById('sizeSelect').addEventListener('change', (e) => {
    modalQuoteBtn.dataset.size = e.target.value;
  });

  wheelModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Get filtered offsets based on selected bolt pattern (if boltOffsets map exists)
function getFilteredOffsets(variant, selectedBolt) {
  if (variant.boltOffsets && selectedBolt && variant.boltOffsets[selectedBolt]) {
    return variant.boltOffsets[selectedBolt];
  }
  return variant.offsets;
}

// Render and wire up offset chips with optional bolt-pattern filtering
function renderOffsetChips(dynamicSpecs, variant, selectedBolt) {
  const offsets = getFilteredOffsets(variant, selectedBolt);
  const container = dynamicSpecs.querySelector('#offsetChips');
  if (!container) return;
  container.innerHTML = offsets.map((o, i) =>
    `<span class="spec-chip spec-chip--selectable${i === 0 ? ' spec-chip--active' : ''}" data-offset="${o}">${o}</span>`
  ).join('');
  container.querySelectorAll('.spec-chip--selectable').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.spec-chip--selectable').forEach(c => c.classList.remove('spec-chip--active'));
      chip.classList.add('spec-chip--active');
      modalQuoteBtn.dataset.offset = chip.dataset.offset;
    });
  });
}

function updateModalVariant(wheelId, size, preferred = {}) {
  const wheel = wheelData[wheelId];
  const variant = getVariantData(wheel, size);
  const finishImgMap = buildFinishImageMap(wheel, wheelId);
  const variantFinishes = (variant.finishes || []).map(canonicalFinishName);
  const finishOptions = [
    ...new Set([
      ...variantFinishes,
      ...Object.keys(finishImgMap).map(canonicalFinishName)
    ])
  ];
  const preferredFinish = preferred.finish ? canonicalFinishName(preferred.finish) : '';
  const selectedFinish = preferredFinish && finishOptions.includes(preferredFinish)
    ? preferredFinish
    : pickCardDefaultFinish(wheelId, finishOptions, finishImgMap);

  // Get bolt configs from inventory data, fall back to variant data
  const configs = (wheelBoltConfigs[wheelId] && wheelBoltConfigs[wheelId][size]) || null;
  const hasBoltConfigs = configs && configs.length > 0;
  const configMatchesPreferred = config =>
    (!preferred.bolt || config.bolt === preferred.bolt) &&
    (!preferred.offset || config.offset === preferred.offset) &&
    (!preferred.cb || String(config.cb) === String(preferred.cb));
  const preferredConfigIndex = hasBoltConfigs ? configs.findIndex(configMatchesPreferred) : -1;
  const activeConfigIndex = preferredConfigIndex > -1 ? preferredConfigIndex : 0;

  const dynamicSpecs = document.getElementById('dynamicSpecs');

  // Build the bolt+offset section
  let boltHtml = '';
  if (hasBoltConfigs) {
    // Combined bolt+offset chips from inventory
    boltHtml = `
      <div class="spec-group">
        <div class="spec-label">Bolt Pattern / Offset</div>
        <div class="spec-chips" id="boltConfigChips">
          ${configs.map((c, i) => {
            const label = c.bolt + ' ' + c.offset;
            const dual = c.bolt.includes('/');
            return `<span class="spec-chip spec-chip--selectable${i === activeConfigIndex ? ' spec-chip--active' : ''}${dual ? ' spec-chip--dual' : ''}" data-bolt="${c.bolt}" data-offset="${c.offset}" data-cb="${c.cb}">${label}</span>`;
          }).join('')}
        </div>
      </div>`;
  } else {
    // Fallback: separate bolt + offset rows (for Vors/MFlow without inventory data)
    const defaultBolt = variant.boltPatterns[0];
    boltHtml = `
      <div class="spec-group">
        <div class="spec-label">Bolt Pattern / Offset</div>
        <div class="spec-chips" id="boltConfigChips">
          ${variant.boltPatterns.flatMap(bolt => {
            const offsets = (variant.boltOffsets && variant.boltOffsets[bolt]) || variant.offsets;
            return offsets.map(off => {
              const label = bolt + ' ' + off;
              const dual = bolt.includes('/');
              return `<span class="spec-chip spec-chip--selectable${dual ? ' spec-chip--dual' : ''}" data-bolt="${bolt}" data-offset="${off}">${label}</span>`;
            });
          }).map((html, i) => i === 0 ? html.replace('spec-chip--selectable', 'spec-chip--selectable spec-chip--active') : html).join('')}
        </div>
      </div>`;
  }

  dynamicSpecs.innerHTML = `
    <div class="spec-group">
      <div class="spec-label">Finish</div>
      <div class="spec-chips" id="finishChips">
        ${finishOptions.map(f =>
          `<span class="spec-chip spec-chip--selectable${f === selectedFinish ? ' spec-chip--active' : ''}" data-finish="${f}">${f}</span>`
        ).join('')}
      </div>
    </div>
    ${boltHtml}
  `;

  // Update center bore from first config
  const cbDisplay = document.getElementById('centerBoreDisplay');
  if (cbDisplay && hasBoltConfigs) {
    cbDisplay.textContent = configs[activeConfigIndex].cb + 'mm';
  }

  // Finish chip click → swap modal image + update price
  dynamicSpecs.querySelectorAll('#finishChips .spec-chip--selectable').forEach(chip => {
    chip.addEventListener('click', () => {
      dynamicSpecs.querySelectorAll('#finishChips .spec-chip--selectable').forEach(c => c.classList.remove('spec-chip--active'));
      chip.classList.add('spec-chip--active');
      const finish = chip.dataset.finish;
      const image = getWheelDisplayImage(wheel, wheelId, size, finish);
      if (image) modalImages.innerHTML = `<img decoding="async" src="${image}" alt="${wheel.name} - ${finish}" loading="lazy">`;
      if (window._fwUpdatePrice) window._fwUpdatePrice();
    });
  });

  // Combined bolt+offset config chip click → update center bore
  dynamicSpecs.querySelectorAll('#boltConfigChips .spec-chip--selectable').forEach(chip => {
    chip.addEventListener('click', () => {
      dynamicSpecs.querySelectorAll('#boltConfigChips .spec-chip--selectable').forEach(c => c.classList.remove('spec-chip--active'));
      chip.classList.add('spec-chip--active');
      modalQuoteBtn.dataset.bolt = chip.dataset.bolt;
      modalQuoteBtn.dataset.offset = chip.dataset.offset;
      // Update center bore display
      if (chip.dataset.cb && cbDisplay) {
        cbDisplay.textContent = chip.dataset.cb + 'mm';
      }
    });
  });

  // Update image for the active finish, not just the selected size.
  const selectedImage = getWheelDisplayImage(wheel, wheelId, size, selectedFinish);
  if (selectedImage) {
    modalImages.innerHTML = `<img decoding="async" src="${selectedImage}" alt="${wheel.name} - ${selectedFinish}" loading="lazy">`;
  } else if (wheel.images) {
    modalImages.innerHTML = wheel.images.map(src =>
      `<img decoding="async" src="${src}" alt="${wheel.name}" loading="lazy">`
    ).join('');
  }
}

// Build "Similar Options" section in modal
function buildSimilarWheels(currentId, currentWheel) {
  const container = document.getElementById('similarWheels');
  if (!container) return;

  // Find wheels in the same series
  const similar = Object.entries(wheelData).filter(([id, w]) =>
    id !== currentId && w.series === currentWheel.series
  );

  // If not enough in same series, add same brand
  if (similar.length < 3) {
    const prefix = currentId.replace(/\d+$/, '');
    Object.entries(wheelData).forEach(([id, w]) => {
      if (id !== currentId && !similar.find(s => s[0] === id) && id.startsWith(prefix)) {
        similar.push([id, w]);
      }
    });
  }

  if (!similar.length) { container.innerHTML = ''; return; }

  const show = similar.slice(0, 4);
  container.innerHTML = `
    <div class="spec-group similar-section">
      <div class="spec-label">Similar Options</div>
      <div class="similar-grid">
        ${show.map(([id, w]) => {
          const firstSize = getWheelSizes(w)[0];
          const firstFinish = getVariantData(w, firstSize).finishes?.[0] || '';
          const img = getWheelDisplayImage(w, id, firstSize, firstFinish);
          const m = w.priceRange?.match(/\$[\d,]+/);
          const price = m ? 'From ' + m[0] : '';
          return `<div class="similar-card" data-wheel="${id}">
            <div class="similar-img"><img src="${img.replace('width=800', 'width=200')}" alt="${w.name}" loading="lazy"></div>
            <div class="similar-name">${w.name}</div>
            <div class="similar-price">${price}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  // Click to switch modal to that wheel
  container.querySelectorAll('.similar-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const newId = card.dataset.wheel;
      if (newId && wheelData[newId]) {
        openWheelModal(newId);
        // Scroll the modal back to top so user sees the new wheel
        const modalEl = document.querySelector('.wheel-modal');
        if (modalEl) modalEl.scrollTop = 0;
      }
    });
  });
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
  if (e.key === 'Escape') closeAccessoryModal();
});

// ===== DON'T FORGET POPUP =====
const dontForgetModal = document.getElementById('dontForgetModal');
const dontForgetClose = document.getElementById('dontForgetClose');
const dontForgetCta = document.getElementById('dontForgetCta');

function openDontForget() {
  dontForgetModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDontForget() {
  dontForgetModal.classList.remove('active');
  document.body.style.overflow = '';
}

dontForgetClose.addEventListener('click', closeDontForget);
dontForgetModal.addEventListener('click', (e) => {
  if (e.target === dontForgetModal) closeDontForget();
});
dontForgetCta.addEventListener('click', () => {
  closeDontForget();
});

document.querySelectorAll('.df-card[data-accessory]').forEach(card => {
  card.addEventListener('click', () => {
    const productId = card.dataset.accessory;
    closeDontForget();
    setTimeout(() => openAccessoryModal(productId), 250);
  });
});

// "Add to Cart" — gather current selections, add item, then show Don't Forget popup
modalQuoteBtn.addEventListener('click', () => {
  const wheelId = modalQuoteBtn.dataset.wheel;
  if (!wheelId) return;
  const wheel = wheelData[wheelId];
  const size = document.getElementById('sizeSelect').value;
  const qty = parseInt(document.getElementById('qtyValue').textContent) || 4;
  const activeFinish = document.querySelector('#finishChips .spec-chip--active');
  const finish = activeFinish ? activeFinish.dataset.finish : '';
  const activeConfig = document.querySelector('#boltConfigChips .spec-chip--active');
  const bolt = activeConfig ? activeConfig.dataset.bolt : '';
  const offset = activeConfig ? activeConfig.dataset.offset : '';
  const cb = activeConfig ? activeConfig.dataset.cb : '';
  const price = getWheelPrice(wheelId, size, finish);
  if (!price) return;

  // Use the currently displayed modal image
  const modalImg = modalImages.querySelector('img');
  const image = modalImg ? modalImg.src : (wheel.images?.[0] || '');

  finderState.lastWheelSelection = {
    wheelId,
    name: wheel.name,
    size,
    bolt,
    cb,
    thread: finderState.lastVehicleSpecs?.thread || ''
  };
  updateAccessoryFitmentNote();

  addToCart({
    wheelId,
    productType: 'wheel',
    name: wheel.name,
    size,
    finish,
    boltConfig: bolt && offset ? `${bolt} ${offset}` : '',
    cb,
    price,
    qty,
    image
  });

  closeWheelModal();
  setTimeout(() => {
    openDontForget();
  }, 300);
});

// ===== ACCESSORIES =====
const accessorySection = document.getElementById('accessories');
const accessoriesGrid = document.getElementById('accessoriesGrid');
const accessoryTabs = document.getElementById('accessoryTabs');
const accessoryFitmentNote = document.getElementById('accessoryFitmentNote');
const accessoryModal = document.getElementById('accessoryModal');
const accessoryModalClose = document.getElementById('accessoryModalClose');
const accessoryModalImages = document.getElementById('accessoryModalImages');
const accessoryModalTitle = document.getElementById('accessoryModalTitle');
const accessoryModalSpecs = document.getElementById('accessoryModalSpecs');
const accessoryAddBtn = document.getElementById('accessoryAddBtn');

function positionAccessoriesSection() {
  const finder = document.getElementById('vehicle-finder');
  if (accessorySection && finder && finder.nextElementSibling !== accessorySection) {
    finder.insertAdjacentElement('afterend', accessorySection);
  }
}

function normalizeMm(value) {
  const num = parseNumber(value);
  return num === null ? '' : num.toFixed(2);
}

function mmNearlyEqual(a, b, tolerance = 0.16) {
  const left = parseNumber(a);
  const right = parseNumber(b);
  return left !== null && right !== null && Math.abs(left - right) <= tolerance;
}

function getRingMeasurements(optionValue) {
  return {
    wheel: parseNumber(String(optionValue).match(/Wheel:\s*([\d.]+)/i)?.[1]),
    hub: parseNumber(String(optionValue).match(/Hub:\s*([\d.]+)/i)?.[1])
  };
}

function findHubRingOption(product, wheelCb, vehicleCb) {
  const ringOption = product.options.find(option => option.id === 'ringSize');
  if (!ringOption || !wheelCb || !vehicleCb) return '';

  const exact = ringOption.values.find(value => {
    const ring = getRingMeasurements(value);
    return normalizeMm(ring.wheel) === normalizeMm(wheelCb) &&
      normalizeMm(ring.hub) === normalizeMm(vehicleCb);
  });
  if (exact) return exact;

  return ringOption.values.find(value => {
    const ring = getRingMeasurements(value);
    return mmNearlyEqual(ring.wheel, wheelCb) && mmNearlyEqual(ring.hub, vehicleCb);
  }) || '';
}

function normalizeThreadPitch(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('1/2')) return '1/2';
  const match = raw.replace(/m/g, '').match(/(\d+)\s*x?\s*(\d+(?:\.\d+)?)/);
  return match ? `${match[1]}x${match[2]}` : raw.replace(/\s+/g, '');
}

function getAccessoryRecommendation(product) {
  const vehicle = finderState.lastVehicleSpecs;
  const wheel = finderState.lastWheelSelection;

  if (product.fitmentKind === 'lug-nut' || product.fitmentKind === 'lug-bolt') {
    const thread = normalizeThreadPitch(vehicle?.thread || wheel?.thread || '');
    const threadOption = product.options
      .find(opt => opt.id === 'threadPitch')
      ?.values.find(value => normalizeThreadPitch(value) === thread);
    if (threadOption) return { threadPitch: threadOption };
  }

  if (product.fitmentKind === 'hub-ring' && vehicle?.centerBore && wheel?.cb) {
    const ringOption = findHubRingOption(product, wheel.cb, vehicle.centerBore);
    if (ringOption) return { ringSize: ringOption };
  }

  return {};
}

function updateAccessoryFitmentNote() {
  if (!accessoryFitmentNote) return;
  const vehicle = finderState.lastVehicleSpecs;
  const wheel = finderState.lastWheelSelection;

  if (vehicle && wheel) {
    accessoryFitmentNote.innerHTML = `
      <strong>Fitment context:</strong>
      ${escapeHtml(vehicle.label || 'Selected vehicle')} uses ${escapeHtml(vehicle.thread || 'unknown thread pitch')};
      selected wheel center bore is ${escapeHtml(wheel.cb || 'unknown')}mm.
      Matching options are preselected when available.
    `;
  } else if (vehicle) {
    accessoryFitmentNote.innerHTML = `
      <strong>Vehicle context:</strong>
      ${escapeHtml(vehicle.label || 'Selected vehicle')} uses ${escapeHtml(vehicle.thread || 'unknown thread pitch')}.
      Select a wheel before hub rings can be matched.
    `;
  } else {
    accessoryFitmentNote.textContent = 'Use the vehicle finder first and we can recommend hardware based on thread pitch, center bore, and selected wheel specs.';
  }
}

function renderAccessoryCards(category = 'all') {
  if (!accessoriesGrid) return;
  const products = Object.values(accessoryProducts)
    .filter(product => category === 'all' || product.category === category);

  accessoriesGrid.innerHTML = products.map(product => `
    <button class="accessory-card" data-accessory="${escapeHtml(product.id)}" type="button">
      <div class="accessory-img"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
      <div class="accessory-info">
        <p class="accessory-name">${escapeHtml(product.name)} - ${escapeHtml(product.pack)}</p>
        <p class="accessory-desc">${escapeHtml(product.description)}</p>
        <p class="accessory-price">${formatMoney(product.price)}</p>
      </div>
    </button>
  `).join('');

  accessoriesGrid.querySelectorAll('.accessory-card[data-accessory]').forEach(card => {
    card.addEventListener('click', () => openAccessoryModal(card.dataset.accessory));
  });
}

function initAccessoryTabs() {
  if (!accessoryTabs) return;
  accessoryTabs.querySelectorAll('.accessory-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      accessoryTabs.querySelectorAll('.accessory-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAccessoryCards(tab.dataset.category || 'all');
    });
  });
}

function renderAccessoryOptions(product) {
  const recommended = getAccessoryRecommendation(product);

  return product.options.map(option => {
    const recommendedValue = recommended[option.id] || '';
    return `
      <label class="spec-group accessory-option" for="accessory-${escapeHtml(option.id)}">
        <div class="spec-label">${escapeHtml(option.label)}${option.required ? ' *' : ''}</div>
        <select class="size-select accessory-select" id="accessory-${escapeHtml(option.id)}" data-option="${escapeHtml(option.id)}" ${option.required ? 'required' : ''}>
          <option value="">Select ${escapeHtml(option.label.toLowerCase())}</option>
          ${option.values.map(value =>
            `<option value="${escapeHtml(value)}" ${value === recommendedValue ? 'selected' : ''}>${escapeHtml(value)}${value === recommendedValue ? ' - recommended' : ''}</option>`
          ).join('')}
        </select>
      </label>
    `;
  }).join('');
}

function getAccessorySelections(product) {
  const selections = {};
  product.options.forEach(option => {
    const input = accessoryModalSpecs.querySelector(`[data-option="${CSS.escape(option.id)}"]`);
    selections[option.id] = input?.value || '';
  });
  return selections;
}

function getAccessoryImageKey(product, selections = {}) {
  const imageMap = accessoryVariantImages[product.id];
  if (!imageMap) return '';

  const threadPitch = selections.threadPitch || '';
  const color = selections.color || '';
  const exactKey = [threadPitch, color].filter(Boolean).join(' / ');

  if (exactKey && imageMap[exactKey]) return exactKey;
  if (color && imageMap[color]) return color;
  if (threadPitch) {
    const threadKey = Object.keys(imageMap).find(key => key.startsWith(`${threadPitch} / `));
    if (threadKey) return threadKey;
  }
  if (color) {
    const colorKey = Object.keys(imageMap).find(key => key.endsWith(` / ${color}`));
    if (colorKey) return colorKey;
  }

  return '';
}

function getAccessoryImage(product, selections = {}) {
  const imageMap = accessoryVariantImages[product.id];
  const key = getAccessoryImageKey(product, selections);
  return (imageMap && key && imageMap[key]) || product.image;
}

function getAvailableAccessoryColors(product, threadPitch = '') {
  const colorOption = product.options.find(option => option.id === 'color');
  const imageMap = accessoryVariantImages[product.id];
  if (!colorOption || !imageMap) return colorOption?.values || [];

  if (threadPitch) {
    const prefix = `${threadPitch} / `;
    const colorsForThread = Object.keys(imageMap)
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length));

    if (colorsForThread.length) {
      return colorOption.values.filter(color => colorsForThread.includes(color));
    }
  }

  return colorOption.values.filter(color =>
    imageMap[color] || Object.keys(imageMap).some(key => key.endsWith(` / ${color}`))
  );
}

function syncAccessoryColorOptions(product) {
  const threadSelect = accessoryModalSpecs.querySelector('[data-option="threadPitch"]');
  const colorSelect = accessoryModalSpecs.querySelector('[data-option="color"]');
  if (!colorSelect) return;

  const currentColor = colorSelect.value;
  const colors = getAvailableAccessoryColors(product, threadSelect?.value || '');
  if (!colors.length) return;

  colorSelect.innerHTML = `
    <option value="">Select color</option>
    ${colors.map(color =>
      `<option value="${escapeHtml(color)}" ${color === currentColor ? 'selected' : ''}>${escapeHtml(color)}</option>`
    ).join('')}
  `;

  if (currentColor && !colors.includes(currentColor)) {
    colorSelect.value = '';
  }
}

function updateAccessoryModalImage(product) {
  if (!accessoryModalImages) return;
  const selections = getAccessorySelections(product);
  const image = getAccessoryImage(product, selections);
  accessoryModalImages.innerHTML = `<img decoding="async" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
}

function validateAccessorySelection(product) {
  const selections = getAccessorySelections(product);
  const missing = product.options.filter(option => option.required && !selections[option.id]);
  if (accessoryAddBtn) {
    accessoryAddBtn.disabled = missing.length > 0;
    accessoryAddBtn.textContent = missing.length ? 'Select Options' : 'Add to Cart';
  }
}

function openAccessoryModal(productId) {
  const product = accessoryProducts[productId];
  if (!product || !accessoryModal) return;

  accessoryModalTitle.textContent = `${product.name} - ${product.pack}`;
  accessoryModalImages.innerHTML = `<img decoding="async" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
  accessoryModalSpecs.innerHTML = `
    <div class="spec-group">
      <div class="spec-label">Price</div>
      <div class="spec-value accessory-modal-price">${formatMoney(product.price)} <span>${escapeHtml(product.pack)}</span></div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Details</div>
      <div class="spec-value">${escapeHtml(product.description)}</div>
    </div>
    ${renderAccessoryOptions(product)}
    <p class="accessory-modal-note">Hardware fitment depends on vehicle thread pitch, wheel seat type, center bore, and selected wheel specs. Text us before ordering if anything is not listed.</p>
  `;

  accessoryAddBtn.dataset.accessory = productId;
  accessoryModalSpecs.querySelectorAll('.accessory-select').forEach(select => {
    select.addEventListener('change', () => {
      syncAccessoryColorOptions(product);
      updateAccessoryModalImage(product);
      validateAccessorySelection(product);
    });
  });
  syncAccessoryColorOptions(product);
  updateAccessoryModalImage(product);
  validateAccessorySelection(product);

  accessoryModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAccessoryModal() {
  if (!accessoryModal) return;
  accessoryModal.classList.remove('active');
  document.body.style.overflow = '';
}

function addSelectedAccessoryToCart() {
  const productId = accessoryAddBtn?.dataset.accessory;
  const product = accessoryProducts[productId];
  if (!product) return;

  const selections = getAccessorySelections(product);
  const missing = product.options.filter(option => option.required && !selections[option.id]);
  if (missing.length) {
    validateAccessorySelection(product);
    return;
  }

  const optionLines = product.options
    .map(option => selections[option.id] ? `${option.label}: ${selections[option.id]}` : '')
    .filter(Boolean);

  addToCart({
    cartKey: `accessory:${product.id}:${optionLines.join('|')}`,
    productType: 'accessory',
    accessoryId: product.id,
    name: `${product.name} - ${product.pack}`,
    size: optionLines.join(' / '),
    finish: '',
    boltConfig: '',
    cb: '',
    metaLines: optionLines,
    price: product.price,
    qty: 1,
    image: getAccessoryImage(product, selections),
    options: selections
  });

  closeAccessoryModal();
  openCart();
}

function initAccessories() {
  positionAccessoriesSection();
  initAccessoryTabs();
  renderAccessoryCards('all');
  updateAccessoryFitmentNote();

  if (accessoryModalClose) accessoryModalClose.addEventListener('click', closeAccessoryModal);
  if (accessoryModal) {
    accessoryModal.addEventListener('click', (e) => {
      if (e.target === accessoryModal) closeAccessoryModal();
    });
  }
  if (accessoryAddBtn) accessoryAddBtn.addEventListener('click', addSelectedAccessoryToCart);
}

// ===== CARD PRICES & SWATCHES =====
const finishColors = {
  'Silver Machined Face': '#c0c0c0',
  'Silver w/Machined Face': '#c0c0c0',
  'Silver W/Machined Face': '#c0c0c0',
  'Silver w/Machined Lip': '#c8c8c8',
  'Silver w/ Machined Lip': '#c8c8c8',
  'Machined Silver': '#b8b8b8',
  'Silver Machined Lip': '#c8c8c8',
  'Gloss Silver Machined Face': '#c8c8c8',
  'Gloss Black': '#1a1a1a',
  'Matte Black': '#2d2d2d',
  'Black Vacuum': '#111',
  'Black Vacuum (PVD)': '#111',
  'Hyper Black': '#4a4a4a',
  'Hyper Black w/ Machined Lip': '#4a4a4a',
  'Bronze': '#8b6914',
  'Matte Bronze': '#7a5c12',
  'Bronze Machined Lip': '#8b6914',
  'Bronze w/Machined Lip': '#8b6914',
  'Matte Bronze Machined Lip': '#7a5c12',
  'Chrome': '#e0e0e0',
  'PVD Chrome': '#dcdcdc',
  'Vacuum Chrome': '#dcdcdc',
  'Vacuum Chrome (PVD)': '#dcdcdc',
  'Gunmetal': '#6b6b6b',
  'Gold Machined Face': '#c9952c',
  'Gold Vacuum': '#c9952c',
  'Gold Vacuum (PVD)': '#c9952c',
  'Vacuum Gold Chrome': '#c9952c',
  'Matte Black Machined Lip': '#2d2d2d',
  'Silver': '#c0c0c0',
  'Hyper Silver': '#b0b0b0',
  'Hyper Silver Machined Face': '#b0b0b0',
  'Hyper Silver Machine Tip': '#b0b0b0',
  'Satin Silver': '#aaa',
  'Machined Gold': '#c9952c',
  'White': '#f0f0f0',
  'Matte Bronze Machined Tip': '#7a5c12',
  'Matte Black Machined Tip': '#2d2d2d',
  'Matte Black Machine Lip': '#2d2d2d',
  'Gloss Black Machined Face': '#1a1a1a',
  'Satin Black': '#333',
  'Textured Bronze': '#8b6914',
  'Gloss White': '#f5f5f5',
  'Silver Machined': '#c0c0c0',
  'Gun Metal': '#6b6b6b',
  'Black': '#1a1a1a',
  'Matte Gray': '#6f6f6f',
  'Gloss Black W /Gold Rivets': '#1a1a1a',
  'Candy Red w/ (Chrome Rivets)': '#b3262e',
};

function getFinishColor(finish) {
  if (finishColors[finish]) return finishColors[finish];
  const lower = finish.toLowerCase();
  if (lower.includes('bronze')) return '#8b6914';
  if (lower.includes('gold')) return '#c9952c';
  if (lower.includes('black')) return '#2d2d2d';
  if (lower.includes('gunmetal') || lower.includes('gun metal')) return '#6b6b6b';
  if (lower.includes('white')) return '#f0f0f0';
  if (lower.includes('silver') || lower.includes('machined') || lower.includes('chrome')) return '#c0c0c0';
  return '#999';
}

function canonicalFinishName(finish) {
  const name = finish.trim();
  if (name === 'Silver W/Machined Face') return 'Silver w/Machined Face';
  return name;
}

function normalizeFinishKey(finish) {
  return canonicalFinishName(finish || '')
    .toLowerCase()
    .replace(/\(pvd\)/g, '')
    .replace(/w\s*\/\s*/g, 'with ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Static finish→image map per model (from Shopify API scrape)
const finishImages = {
  // AH Series
  ah02: {
    'Silver w/ Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_SML_01.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_GB_01.jpg?width=800',
    'Hyper Black w/ Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1895_HB_01.jpg?width=800'
  },
  ah03: {
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1895_GB_01_64ca1671-71d7-446e-b1f1-8b8a097421e2.jpg?width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH03_1895_SMF_01_a9be5c1a-f60b-4ffe-94fe-848c3f2429d4.jpg?width=800'
  },
  ah05: {
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1885_GB_01_a855e277-7da3-438e-8cd3-3a7f8ca4dfd7.jpg?width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH05_1885_SMF_03.jpg?width=800'
  },
  ah06: {
    'Machined Silver': 'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_MS_01.jpg?width=800',
    'Textured Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1890_BRZ_01_e5e62626-4a73-4759-afe0-b0e77bb4ac07.jpg?width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1890_GB_01.jpg?width=800',
    'Matte Gray': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1890_MG_01.jpg?width=800'
  },
  ah07: {
    'Textured Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1885_BRZ_01_4879e738-46cc-437f-96f6-e30943f06adb.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1885_GB_01_059ed767-38ba-4802-ad2a-7eb0c87d4774.jpg?width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1885_HB_01_9e5fa8cc-9743-46a9-a3c0-f7021e1df3a8.jpg?width=800',
    'Gloss White': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH07_1885_WHT_01_95faee32-55cd-411d-8411-c2ea2ba1c02f.jpg?width=800'
  },
  ah08: {
    'Textured Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1885_BRZ_01.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1885_GB_01.jpg?width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1885_HB_01.jpg?width=800',
    'Gloss White': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH08_1885_WHT_01.jpg?width=800'
  },
  ah09: {
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_MS_D_01.jpg?width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_HB_D_01.jpg?width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_BRZ_D_01.jpg?width=800'
  },
  ahx: {
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1885_HBLK_01.jpg?width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1885_MB_01.jpg?width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1885_MBZ_01.jpg?width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AHX_1885_MS_01.jpg?width=800'
  },
  ah11: {
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1885_MS_01.jpg?width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1885_HBLK_01.jpg?width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1885_MB_01.jpg?width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH11_1895_MBZ_01.jpg?width=800'
  },
  // DS Series
  ds01: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_BRONZE_03_52b41525-7011-44e1-8919-62f099957031.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_GB_01_ed615246-dbd4-48bb-872d-a5e5de8997b8.jpg?width=800',
    'Silver w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_18105_SML_01_f90c839c-4c87-4001-ab75-c4ecb1ec3445.jpg?width=800',
    'Black Vacuum (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_BV_03_372a26a6-5113-4e66-a10c-c5ac8fcc485b.jpg?v=1749494671&width=800',
    'Gold Vacuum (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_VG_03_7b7d5b13-1736-4f1f-a111-9ae52f8d9484.jpg?v=1749494672&width=800',
    'Vacuum Chrome (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS01_1885_VC_03_5effc08c-a6f8-47ad-8296-f0c231f0b27f.jpg?v=1749494672&width=800'
  },
  ds02: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1885_BRZ_03_bae8b50d-0182-4be2-813e-493b07e46567.jpg?v=1749494658&width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1885_HBLK_03.jpg?v=1749494659&width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1885_SMF_03.jpg?v=1749494659&width=800',
    'Silver W/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1885_SMF_03.jpg?v=1749494659&width=800',
    'Black Vacuum (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1895_BV_03.jpg?v=1749494660&width=800',
    'Gold Vacuum (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1895_VG_03.jpg?v=1749494661&width=800',
    'Vacuum Chrome (PVD)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS02_1895_VC_03.jpg?v=1749494661&width=800'
  },
  ds03: {
    'Black Vacuum': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/DS03_1895_VB_03D.jpg?v=1749494677&width=800',
    'Gold Vacuum': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/DS03_1895_VG_03D.jpg?v=1749494677&width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/DS03_1895_MS_03D.jpg?v=1749494676&width=800',
    'Vacuum Chrome': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/DS03_1895_VC_03D.jpg?v=1749494677&width=800'
  },
  ds05: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_BRZ_1885_03.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1885_GB_03_ca49bed6-bd5f-4255-b6af-5615052c480d.jpg?width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_18105_SMF_03_c437ea07-45c2-4142-9724-46d04ccb75c6.jpg?width=800',
    'Black Vacuum': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS05_1885_BV_03_c9411c1f-9824-4d7b-92b1-69c43aa7b65c.jpg?v=1749494651&width=800'
  },
  ds06: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1885_BRONZE_01_e3844a1a-8486-4f93-80ba-5b33c98343ad.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1885_GB_03_832affc0-0e8d-428b-8cec-6b468e1ea0c8.jpg?width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS06_1895_SMF_03_ff12ed63-e6c7-4cbc-88ad-574207d444d9.jpg?width=800'
  },
  ds07: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1885_BRONZE_03.jpg?v=1749494615&width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1885_GB_03.jpg?width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS07_1895_SMF_03.jpg?width=800'
  },
  ds08: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1885_BZ_03.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1885_GB_03.jpg?v=1749494587&width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS08_1895_MS_03.jpg?width=800'
  },
  ds09: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1885_BZML_03_0d6eac8f-3909-498f-8d30-fed270016d8a.jpg?width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1885_SMF_01_c1d7efa9-e364-41ad-a9b4-4f4b1390c558.jpg?width=800',
    'Gloss Black W /Gold Rivets': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1895_GB_01_9e5cf815-37d9-4033-9eeb-11ad9e45fd1b.jpg?width=800',
    'Candy Red w/ (Chrome Rivets)': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DS09_1985_CR_01_83d7cdcd-d4c2-4be8-8999-eff1c4482c0a.jpg?width=800'
  },
  dsx: {
    'Bronze w/Machined Lip': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1885_BZML_03.jpg?width=800',
    'Gloss Black W /Gold Rivets': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1885_GB_03.jpg?v=1749494545&width=800',
    'Silver w/Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/DSX_1885_SMF_03.jpg?width=800'
  },
  // AFF Series
  aff1: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF1_2090_MB_03_e46a0924-dbb8-4456-a6a5-b44a706063d8.jpg?width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF1_2090_MBRZ_03_7574050d-541f-4e91-8398-7c77c4f8a342.jpg?width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF1_20105_SMF_03_dce2b951-ff5e-4171-9323-44c3b64e9a72.jpg?width=800'
  },
  aff2: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1985_MB_03.jpg?v=1749494563&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1985_MBZ_03.jpg?v=1749494563&width=800',
    'Matte Gray': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1985_GM_03.jpg?v=1749494564&width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF02_1985_SMF_03.jpg?v=1749494562&width=800'
  },
  aff3: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_2090_MB_03.jpg?v=1773872477&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_2090_BRZ_03.jpg?v=1773872478&width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AFF03_2090_MS_03.jpg?v=1773872478&width=800'
  },
  aff7: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1885_MB_03.jpg?v=1749494581&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1885_BRZ_03.jpg?v=1749494581&width=800',
    'Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF7_1885_SMF_03.jpg?v=1749494580&width=800'
  },
  aff9: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF9_2090_MB_03_f7785824-4973-49ac-856b-12205908e088.jpg?width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF9_2090_MBZ_03_2efee466-3cb1-4d9e-b2d7-959f57cd23ea.jpg?width=800',
    'Gloss Silver Machined Face': 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF9_20105_SMF_01_d2b00b4d-163a-46bf-9a86-cfcd731f9606.jpg?width=800'
  },
  // Mflow Road Series
  mfr1: {
    'Hyper Silver Machined Face': 'https://www.mflowracing.com/cdn/shop/files/MFR1-2085-MACHINEDSILVER1.jpg?v=1771531382&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF1-1985-MATT-BRONZE-1.jpg?v=1757108284&width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF1-1885-MATT-BLACK-1.jpg?v=1757108286&width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF1-2085-HYPER-BLACK-1.jpg?v=1757108285&width=800'
  },
  mfr2: {
    'Hyper Silver': 'https://wheelplususa.com/cdn/shop/files/MFR2-Hyper-Silver-Wheels-Rims_1060734f-d490-4036-b02e-859985eddd44.jpg?v=1760722999&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF2-2085-MATT_20BRONZE-1.jpg?v=1757108282&width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF2-2085-MATT_20BLACK-1.jpg?v=1757108283&width=800'
  },
  mfr3: {
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF3-1995-GLOSS_20BLACK-1.jpg?v=1757108279&width=800',
    'Hyper Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF3-1985-HYPER_20SILVER-1.jpg?v=1757108281&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF3-1885-MATT_20BRONZE-1.jpg?v=1757108280&width=800'
  },
  mfr4: {
    'Hyper Silver Machine Tip': 'https://www.mflowracing.com/cdn/shop/files/MFR4HyperSilverMachinedTip.jpg?v=1771542352&width=800',
    'Matte Black Machine Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFR4-1885-MATT_BLACK_MACHINED_LIP-1-p.jpg?v=1757108271&width=800',
    'Matte Bronze Machined Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFR4-1985-MATT_BRONZE_MACHINED_LIP-1-p.jpg?v=1757108269&width=800'
  },
  // Mflow Luxury Series
  mfl1: {
    'Matte Black Machined Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL118X9.5MattBlackMACHINEDLIP.jpg?v=1757108277&width=800',
    'Matte Bronze Machined Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL118X9.5MattBRONZEMACHINEDLIP.jpg?v=1757108276&width=800',
    'Chrome': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL120X9.5ChromePVD.jpg?v=1757108275&width=800'
  },
  mfl2: {
    'Matte Black Machined Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL218X8.5MattBLACKMACHINEDLIP.jpg?v=1757108274&width=800',
    'Matte Bronze Machined Lip': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL218X9.5MattBRONZEMACHINEDLIP.jpg?v=1757108273&width=800',
    'Chrome': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MFL220X8.5CHROMEPVD.jpg?v=1757108272&width=800'
  },
  // Mflow Offroad Series
  mf01: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF01_MATT_BLACK-B.jpg?v=1757108268&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF01_MATT_BRONZE-B.jpg?v=1757108268&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF01_SILVER_MACHINED_FACE.jpg?v=1771967605&width=800'
  },
  mf02: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF02_MATTBLACK-B.jpg?v=1757108267&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF02_MATTBRONZE-B.jpg?v=1757108267&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF02SILVERMACHINEDFACE6H.jpg?v=1771968623&width=800'
  },
  mf03: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF03_MATTBLACK-B.jpg?v=1757108265&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF03_MATTBRONZE-B.jpg?v=1757108265&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF03SILVERMACHINEDFACE6H.jpg?v=1772137345&width=800'
  },
  mf04: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF04-MATTBLACK-B.jpg?v=1757108263&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF04-MATTBRONZE-B.jpg?v=1757108264&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF04SILVERMACHINEDFACE6H.jpg?v=1772138088&width=800'
  },
  mf05: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF05_MATTBLACK-B.jpg?v=1757108262&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF05_MATTBRONZE-B.jpg?v=1757108262&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF05SILVERMACHINEDFACE6H.jpg?v=1772141164&width=800'
  },
  mf06: {
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF06_MATT_BLACK-B.jpg?v=1757108260&width=800',
    'Matte Bronze': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF06_MATT_BRONZE-B.jpg?v=1757108260&width=800',
    'Machined Silver': 'https://cdn.shopify.com/s/files/1/0569/7139/5175/files/MF06SILVERMACHINEDFACE6H.jpg?v=1772142040&width=800'
  },
  // Vors
  'vors-tr4': {
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_BK_1.jpg?v=1769836819&width=800',
    'Bronze': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_BR_1.jpg?v=1769836819&width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_HB.jpg?v=1769836819&width=800',
    'Silver Machined': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_S_1.jpg?v=1769836819&width=800',
    'White': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_W_1.jpg?v=1769836819&width=800'
  },
  'vors-tr10': {
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR10_18X85_BK_1.jpg?width=800',
    'White': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR10_18X85_W_1.jpg?width=800'
  },
  'vors-tr14': {
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X8_BK_1.jpg?v=1777941225&width=800',
    'Silver': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR14_18X8_S_1.jpg?v=1777941225&width=800'
  },
  'vors-tr37': {
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_BLACK.jpg?v=1767661231&width=800',
    'Bronze': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_BR_1.jpg?v=1767661231&width=800',
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_HB.jpg?v=1767661231&width=800',
    'Silver Machined': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_SF_1.jpg?v=1767661231&width=800',
    'White': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_WHITE.jpg?v=1767661231&width=800'
  },
  'vors-tr88': {
    'Bronze': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_18X95_MBR_1.jpg?width=800',
    'Silver Machined': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_19X95_S_1.jpg?width=800',
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR88_20X9_BK_1.jpg?width=800'
  },
  'vors-vr8': {
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_18X9_HB_CR_MAIN.jpg?width=800',
    'Silver': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_19X95_S_1.jpg?width=800',
    'Gloss Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_20X85_GB_1_5ae9b9d4-fd34-4dde-97bc-008bfe2aa565.jpg?width=800'
  },
  'vors-ar5': {
    'Bronze': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X9_BR_1.jpg?v=1774910671&width=800',
    'Silver Machined': 'https://www.vorswheels.com/cdn/shop/files/AR05_18X95_SILVER_STD.jpg?width=800',
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X8_BK_1.jpg?width=800'
  },
  'vors-sp1': {
    'Hyper Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X8_HB.jpg?width=800',
    'Matte Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_15X7_MB_1.jpg?v=1767878630&width=800',
    'Silver Machined': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_18X9_SILVER_2KPX.jpg?width=800',
    'White': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_16X8_WHITE_1.jpg?width=800'
  },
  'vors-lt53': {
    'Gun Metal': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/LT53_18X9_GM_1.jpg?width=800',
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/LT53_18X9_BK_1.jpg?width=800'
  },
  'vors-uo2': {
    'Black': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/UO2_18X85_MB_1.jpg?v=1762488607&width=800',
    'Hyper Silver': 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/UO2_18X85_S_1.jpg?width=800'
  }
};

// Map image URL to likely finish names
function guessFinishFromUrl(url) {
  const l = url.toLowerCase();
  if (l.includes('_bv_')) return ['Black Vacuum (PVD)', 'Black Vacuum'];
  if (l.includes('_vgc_') || l.includes('vacuum-gold') || l.includes('_vg_')) return ['Vacuum Gold Chrome', 'Gold Vacuum (PVD)', 'Gold Vacuum'];
  if (l.includes('_vc_') || l.includes('vacuum-chrome') || l.includes('chromepvd') || l.includes('chrome-pvd')) return ['Vacuum Chrome (PVD)', 'Vacuum Chrome', 'Chrome', 'PVD Chrome'];
  if (l.includes('_hblk_')) return ['Hyper Black'];
  if (l.includes('_sf_')) return ['Silver Machined', 'Silver', 'Satin Silver'];
  if (l.includes('_smf_') || l.includes('silver-machined') || (l.includes('_silver_') && !l.includes('hyper'))) return ['Silver Machined Face', 'Silver Machined Lip', 'Silver', 'Silver Machined'];
  if (l.includes('_sml_')) return ['Silver w/ Machined Lip', 'Silver Machined Lip', 'Silver w/Machined Lip'];
  if (l.includes('_ms_') || l.includes('machined-silver') || l.includes('machined_20silver') || l.includes('machinedsilver')) return ['Machined Silver', 'Silver Machined Face', 'Silver Machined'];
  if (l.includes('_gb_') || l.includes('gloss-black') || l.includes('gloss_20black')) return ['Gloss Black', 'Gloss Black Machined Face', 'Black'];
  if (l.includes('_brz_') || l.includes('_brzml_')) return ['Bronze', 'Bronze Machined Lip', 'Textured Bronze', 'Bronze w/Machined Lip'];
  if (l.includes('_hb_') || l.includes('hyper-black') || l.includes('hyper_20black')) return ['Hyper Black'];
  if (l.includes('_wht_')) return ['Gloss White', 'White'];
  if (l.includes('_mb_') && !l.includes('_mbz_') && !l.includes('_mbr_')) return ['Matte Black', 'Matte Black Machined Lip'];
  if (l.includes('_mbz_') || l.includes('_mbrz_')) return ['Matte Bronze', 'Matte Bronze Machined Lip', 'Matte Bronze Machined Tip'];
  if (l.includes('_mg_') || l.includes('matte-gunmetal')) return ['Matte Gray', 'Matte Gunmetal'];
  if (l.includes('_gmf_')) return ['Gold Machined Face'];
  if (l.includes('_gsmf_')) return ['Gloss Silver Machined Face'];
  if (l.includes('matte-bronze') || l.includes('matte_bronze') || l.includes('matt_20bronze') || l.includes('matt_bronze') || l.includes('mattbronze')) return ['Matte Bronze', 'Matte Bronze Machined Lip', 'Matte Bronze Machined Tip'];
  if (l.includes('matte-black') || l.includes('matte_black') || l.includes('matt_20black') || l.includes('matt_black') || l.includes('mattblack')) return ['Matte Black', 'Matte Black Machined Lip', 'Matte Black Machine Lip', 'Black', 'Satin Black'];
  if (l.includes('_bk_') || (l.includes('-black-') && !l.includes('hyper') && !l.includes('gloss') && !l.includes('matte') && !l.includes('matt'))) return ['Black', 'Matte Black', 'Satin Black'];
  if (l.includes('hyper-silver') || l.includes('hyper_20silver') || l.includes('hypersilver')) return ['Hyper Silver', 'Hyper Silver Machined Face', 'Hyper Silver Machine Tip'];
  if (l.includes('-chrome') || l.includes('_chrome')) return ['Chrome', 'PVD Chrome'];
  if (l.includes('_gm_') || l.includes('gunmetal')) return ['Gunmetal', 'Gun Metal'];
  if (l.includes('_w_') || l.includes('_white')) return ['White', 'Gloss White'];
  if (l.includes('-white')) return ['White', 'Gloss White'];
  if (l.includes('_bz_') || l.includes('_bzml_') || l.includes('_bronze_') || l.includes('bronze')) return ['Bronze', 'Bronze w/Machined Lip', 'Bronze Machined Lip'];
  if (l.includes('_cr_') && !l.includes('chrome')) return ['Candy Red w/ (Chrome Rivets)'];
  if (l.includes('_s_') || l.includes('-silver') || l.includes('_silver')) return ['Silver', 'Satin Silver', 'Silver Machined'];
  if (l.includes('_mbr_')) return ['Matte Bronze', 'Bronze'];
  if (l.includes('_br_')) return ['Bronze'];
  if (l.includes('_sf_')) return ['Satin Silver', 'Silver'];
  return [];
}

// Build finish→image map for a wheel (3-layer: static map → images array → variant images)
function buildFinishImageMap(wheel, id) {
  const map = {};
  // 1. Static overrides (highest priority, guaranteed correct)
  if (finishImages[id]) {
    Object.entries(finishImages[id]).forEach(([finish, url]) => {
      map[canonicalFinishName(finish)] = url;
    });
  }
  // 2. From images array via URL guessing
  if (wheel.images) {
    wheel.images.forEach(url => {
      const matched = guessFinishFromUrl(url);
      matched.forEach(f => { if (!map[f]) map[f] = url; });
    });
  }
  // 3. From variant images via URL guessing
  if (wheel.variants) {
    Object.values(wheel.variants).forEach(v => {
      if (v.image) {
        const matched = guessFinishFromUrl(v.image);
        matched.forEach(f => { if (!map[f]) map[f] = v.image; });
      }
    });
  }
  return map;
}

function getFinishImage(map, finish) {
  if (!finish) return '';
  const canonical = canonicalFinishName(finish);
  if (map[canonical]) return map[canonical];

  const target = normalizeFinishKey(canonical);
  const match = Object.keys(map).find(key => normalizeFinishKey(key) === target);
  return match ? map[match] : '';
}

function getWheelDisplayImage(wheel, wheelId, size, finish = '') {
  const variant = getVariantData(wheel, size);
  const finishImgMap = buildFinishImageMap(wheel, wheelId);
  const finishImage = getFinishImage(finishImgMap, finish);
  return finishImage || variant.image || wheel.images?.[0] || '';
}

const cardFinishPreferences = {
  aodhan: [
    'Silver Machined Face',
    'Silver w/Machined Face',
    'Silver W/Machined Face',
    'Silver w/ Machined Lip',
    'Silver w/Machined Lip',
    'Gloss Silver Machined Face',
    'Machined Silver',
    'Silver Machined',
    'Silver',
    'Hyper Silver',
    'Chrome',
    'Vacuum Chrome (PVD)',
    'Vacuum Chrome',
    'PVD Chrome',
    'Gloss White',
    'White'
  ],
  mflow: [
    'Hyper Silver Machine Tip',
    'Hyper Silver Machined Face',
    'Hyper Silver',
    'Chrome',
    'Machined Silver',
    'Silver Machined Face',
    'Silver Machined',
    'Silver',
    'Satin Silver'
  ],
  vors: [
    'Silver Machined',
    'Silver',
    'Hyper Silver',
    'Satin Silver',
    'Chrome',
    'Gloss White',
    'White',
    'Gun Metal',
    'Gunmetal'
  ]
};

function getWheelBrand(id) {
  if (id.startsWith('vors-')) return 'vors';
  if (id.startsWith('mf')) return 'mflow';
  return 'aodhan';
}

function pickCardDefaultFinish(id, finishes, finishImgMap) {
  const preferences = cardFinishPreferences[getWheelBrand(id)] || [];
  return preferences.find(finish =>
    finishes.includes(canonicalFinishName(finish)) && getFinishImage(finishImgMap, finish)
  ) || finishes.find(finish => getFinishImage(finishImgMap, finish)) || finishes[0];
}

document.querySelectorAll('.wheel-card').forEach(card => {
  const id = card.dataset.wheel;
  const wheel = wheelData[id];
  if (!wheel) return;

  // Price
  const priceEl = card.querySelector('.wheel-price');
  if (priceEl && wheel.priceRange) {
    const m = wheel.priceRange.match(/\$[\d,]+/);
    priceEl.textContent = m ? 'From ' + m[0] : wheel.priceRange;
  }

  // Swatches
  const swatchEl = card.querySelector('.wheel-swatches');
  if (!swatchEl) return;
  const finishes = new Set();
  if (wheel.variants) {
    Object.values(wheel.variants).forEach(v => {
      if (v.finishes) v.finishes.forEach(f => finishes.add(canonicalFinishName(f)));
    });
  } else if (wheel.finishes) {
    wheel.finishes.forEach(f => finishes.add(canonicalFinishName(f)));
  }

  const finishImgMap = buildFinishImageMap(wheel, id);
  const cardImg = card.querySelector('.wheel-img-wrap img');
  const originalSrc = cardImg ? cardImg.src : '';

  const finishChoices = [
    ...new Set([
      ...finishes,
      ...Object.keys(finishImgMap).map(canonicalFinishName)
    ])
  ];
  const imageBackedFinishes = finishChoices.filter(f => getFinishImage(finishImgMap, f));
  const finishOptions = imageBackedFinishes.length ? imageBackedFinishes : finishChoices;
  const activeFinish = pickCardDefaultFinish(id, finishOptions, finishImgMap);
  const arr = activeFinish
    ? [activeFinish, ...finishOptions.filter(f => f !== activeFinish)]
    : finishOptions;
  const maxShow = 6;
  arr.slice(0, maxShow).forEach((f, i) => {
    const dot = document.createElement('span');
    dot.className = 'wheel-swatch';
    dot.style.background = getFinishColor(f);
    dot.title = f;

    // Make clickable
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      // Highlight active swatch
      swatchEl.querySelectorAll('.wheel-swatch').forEach(s => s.classList.remove('active'));
      dot.classList.add('active');
      // Swap image if we have one for this finish
      const finishImage = getFinishImage(finishImgMap, f);
      if (cardImg && finishImage) {
        cardImg.src = finishImage.replace('width=800', 'width=400');
      } else if (cardImg) {
        cardImg.src = originalSrc;
      }
    });

    swatchEl.appendChild(dot);
  });
  if (arr.length > maxShow) {
    const more = document.createElement('span');
    more.className = 'wheel-swatch-more';
    more.textContent = '+' + (arr.length - maxShow);
    swatchEl.appendChild(more);
  }

  const activeIndex = arr.indexOf(activeFinish);
  const activeDot = activeIndex > -1 ? swatchEl.querySelectorAll('.wheel-swatch')[activeIndex] : null;
  if (activeDot) activeDot.classList.add('active');

  const activeImage = getFinishImage(finishImgMap, activeFinish);
  if (cardImg && activeImage) {
    cardImg.src = activeImage.replace('width=800', 'width=400');
  }
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
document.querySelectorAll('.brand-section, .gallery-carousel, .about-point, .review-card, .accessory-card, .contact-social-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== BUILD NAV BRANDS DROPDOWN (alphabetical, no accordion) =====
function buildNavBrands() {
  // Alphabetical brand list
  const brands = [
    { id: 'aodhan', label: 'Aodhan' },
    { id: 'mflow',  label: 'MFlow Racing' },
    { id: 'vors',   label: 'Vors' }
  ];

  const menu = document.getElementById('navSubMenu');
  menu.innerHTML = '';

  brands.forEach(brand => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#brands';
    a.className = 'nav-sub-link';
    a.textContent = brand.label;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(`.brand-tab[data-brand="${brand.id}"]`).click();
      closeMobileMenu();
      document.getElementById('brands').scrollIntoView({ behavior: 'smooth' });
    });
    li.appendChild(a);
    menu.appendChild(li);
  });
}

buildNavBrands();

// ===== COMPUTE + INJECT BRAND SET PRICE RANGES =====
(function updateBrandSetPrices() {
  const brandTests = {
    aodhan: (id) => id.startsWith('ah') || id.startsWith('ds') || id.startsWith('aff'),
    mflow:  (id) => id.startsWith('mf'),
    vors:   (id) => id.startsWith('vors-')
  };

  Object.entries(brandTests).forEach(([brand, test]) => {
    const keys = Object.keys(wheelData).filter(test);
    const allPrices = keys.flatMap(id => {
      const pr = wheelData[id]?.priceRange || '';
      return [...pr.matchAll(/\$(\d[\d,]*)/g)].map(m => parseInt(m[1].replace(',','')));
    }).filter(Boolean);
    if (!allPrices.length) return;

    const minSet = Math.round(Math.min(...allPrices) * 4 * (1 - SET_OF_4_DISCOUNT));
    const maxSet = Math.round(Math.max(...allPrices) * 4 * (1 - SET_OF_4_DISCOUNT));

    const el = document.querySelector(`.brand-section[data-brand="${brand}"] .brand-price`);
    if (el) el.innerHTML = `$${minSet.toLocaleString()} – $${maxSet.toLocaleString()} <span>per set</span>`;
  });
})();

// ===== SORT WHEEL CARDS: 5-lug first, then 4-lug =====
function getMinLugCount(wheelId) {
  const wheel = wheelData[wheelId];
  if (!wheel || !wheel.variants) return 99;
  // Find the highest lug count across all variants
  let maxLugs = 0;
  Object.values(wheel.variants).forEach(v => {
    (v.boltPatterns || []).forEach(bp => {
      const match = bp.match(/^(\d+)x/);
      if (match) {
        const lugs = parseInt(match[1]);
        if (lugs > maxLugs) maxLugs = lugs;
      }
    });
  });
  return maxLugs;
}

document.querySelectorAll('.wheel-grid').forEach(grid => {
  const cards = Array.from(grid.querySelectorAll('.wheel-card[data-wheel]'));
  cards.sort((a, b) => {
    const aLugs = getMinLugCount(a.dataset.wheel);
    const bLugs = getMinLugCount(b.dataset.wheel);
    return bLugs - aLugs; // higher lug count first (5 before 4)
  });
  cards.forEach(card => grid.appendChild(card));
});

// ===== VEHICLE FINDER =====
const finderState = {
  years: [],
  makes: [],
  models: [],
  modifications: [],
  lastVehicleSpecs: null,
  lastWheelSelection: null
};

function setFinderStatus(message, type = '') {
  const el = document.getElementById('finderStatus');
  if (!el) return;
  el.textContent = message;
  el.className = `finder-note ${type}`.trim();
}

function setFinderSelect(select, items, placeholder) {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.slug || item.value || item.name || item;
    option.textContent = item.name || item.title || item.slug || item;
    select.appendChild(option);
  });
  select.disabled = !items.length;
}

async function fetchFitment(resource, params = {}) {
  const query = new URLSearchParams({ resource, region: 'usdm', ...params });
  const res = await fetch(`/api/fitment?${query.toString()}`);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { error: 'Vehicle finder API requires the Vercel dev server or production deployment.' };
  if (!res.ok) throw new Error(data.error || 'Fitment lookup failed');
  return data.data || [];
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseWheelSize(size) {
  const match = String(size).match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/i);
  if (!match) return { diameter: null, width: null };
  return { diameter: Number(match[1]), width: Number(match[2]) };
}

function normalizeBoltPattern(value) {
  return String(value || '').toLowerCase().replace(/\s/g, '').replace('x', 'x');
}

function boltPatternMatches(vehicleBolt, wheelBolt) {
  const target = normalizeBoltPattern(vehicleBolt);
  if (!target) return false;
  return normalizeBoltPattern(wheelBolt)
    .split(/[\/,]/)
    .some(part => part === target);
}

function getVehicleReferenceWheel(record) {
  const wheel = (record.wheels || []).find(w => w.is_stock && w.front?.rim_width && w.front?.rim_offset)
    || (record.wheels || []).find(w => w.front?.rim_width && w.front?.rim_offset)
    || record.wheels?.[0];
  return wheel?.front || {};
}

function getVehicleSpecs(record) {
  const technical = record.technical || {};
  const reference = getVehicleReferenceWheel(record);
  return {
    label: [
      record.year,
      record.make?.name,
      record.model?.name,
      record.trim || record.name
    ].filter(Boolean).join(' '),
    boltPattern: technical.bolt_pattern,
    centerBore: parseNumber(technical.centre_bore),
    thread: technical.wheel_fasteners?.thread_size || '',
    fastenerType: technical.wheel_fasteners?.type || '',
    torque: technical.wheel_tightening_torque || '',
    oeDiameter: parseNumber(reference.rim_diameter),
    oeWidth: parseNumber(reference.rim_width),
    oeOffset: parseNumber(reference.rim_offset),
    oeTire: reference.tire_full || reference.tire || ''
  };
}

function getGoalLimits(goal) {
  const limits = {
    daily: { outer: 18, inner: 15, offset: 18 },
    flush: { outer: 28, inner: 18, offset: 26 },
    aggressive: { outer: 42, inner: 22, offset: 36 },
    performance: { outer: 24, inner: 18, offset: 20 }
  };
  return limits[goal] || limits.daily;
}

function getFinderMatches(specs, goal) {
  const limits = getGoalLimits(goal);
  const matches = [];

  Object.entries(wheelData).forEach(([wheelId, wheel]) => {
    Object.entries(wheelBoltConfigs[wheelId] || {}).forEach(([size, configs]) => {
      const parsedSize = parseWheelSize(size);
      configs.forEach(config => {
        if (!boltPatternMatches(specs.boltPattern, config.bolt)) return;

        const wheelCb = parseNumber(config.cb);
        if (specs.centerBore && wheelCb && wheelCb + 0.1 < specs.centerBore) return;

        const offset = parseNumber(config.offset);
        const offsetDelta = specs.oeOffset !== null && offset !== null ? offset - specs.oeOffset : 0;
        const widthDelta = specs.oeWidth && parsedSize.width ? ((parsedSize.width - specs.oeWidth) * 25.4) / 2 : 0;
        const outerChange = Math.round(widthDelta - offsetDelta);
        const innerChange = Math.round(widthDelta + offsetDelta);
        const diameterDelta = specs.oeDiameter && parsedSize.diameter ? parsedSize.diameter - specs.oeDiameter : 0;

        const warnings = [];
        if (Math.abs(offsetDelta) > limits.offset) warnings.push('offset check');
        if (outerChange > limits.outer) warnings.push('poke/rub check');
        if (innerChange > limits.inner) warnings.push('inner clearance check');
        if (Math.abs(diameterDelta) > 2) warnings.push('tire sizing check');

        const price = getWheelPrice(wheelId, size);
        const score = 100
          - Math.min(35, Math.abs(offsetDelta || 0))
          - Math.min(25, Math.max(0, outerChange - limits.outer))
          - Math.min(25, Math.max(0, innerChange - limits.inner))
          - warnings.length * 4;

        matches.push({
          wheelId,
          name: wheel.name,
          size,
          bolt: config.bolt,
          offset: config.offset,
          cb: config.cb,
          image: getWheelDisplayImage(wheel, wheelId, size, getVariantData(wheel, size).finishes?.[0] || ''),
          price,
          score,
          warnings
        });
      });
    });
  });

  const byKey = new Map();
  matches
    .sort((a, b) => b.score - a.score)
    .forEach(match => {
      const key = `${match.wheelId}-${match.size}`;
      if (!byKey.has(key)) byKey.set(key, match);
    });

  return [...byKey.values()].slice(0, 12);
}

function renderFinderResults(record, goal) {
  const resultsEl = document.getElementById('finderResults');
  if (!resultsEl) return;

  const specs = getVehicleSpecs(record);
  const matches = getFinderMatches(specs, goal);
  if (window.fwTrack) window.fwTrack('fitment_search', {
    meta: {
      vehicle: [record && record.make, record && record.model, record && record.year].filter(Boolean).join(' '),
      goal: goal || null,
      results: matches.length
    }
  });
  finderState.lastVehicleSpecs = specs;
  finderState.lastWheelSelection = matches[0] ? {
    wheelId: matches[0].wheelId,
    name: matches[0].name,
    size: matches[0].size,
    bolt: matches[0].bolt,
    cb: matches[0].cb,
    thread: specs.thread || ''
  } : null;
  updateAccessoryFitmentNote();

  resultsEl.innerHTML = `
    <div class="vehicle-spec-card">
      <h3>${specs.label || 'Vehicle Specs'}</h3>
      <div class="spec-list">
        <div><span>Bolt Pattern</span>${specs.boltPattern || 'N/A'}</div>
        <div><span>Center Bore</span>${specs.centerBore ? `${specs.centerBore}mm` : 'N/A'}</div>
        <div><span>OE Wheel</span>${specs.oeWidth && specs.oeDiameter ? `${specs.oeDiameter}x${specs.oeWidth} ET${specs.oeOffset}` : 'N/A'}</div>
        <div><span>OE Tire</span>${specs.oeTire || 'N/A'}</div>
        <div><span>Thread</span>${[specs.fastenerType, specs.thread].filter(Boolean).join(' ') || 'N/A'}</div>
        <div><span>Torque</span>${specs.torque || 'N/A'}</div>
      </div>
    </div>
    <div class="match-list">
      ${matches.length ? matches.map(match => `
        <div class="match-card">
          <img src="${match.image}" alt="${match.name}" loading="lazy">
          <div>
            <h3>${match.name}</h3>
            <p class="match-meta">${match.size} · ${match.bolt} · ${match.offset} · ${match.cb}mm CB${match.price ? ` · From $${match.price}` : ''}</p>
            <div class="match-tags">
              <span>Bolt match</span>
              <span>Hub bore OK</span>
              <span>${Math.max(0, Math.round(match.score))}% fit score</span>
            </div>
            ${match.warnings.length ? `<p class="match-warning">${match.warnings.join(' · ')}</p>` : ''}
            <button class="btn btn-outline finder-wheel-btn" data-wheel="${match.wheelId}" data-size="${match.size}" data-bolt="${match.bolt}" data-offset="${match.offset}" data-cb="${match.cb}" type="button">View Wheel</button>
          </div>
        </div>
      `).join('') : `
        <div class="finder-empty">
          <strong>No direct catalog match</strong>
          <span>Text us the vehicle and goal so we can check special order options.</span>
        </div>
      `}
    </div>
  `;

  resultsEl.querySelectorAll('.finder-wheel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      finderState.lastWheelSelection = {
        wheelId: btn.dataset.wheel,
        name: wheelData[btn.dataset.wheel]?.name || '',
        size: btn.dataset.size || '',
        bolt: btn.dataset.bolt || '',
        cb: btn.dataset.cb || '',
        thread: finderState.lastVehicleSpecs?.thread || ''
      };
      updateAccessoryFitmentNote();
      openWheelModal(btn.dataset.wheel, {
        size: btn.dataset.size,
        bolt: btn.dataset.bolt,
        offset: btn.dataset.offset,
        cb: btn.dataset.cb
      });
    });
  });
}

async function initVehicleFinder() {
  const form = document.getElementById('vehicleFinderForm');
  if (!form) return;

  const yearSelect = document.getElementById('finderYear');
  const makeSelect = document.getElementById('finderMake');
  const modelSelect = document.getElementById('finderModel');
  const modSelect = document.getElementById('finderModification');
  const goalSelect = document.getElementById('finderGoal');

  try {
    setFinderStatus('Loading vehicle years...');
    finderState.years = await fetchFitment('years', { ordering: '-slug' });
    setFinderSelect(yearSelect, finderState.years, 'Select year');
    setFinderStatus('Select your vehicle to find matching wheels.', 'ready');
  } catch (err) {
    setFinderStatus(err.message, 'error');
    return;
  }

  yearSelect.addEventListener('change', async () => {
    setFinderSelect(makeSelect, [], 'Select make');
    setFinderSelect(modelSelect, [], 'Select model');
    setFinderSelect(modSelect, [], 'Select trim');
    if (!yearSelect.value) return;
    try {
      setFinderStatus('Loading makes...');
      finderState.makes = await fetchFitment('makes', { year: yearSelect.value, ordering: 'slug' });
      setFinderSelect(makeSelect, finderState.makes, 'Select make');
      setFinderStatus('Choose a make.', 'ready');
    } catch (err) {
      setFinderStatus(err.message, 'error');
    }
  });

  makeSelect.addEventListener('change', async () => {
    setFinderSelect(modelSelect, [], 'Select model');
    setFinderSelect(modSelect, [], 'Select trim');
    if (!makeSelect.value) return;
    try {
      setFinderStatus('Loading models...');
      finderState.models = await fetchFitment('models', {
        year: yearSelect.value,
        make: makeSelect.value,
        ordering: 'slug'
      });
      setFinderSelect(modelSelect, finderState.models, 'Select model');
      setFinderStatus('Choose a model.', 'ready');
    } catch (err) {
      setFinderStatus(err.message, 'error');
    }
  });

  modelSelect.addEventListener('change', async () => {
    setFinderSelect(modSelect, [], 'Select trim');
    if (!modelSelect.value) return;
    try {
      setFinderStatus('Loading trims...');
      finderState.modifications = await fetchFitment('modifications', {
        year: yearSelect.value,
        make: makeSelect.value,
        model: modelSelect.value,
        ordering: 'trim'
      });
      const trimItems = finderState.modifications.map(item => ({
        slug: item.slug,
        name: [item.trim || item.name, item.body, item.engine?.fuel].filter(Boolean).join(' · ') || item.slug
      }));
      setFinderSelect(modSelect, trimItems, 'Select trim');
      modSelect.disabled = !trimItems.length;
      setFinderStatus(trimItems.length ? 'Choose a trim, then find wheels.' : 'No trim split found. You can search this model now.', 'ready');
    } catch (err) {
      setFinderStatus(err.message, 'error');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!yearSelect.value || !makeSelect.value || !modelSelect.value) return;
    try {
      setFinderStatus('Checking fitment data...');
      const records = await fetchFitment('search', {
        year: yearSelect.value,
        make: makeSelect.value,
        model: modelSelect.value,
        modification: modSelect.value,
        limit: 24
      });
      if (!records.length) throw new Error('No fitment record found for that vehicle.');
      const selected = modSelect.value
        ? records.find(record => record.slug === modSelect.value) || records[0]
        : records[0];
      renderFinderResults(selected, goalSelect.value);
      setFinderStatus('Matches loaded. Verify tire size and final clearance before ordering.', 'ready');
    } catch (err) {
      setFinderStatus(err.message, 'error');
    }
  });
}

// ===== CART WIRE-UP =====
document.addEventListener('DOMContentLoaded', () => {
  // Cart icon click
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  // Cart close
  const cartClose = document.getElementById('cartClose');
  if (cartClose) cartClose.addEventListener('click', closeCart);
  const cartBackdrop = document.getElementById('cartBackdrop');
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Checkout button
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', startCheckout);

  // Initial badge count
  updateCartBadge();
  initAccessories();
  initVehicleFinder();
});

// "Don't Forget" CTA → jump to the real accessory section
const dontForgetCtaBtn = document.getElementById('dontForgetCta');
if (dontForgetCtaBtn) {
  dontForgetCtaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeDontForget();
    setTimeout(() => {
      document.getElementById('accessories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#accessories');
    }, 250);
  });
}
