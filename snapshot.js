'use strict';
// snapshot.js — Ambil foto dengan countdown

let photoCount   = 4;
window.rawPhotos = [];

window.addEventListener('DOMContentLoaded', () => {

  // Strip count pills
  document.querySelectorAll('#countGroup .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#countGroup .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      photoCount = parseInt(btn.dataset.count);
      setStatus(`Strip set to ${photoCount} photos`);
    });
  });

  document.getElementById('shootBtn').addEventListener('click', () => {
    if (window.currentMode === 'gif') return; // handled by gif-capture.js
    startPhotoSession();
  });
});

async function startPhotoSession() {
  const btn = document.getElementById('shootBtn');
  btn.disabled = true;
  window.rawPhotos = [];
  resetResultPanels();
  setStepActive(1);

  const counter = document.getElementById('shotCounter');
  counter.style.display = 'block';

  for (let i = 0; i < photoCount; i++) {
    counter.textContent = `${i + 1} / ${photoCount}`;
    setStatus(`Photo ${i + 1} of ${photoCount} — smile!`);
    await runCountdown(3);
    window.rawPhotos.push(captureRawFrame());
    flashScreen();
    setStatus(`✓ Photo ${i + 1} captured`);
    await sleep(500);
  }

  counter.style.display = 'none';
  setStatus('Photos done! Choose your filter →');

  buildStrip(window.rawPhotos, 'none', () => {
    document.getElementById('stripCanvas').style.display = 'block';
    document.getElementById('stripPlaceholder').style.display = 'none';
    switchToPanel('panelFilter');
    setStepActive(2);
    buildFilterThumbnails(window.rawPhotos);
  });

  btn.disabled = false;
}

function captureRawFrame() {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('snapCanvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'none';
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.9);
}
window.captureRawFrame = captureRawFrame;

function runCountdown(secs) {
  return new Promise(resolve => {
    const ov = document.getElementById('countdownDisplay');
    let n = secs;
    function tick() {
      ov.textContent = n;
      ov.classList.add('show');
      if (n === 0) { ov.textContent = ''; ov.classList.remove('show'); resolve(); return; }
      n--;
      setTimeout(tick, 900);
    }
    tick();
  });
}
window.runCountdown = runCountdown;

function resetResultPanels() {
  ['panelFilter','panelFrame','panelExport'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('panelRaw').style.display = 'block';
  document.getElementById('stripPlaceholder').style.display = 'flex';
  document.getElementById('stripCanvas').style.display = 'none';
}
window.resetResultPanels = resetResultPanels;

function switchToPanel(id) {
  ['panelRaw','panelFilter','panelFrame','panelExport'].forEach(p => {
    document.getElementById(p).style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}
window.switchToPanel = switchToPanel;