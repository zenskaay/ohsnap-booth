'use strict';
// layout.js — Susun strip foto di canvas

const PHOTO_W  = 400;
const PHOTO_H  = 300;
const PAD      = 16;
const GAP      = 10;
const FOOTER_H = 60;

function buildStrip(photos, filterCSS, callback) {
  const canvas = document.getElementById('stripCanvas');
  const ctx    = canvas.getContext('2d');
  const count  = photos.length;

  const cols  = count <= 4 ? 1 : 2;
  const rows  = Math.ceil(count / cols);
  const stripW = cols * PHOTO_W + (cols + 1) * PAD;
  const stripH = rows * PHOTO_H + (rows + 1) * GAP + PAD * 2 + FOOTER_H;

  canvas.width  = stripW;
  canvas.height = stripH;

  // Background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, stripW, stripH);

  const promises = photos.map((src, i) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x   = PAD + col * (PHOTO_W + PAD);
      const y   = PAD + row * (PHOTO_H + GAP);

      ctx.save();
      roundRect(ctx, x, y, PHOTO_W, PHOTO_H, 8);
      ctx.clip();
      ctx.filter = (filterCSS && filterCSS !== 'none') ? filterCSS : 'none';
      ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
      ctx.filter = 'none';
      ctx.restore();

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, PHOTO_W, PHOTO_H, 8);
      ctx.stroke();

      // Badge
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath(); ctx.arc(x+16, y+16, 11, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0e040';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, x + 16, y + 16);

      resolve();
    };
    img.src = src;
  }));

  Promise.all(promises).then(() => {
    const fy = stripH - FOOTER_H;

    ctx.fillStyle = 'rgba(240,224,64,0.06)';
    ctx.fillRect(0, fy, stripW, FOOTER_H);

    ctx.strokeStyle = 'rgba(240,224,64,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, fy); ctx.lineTo(stripW - PAD, fy); ctx.stroke();

    ctx.fillStyle = '#f0e040';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('OhSnap Booth', stripW / 2, fy + 20);

    const date = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    ctx.fillStyle = '#606060';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(date, stripW / 2, fy + 40);

    window.stripDataURL = canvas.toDataURL('image/png');
    if (callback) callback();
  });
}
window.buildStrip = buildStrip;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
window.roundRect = roundRect;