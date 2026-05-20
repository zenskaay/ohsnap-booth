'use strict';
// frame.js — Pilih dan terapkan frame photobooth

const FRAMES = {
  none:    { label: 'Clean',    draw: (c,w,h) => {} },
  neon:    { label: 'Neon',     draw: drawNeon    },
  film:    { label: 'Film',     draw: drawFilm    },
  minimal: { label: 'Minimal',  draw: drawMinimal },
  grid:    { label: 'Grid',     draw: drawGrid    },
  retro:   { label: 'Retro',    draw: drawRetro   },
};

let selectedFrame = 'none';

function buildFrameThumbnails() {
  const grid = document.getElementById('frameGrid');
  grid.innerHTML = '';

  Object.keys(FRAMES).forEach(name => {
    const card  = document.createElement('div');
    card.className = 'frame-card' + (name === 'none' ? ' active' : '');
    card.dataset.frame = name;

    const thumb = document.createElement('canvas');
    thumb.className = 'frame-thumb';
    thumb.width = 90; thumb.height = 120;
    drawFrameThumb(thumb, name);

    const lbl = document.createElement('span');
    lbl.textContent = FRAMES[name].label;

    card.append(thumb, lbl);
    card.addEventListener('click', () => {
      document.querySelectorAll('.frame-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedFrame = name;
    });
    grid.appendChild(card);
  });
}
window.buildFrameThumbnails = buildFrameThumbnails;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backToFilterBtn').addEventListener('click', () => {
    switchToPanel('panelFilter');
    setStepActive(2);
  });

  document.getElementById('applyFrameBtn').addEventListener('click', () => {
    applyFrame(selectedFrame, () => {
      switchToPanel('panelExport');
      setStepActive(4);
      document.getElementById('finalCanvas').style.display = 'block';
      document.getElementById('gifPreview').style.display  = 'none';
      document.getElementById('downloadPngBtn').style.display = 'block';
      document.getElementById('downloadGifBtn').style.display = 'none';
    });
  });
});

function applyFrame(name, callback) {
  const src   = document.getElementById('stripCanvas');
  const final = document.getElementById('finalCanvas');
  const ctx   = final.getContext('2d');
  final.width  = src.width;
  final.height = src.height;
  ctx.drawImage(src, 0, 0);
  if (name !== 'none') FRAMES[name].draw(ctx, final.width, final.height);
  window.finalDataURL = final.toDataURL('image/png');
  if (callback) callback();
}

// ---- FRAME DESIGNS ----

function drawNeon(ctx, w, h) {
  const bw = 12;
  ctx.shadowColor = '#f0e040';
  ctx.shadowBlur  = 18;
  ctx.strokeStyle = '#f0e040';
  ctx.lineWidth   = bw;
  ctx.strokeRect(bw/2, bw/2, w-bw, h-bw);
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(bw+4, bw+4, w-(bw+4)*2, h-(bw+4)*2);
}

function drawFilm(ctx, w, h) {
  const bw = 24;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, bw);
  ctx.fillRect(0, h-bw, w, bw);
  ctx.fillRect(0, 0, bw, h);
  ctx.fillRect(w-bw, 0, bw, h);

  // Film perforations
  ctx.fillStyle = '#333';
  for (let x = bw + 8; x < w - bw; x += 20) {
    roundRectFill(ctx, x, 4, 10, bw-8, 3);
    roundRectFill(ctx, x, h-bw+4, 10, bw-8, 3);
  }
  // Side holes
  for (let y = bw + 8; y < h - bw; y += 20) {
    roundRectFill(ctx, 4, y, bw-8, 10, 3);
    roundRectFill(ctx, w-bw+4, y, bw-8, 10, 3);
  }

  ctx.fillStyle = '#f0e040';
  ctx.font = 'bold 9px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('OhSnap', w/2, bw/2);
  ctx.fillText('35mm', w/2, h - bw/2);
}

function drawMinimal(ctx, w, h) {
  const m = 10, c = 22;
  ctx.strokeStyle = '#f0e040';
  ctx.lineWidth   = 1.5;
  [[m,m,c,0], [w-m,m,0,c], [m,h-m,-0,c], [w-m,h-m,0,-c]].forEach(([x,y,dx,dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y+dy); ctx.lineTo(x, y); ctx.lineTo(x+dx, y);
    ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(240,224,64,0.2)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(m+6, m+6, w-(m+6)*2, h-(m+6)*2);
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(240,224,64,0.15)';
  ctx.lineWidth   = 1;
  const step = 40;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  // Border
  ctx.strokeStyle = '#f0e040';
  ctx.lineWidth   = 3;
  ctx.strokeRect(2, 2, w-4, h-4);
}

function drawRetro(ctx, w, h) {
  const bw = 18;
  // Checkerboard border corners
  ctx.fillStyle = '#f0e040';
  for (let x = 0; x < w; x += 12) {
    const row1 = Math.floor(x / 12) % 2 === 0;
    if (row1) { ctx.fillRect(x, 0, 12, bw); ctx.fillRect(x, h-bw, 12, bw); }
  }
  for (let y = 0; y < h; y += 12) {
    const col1 = Math.floor(y / 12) % 2 === 0;
    if (col1) { ctx.fillRect(0, y, bw, 12); ctx.fillRect(w-bw, y, bw, 12); }
  }
  ctx.strokeStyle = '#f0e040';
  ctx.lineWidth   = 2;
  ctx.strokeRect(bw+3, bw+3, w-(bw+3)*2, h-(bw+3)*2);
}

// --- Thumbnail ---
function drawFrameThumb(canvas, name) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.scale(w/400, h/560);
  FRAMES[name].draw(ctx, 400, 560);
  ctx.restore();
}

function roundRectFill(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath(); ctx.fill();
}