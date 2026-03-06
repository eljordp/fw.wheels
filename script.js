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
      '19x9.5': { finishes: ['Gloss Black', 'Hyper Black w/ Machined Lip', 'Silver w/ Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+12', '+22', '+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/files/AH02_1995_SML_03.jpg?width=800'}
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
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1790_BRZ_03_ed0915fe-14b1-4289-8a92-cfb5977428dc.jpg?v=1749494698&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AH06_1890_BRZ_03_0b441f17-3a38-44d3-96bb-b8ddf4fc1635.jpg?v=1749494698&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1790_GB_03.jpg?width=800'},
      '18x10': { finishes: ['Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x114.3'], offsets: ['+25'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1810_GB_03.jpg?width=800'},
      '18x9': { finishes: ['Matte Black', 'Matte Gray', 'Textured Bronze'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH06_1890_GB_03.jpg?width=800'}
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
      '18x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x100', '5x108', '5x112', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1885_MS_D_03.jpg?width=800'},
      '18x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AH09_1895_MS_D_03.jpg?width=800'}
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
      'https://www.aodhanwheels.com/cdn/shop/products/AFF03_2090_MS_03.jpg?v=1749494576&width=800',
      'https://www.aodhanwheels.com/cdn/shop/products/AFF03_20105_MS_03.jpg?v=1749494576&width=800'
    ],
    variants: {
      '20x10.5': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+35', '+45'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF03_20105_MS_03.jpg?width=800'},
      '20x9': { finishes: ['Matte Black', 'Matte Bronze', 'Silver Machined Face'], boltPatterns: ['5x114.3', '5x120'], offsets: ['+30', '+32'], image: 'https://cdn.shopify.com/s/files/1/0037/3194/7631/products/AFF03_2090_MS_03.jpg?width=800'}
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
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-hyper-black-unleashedwheels.jpg?v=1724878850&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr1-matte-bronze-unleashedwheels.jpg?v=1724879474&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x100', '5x112', '5x114.3'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35', '+38'] },
      '20x8.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Hyper Black', 'Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'] }
    }
  },
  mfr2: {
    name: 'MFLOW MFR2',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-black-unleashedwheels.jpg?v=1724881053&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr2-matte-bronze-unleashedwheels.jpg?v=1724884011&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'] },
      '20x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x112', '5x114.3'], offsets: ['+35', '+38'] }
    }
  },
  mfr3: {
    name: 'MFLOW MFR3',
    series: 'MFR Series — Flow Form',
    centerBore: '73.1mm',
    priceRange: '$212 – $237 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-gloss-black-unleashedwheels.jpg?v=1724886960&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfr3-hyper-silver-unleashedwheels.jpg?v=1724884908&width=800'
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
    priceRange: '$212 – $274 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-black-unleashedwheels.jpg?v=1743713898&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-racing-mfr4-matte-bronze-unleashedwheels.jpg?v=1743711412&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Matte Black Machine Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Matte Black Machine Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Matte Black Machine Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'] }
    }
  },
  // MFL Series
  mfl1: {
    name: 'MFLOW MFL1',
    series: 'MFL Series — Flow Forming',
    centerBore: '73.1mm',
    priceRange: '$212 – $324 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-chrome-unleashedwheels.jpg?v=1725407132&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl1-matte-black-machined-lip.jpg?v=1725060775&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '19x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30', '+35', '+38'] },
      '20x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'] }
    }
  },
  mfl2: {
    name: 'MFLOW MFL2',
    series: 'MFL Series — Flow Forming',
    centerBore: '73.1mm',
    priceRange: '$212 – $324 /wheel',
    images: [
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-chrome-unleashedwheels.jpg?v=1725491264&width=800',
      'https://unleashedwheels.com/cdn/shop/files/mflow-mfl2-matte-bronze-unleashedwheels.jpg?v=1725490367&width=800'
    ],
    variants: {
      '18x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'] },
      '18x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30', '+35'] },
      '19x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+30', '+38'] },
      '20x8.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35'] },
      '20x9.5': { finishes: ['Chrome', 'Matte Black Machined Lip', 'Matte Bronze Machined Lip'], boltPatterns: ['5x112', '5x114.3', '5x120'], offsets: ['+35', '+38'] }
    }
  },
  // MF Series (Offroad)
  mf01: {
    name: 'MFLOW MF01',
    series: 'MF Series — Offroad',
    centerBore: '71.5mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML1-Matte-Bronze-Wheels-Rims_3ad8bf49-f08a-49bb-9302-06533e4b7df0.jpg?v=1760723096&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x127'], offsets: ['-12', '+12'] }
    }
  },
  mf02: {
    name: 'MFLOW MF02',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML2-Matte-Bronze-Wheels-Rims_fb68a9cd-c705-430c-8528-82482fadc791.jpg?v=1760723100&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x127', '6x135', '6x139.7'], offsets: ['-12', '+0', '+12'] }
    }
  },
  mf03: {
    name: 'MFLOW MF03',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML3-Matte-Bronze-Wheels-Rims_cbb74392-f31f-4e29-a763-a3baa6144e46.jpg?v=1760723105&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['6x135', '6x139.7'], offsets: ['-12', '+0'] }
    }
  },
  mf04: {
    name: 'MFLOW MF04',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML4-Matte-Bronze-Wheels-Rims_11ea4bd5-2319-4dac-99cf-e21577708852.jpg?v=1760723110&width=800'
    ],
    variants: {
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x127', '6x127', '6x135', '6x139.7'], offsets: ['-12', '+0', '+12'] }
    }
  },
  mf05: {
    name: 'MFLOW MF05',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML5-Matte-Bronze-Wheels-Rims_1169e107-97e2-4715-aa91-370bbd559acc.jpg?v=1760723116&width=800'
    ],
    variants: {
      '17x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['6x139.7'], offsets: ['+0', '+5', '+25'] },
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['5x127', '6x135', '6x139.7'], offsets: ['-12', '+12'] }
    }
  },
  mf06: {
    name: 'MFLOW MF06',
    series: 'MF Series — Offroad',
    centerBore: '106.1mm',
    priceRange: '$199 /wheel',
    images: [
      'https://wheelplususa.com/cdn/shop/files/ML6-Matte-Bronze-Wheels-Rims_703504bc-3243-4c2f-9474-de40328a625c.jpg?v=1760723123&width=800'
    ],
    variants: {
      '17x8.5': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['6x139.7'], offsets: ['+0', '+5', '+25'] },
      '17x9': { finishes: ['Matte Black', 'Matte Bronze'], boltPatterns: ['6x135', '6x139.7'], offsets: ['-12'] }
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
      'https://www.vorswheels.com/cdn/shop/files/TR4_18X95_HB_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/TR4_18X95_BK_1.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_17X8_SILVER.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_17X9_HB_1.jpg?width=800'},
      '18x10.5': { finishes: ['Black', 'Hyper Black', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X105_BK_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X85_HB.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x100', '5x114.3'], offsets: ['+22', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_18X95_HB_8446ef59-62df-4edc-b33d-6f6db88dfbaa.jpg?width=800'},
      '19x10.5': { finishes: ['Black', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X105_GLOSS_BLACK_bb0d763c-2c8d-4e6c-8822-de430178cce8.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X85_BK_1.jpg?width=800'},
      '19x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x114.3'], offsets: ['+22', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR4_19X95_HB_1.jpg?width=800'},
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
      'https://www.vorswheels.com/cdn/shop/files/TR14_18X85_BK_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/TR14_18X85_S_1.jpg?width=800'
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
      'https://www.vorswheels.com/cdn/shop/files/TR37_18X95_WHITE.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/TR37_19X85_BLACK.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_17X8_BR_1.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_17X9_W_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X85_HB.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_18X95_HB.jpg?width=800'},
      '19x8.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_19X85_W_1.jpg?width=800'},
      '19x9.5': { finishes: ['Black', 'Bronze', 'Hyper Black', 'Silver Machined', 'White'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/TR37_19X95_BR_1.jpg?width=800'}
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
      '19x9.5': { finishes: ['Gloss Black', 'Hyper Black', 'Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+22', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/VR8_19X95_S_1.jpg?width=800'},
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
      'https://www.vorswheels.com/cdn/shop/files/AR5_17X9_BR_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/AR05_18X85_SILVER_STD.jpg?width=800'
    ],
    variants: {
      '17x8': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X8_BK_1.jpg?width=800'},
      '17x9': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR5_17X9_BK_1.jpg?width=800'},
      '18x8.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR05_18X85_SILVER_STD.jpg?width=800'},
      '18x9.5': { finishes: ['Black', 'Bronze', 'Silver Machined'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+30'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/AR05_18x95_SILVER_STD_400179be-62a3-4ca6-9796-4f0ec060c171.jpg?width=800'},
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
      'https://www.vorswheels.com/cdn/shop/files/SP1_18X9_HB_ML.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/SP1_18X9_WHITE_1.jpg?width=800'
    ],
    variants: {
      '15x7': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100', '4x108'], offsets: ['+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_15X7_HB_1.jpg?width=800'},
      '15x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_15X8_HB_ML.jpg?width=800'},
      '16x7': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+38'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_16X7_HB_1.jpg?width=800'},
      '16x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108'], offsets: ['+20'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_16X8_WHITE_1.jpg?width=800'},
      '17x8': { finishes: ['Hyper Black', 'Matte Black', 'Silver Machined', 'White'], boltPatterns: ['4x100/114.3', '4x108', '5x100/114.3', '5x105', '5x108', '5x110', '5x112', '5x115', '5x120'], offsets: ['+30', '+35'], image: 'https://cdn.shopify.com/s/files/1/0859/3725/8814/files/SP1_17X8_8H_HBML_1.jpg?width=800'},
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
      'https://www.vorswheels.com/cdn/shop/files/UO2_19X85_BK_1.jpg?width=800',
      'https://www.vorswheels.com/cdn/shop/files/UO2_19X85_HS_1.jpg?width=800'
    ],
    variants: {
      '19x8.5': { finishes: ['Black', 'Hyper Silver'], boltPatterns: ['5x108', '5x110', '5x112', '5x114.3', '5x115', '5x120'], offsets: ['+35'] },
      '19x9.5': { finishes: ['Black', 'Hyper Silver'], boltPatterns: ['5x114.3'], offsets: ['+40'] }
    }
  }
};

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

  const sizes = getWheelSizes(wheel);
  const defaultSize = sizes[0];

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
      <div class="spec-label">Select Size</div>
      <div class="spec-chips" id="sizeSelector">
        ${sizes.map((s, i) =>
          `<button class="spec-chip spec-chip--selectable${i === 0 ? ' spec-chip--active' : ''}" data-size="${s}" data-wheel="${wheelId}">${s}</button>`
        ).join('')}
      </div>
    </div>
    <div id="dynamicSpecs"></div>
    <div class="spec-group">
      <div class="spec-label">Center Bore</div>
      <div class="spec-value">${wheel.centerBore}</div>
    </div>
  `;

  // Attach size selector click handlers
  document.querySelectorAll('#sizeSelector .spec-chip--selectable').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#sizeSelector .spec-chip--selectable').forEach(b => b.classList.remove('spec-chip--active'));
      btn.classList.add('spec-chip--active');
      updateModalVariant(btn.dataset.wheel, btn.dataset.size);
    });
  });

  updateModalVariant(wheelId, defaultSize);

  wheelModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateModalVariant(wheelId, size) {
  const wheel = wheelData[wheelId];
  const variant = getVariantData(wheel, size);

  const dynamicSpecs = document.getElementById('dynamicSpecs');
  dynamicSpecs.innerHTML = `
    <div class="spec-group">
      <div class="spec-label">Available Finishes</div>
      <div class="spec-chips">${variant.finishes.map(f => `<span class="spec-chip">${f}</span>`).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Bolt Patterns</div>
      <div class="spec-chips">${variant.boltPatterns.map(b => {
        const dual = b.includes('/');
        return `<span class="spec-chip${dual ? ' spec-chip--dual' : ''}">${b}</span>`;
      }).join('')}</div>
    </div>
    <div class="spec-group">
      <div class="spec-label">Offsets</div>
      <div class="spec-chips">${variant.offsets.map(o => `<span class="spec-chip">${o}</span>`).join('')}</div>
    </div>
  `;

  // Update image
  if (variant.image) {
    modalImages.innerHTML = `<img decoding="async" src="${variant.image}" alt="${wheel.name} ${size}" loading="lazy">`;
  } else if (wheel.images) {
    modalImages.innerHTML = wheel.images.map(src =>
      `<img decoding="async" src="${src}" alt="${wheel.name}" loading="lazy">`
    ).join('');
  }
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

// ===== CARD PRICES & SWATCHES =====
const finishColors = {
  'Silver Machined Face': '#c0c0c0',
  'Machined Silver': '#b8b8b8',
  'Silver Machined Lip': '#c8c8c8',
  'Gloss Black': '#1a1a1a',
  'Matte Black': '#2d2d2d',
  'Hyper Black': '#4a4a4a',
  'Bronze': '#8b6914',
  'Matte Bronze': '#7a5c12',
  'Bronze Machined Lip': '#8b6914',
  'Matte Bronze Machined Lip': '#7a5c12',
  'Chrome': '#e0e0e0',
  'PVD Chrome': '#dcdcdc',
  'Gunmetal': '#6b6b6b',
  'Gold Machined Face': '#c9952c',
  'Vacuum Gold Chrome': '#c9952c',
  'Matte Black Machined Lip': '#2d2d2d',
  'Silver': '#c0c0c0',
  'Hyper Silver': '#b0b0b0',
  'Satin Silver': '#aaa',
  'Machined Gold': '#c9952c',
  'White': '#f0f0f0',
  'Matte Bronze Machined Tip': '#7a5c12',
  'Matte Black Machined Tip': '#2d2d2d',
  'Matte Black Machine Lip': '#2d2d2d',
  'Gloss Black Machined Face': '#1a1a1a',
  'Satin Black': '#333',
};

function getFinishColor(finish) {
  if (finishColors[finish]) return finishColors[finish];
  const lower = finish.toLowerCase();
  if (lower.includes('silver') || lower.includes('machined') || lower.includes('chrome')) return '#c0c0c0';
  if (lower.includes('black')) return '#2d2d2d';
  if (lower.includes('bronze')) return '#8b6914';
  if (lower.includes('gold')) return '#c9952c';
  if (lower.includes('gunmetal') || lower.includes('gun metal')) return '#6b6b6b';
  if (lower.includes('white')) return '#f0f0f0';
  return '#999';
}

// Map image URL to likely finish names
function guessFinishFromUrl(url) {
  const l = url.toLowerCase();
  if (l.includes('_smf_') || l.includes('_sml_') || l.includes('silver-machined') || (l.includes('_silver_') && !l.includes('hyper'))) return ['Silver Machined Face', 'Silver Machined Lip', 'Silver'];
  if (l.includes('_ms_') || l.includes('machined-silver')) return ['Machined Silver'];
  if (l.includes('_gb_') || l.includes('gloss-black')) return ['Gloss Black', 'Gloss Black Machined Face'];
  if (l.includes('_brz_') || l.includes('_brzml_')) return ['Bronze', 'Bronze Machined Lip'];
  if (l.includes('_hb_') || l.includes('_hblk_') || l.includes('hyper-black')) return ['Hyper Black'];
  if (l.includes('_mg_')) return ['Machined Gold', 'Machined Grey'];
  if (l.includes('_gmf_')) return ['Gold Machined Face'];
  if (l.includes('_gsmf_')) return ['Gloss Silver Machined Face'];
  if (l.includes('matte-bronze') || l.includes('matte_bronze')) return ['Matte Bronze', 'Matte Bronze Machined Lip', 'Matte Bronze Machined Tip'];
  if (l.includes('matte-black') || l.includes('matte_black') || l.includes('_bk_') || (l.includes('-black-') && !l.includes('hyper') && !l.includes('gloss'))) return ['Matte Black', 'Matte Black Machined Lip', 'Matte Black Machined Tip', 'Black', 'Satin Black'];
  if (l.includes('hyper-silver')) return ['Hyper Silver'];
  if (l.includes('-chrome') || l.includes('_chrome')) return ['Chrome', 'PVD Chrome'];
  if (l.includes('_gm_') || l.includes('gunmetal')) return ['Gunmetal'];
  if (l.includes('_w_') || l.includes('-white')) return ['White'];
  if (l.includes('_vgc_') || l.includes('vacuum-gold')) return ['Vacuum Gold Chrome'];
  if (l.includes('_s_') || l.includes('-silver') || l.includes('_silver')) return ['Silver', 'Satin Silver'];
  if (l.includes('_mbr_')) return ['Matte Bronze'];
  if (l.includes('_br_')) return ['Bronze'];
  return [];
}

// Build finish→image map for a wheel
function buildFinishImageMap(wheel) {
  const map = {};
  if (!wheel.images) return map;
  wheel.images.forEach(url => {
    const matched = guessFinishFromUrl(url);
    matched.forEach(f => { if (!map[f]) map[f] = url; });
  });
  return map;
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
      if (v.finishes) v.finishes.forEach(f => finishes.add(f));
    });
  } else if (wheel.finishes) {
    wheel.finishes.forEach(f => finishes.add(f));
  }

  const finishImgMap = buildFinishImageMap(wheel);
  const cardImg = card.querySelector('.wheel-img-wrap img');
  const originalSrc = cardImg ? cardImg.src : '';

  const arr = [...finishes];
  const maxShow = 4;
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
      if (cardImg && finishImgMap[f]) {
        cardImg.src = finishImgMap[f].replace('width=800', 'width=400');
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
