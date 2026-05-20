'use strict';
// camera.js — WebRTC getUserMedia

window.currentMode = 'photo'; // 'photo' | 'gif'

window.addEventListener('DOMContentLoaded', () => {
  // Start camera
  navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 1280 } } })
    .then(stream => {
      window.stream = stream;
      document.getElementById('video').srcObject = stream;
      setStatus('Camera ready — choose mode & shoot!');
    })
    .catch(err => {
      console.error(err);
      setStatus('⚠ Camera access denied. Please allow camera in browser.');
      document.getElementById('camBadge').textContent = '● OFFLINE';
      document.getElementById('camBadge').style.color = 'var(--red)';
    });

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      window.currentMode = tab.dataset.mode;
      document.getElementById('photoOptions').style.display = window.currentMode === 'photo' ? 'block' : 'none';
      document.getElementById('gifOptions').style.display   = window.currentMode === 'gif'   ? 'block' : 'none';
      document.getElementById('shootBtnLabel').textContent  = window.currentMode === 'photo' ? '📸 Start Shooting' : '🎞 Record GIF';
      setStatus(window.currentMode === 'photo' ? 'Photo mode — choose strip size & shoot!' : 'GIF mode — choose duration & record!');
    });
  });
});

function setStatus(msg) {
  const el = document.getElementById('statusMsg');
  if (el) el.textContent = msg;
}
window.setStatus = setStatus;

function setStepActive(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step${i}-ind`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < n)  el.classList.add('done');
    if (i === n) el.classList.add('active');
  }
}
window.setStepActive = setStepActive;

function flashScreen() {
  const div = document.createElement('div');
  div.className = 'flash-overlay';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 400);
}
window.flashScreen = flashScreen;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
window.sleep = sleep;