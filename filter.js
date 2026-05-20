'use strict';
// filter.js — Filter dipilih SETELAH foto diambil

const FILTERS = {
  normal:    'none',
  grayscale: 'grayscale(1)',
  sepia:     'sepia(0.8)',
  vivid:     'saturate(2) contrast(1.15)',
  cool:      'hue-rotate(30deg) saturate(1.3) brightness(1.05)',
  warm:      'sepia(0.25) saturate(1.5) brightness(1.08)',
  bright:    'brightness(1.25) contrast(0.95)',
  drama:     'contrast(1.4) brightness(0.9) saturate(0.8)',
};

let selectedFilter = 'normal';

function buildFilterThumbnails(photos) {
  const grid  = document.getElementById('filterGrid');
  grid.innerHTML = '';
  const first = photos[0];

  Object.keys(FILTERS).forEach(name => {
    const card  = document.createElement('div');
    card.className = 'filter-card' + (name === 'normal' ? ' active' : '');
    card.dataset.filter = name;

    const thumb = document.createElement('canvas');
    thumb.className = 'filter-thumb';
    thumb.width = 120; thumb.height = 90;
    const ctx = thumb.getContext('2d');
    const img = new Image();
    img.onload = () => { ctx.filter = FILTERS[name]; ctx.drawImage(img, 0, 0, 120, 90); };
    img.src = first;

    const lbl = document.createElement('span');
    lbl.textContent = name;

    card.append(thumb, lbl);
    card.addEventListener('click', () => {
      document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedFilter = name;
    });
    grid.appendChild(card);
  });
}
window.buildFilterThumbnails = buildFilterThumbnails;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    buildStrip(window.rawPhotos, FILTERS[selectedFilter], () => {
      switchToPanel('panelFrame');
      setStepActive(3);
      buildFrameThumbnails();
    });
  });
});

function getCurrentFilterCSS() { return FILTERS[selectedFilter] || 'none'; }
window.getCurrentFilterCSS = getCurrentFilterCSS;