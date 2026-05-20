'use strict';
// gif-capture.js — Record GIF from webcam using gif.js

let gifDuration = 2;   // seconds
let gifFps      = 10;  // frames per second
let isRecording = false;

window.addEventListener('DOMContentLoaded', () => {

  // Duration pills
  document.querySelectorAll('#gifDurGroup .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#gifDurGroup .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gifDuration = parseInt(btn.dataset.dur);
    });
  });

  // FPS pills (the second pill-group inside gifOptions)
  const fpsGroup = document.querySelectorAll('#gifOptions .pill-group')[1];
  if (fpsGroup) {
    fpsGroup.querySelectorAll('.pill').forEach(btn => {
      btn.addEventListener('click', () => {
        fpsGroup.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gifFps = parseInt(btn.dataset.fps);
      });
    });
  }

  document.getElementById('shootBtn').addEventListener('click', () => {
    if (window.currentMode !== 'gif') return;
    if (isRecording) return;
    startGifCapture();
  });
});

async function startGifCapture() {
  const btn = document.getElementById('shootBtn');
  btn.disabled = true;
  isRecording  = true;
  resetResultPanels();
  setStepActive(1);

  const video      = document.getElementById('video');
  const snapCanvas = document.getElementById('snapCanvas');
  const totalFrames = gifDuration * gifFps;
  const frameDelay  = Math.round(1000 / gifFps);

  snapCanvas.width  = 480;
  snapCanvas.height = 360;
  const ctx = snapCanvas.getContext('2d');

  // Show progress bar
  let progressWrap = document.getElementById('gifProgressWrap');
  if (!progressWrap) {
    progressWrap = document.createElement('div');
    progressWrap.id = 'gifProgressWrap';
    progressWrap.className = 'gif-progress';
    progressWrap.innerHTML = '<div class="gif-progress-bar" id="gifProgressBar"></div>';
    document.querySelector('.status-bar').after(progressWrap);
  }
  progressWrap.style.display = 'block';
  const progressBar = document.getElementById('gifProgressBar');

  // Countdown before recording
  setStatus('Get ready...');
  await runCountdown(3);

  setStatus(`Recording GIF — ${gifDuration}s ●`);

  // Capture frames
  const frames = [];
  for (let i = 0; i < totalFrames; i++) {
    ctx.save();
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    ctx.restore();
    frames.push(snapCanvas.toDataURL('image/jpeg', 0.85));
    progressBar.style.width = `${((i + 1) / totalFrames) * 50}%`;
    await sleep(frameDelay);
  }

  setStatus('Encoding GIF... please wait ⚙');

  // Encode GIF using gif.js
  encodeGif(frames, frameDelay, progressBar, (blob) => {
    const url = URL.createObjectURL(blob);
    window.gifBlob = blob;
    window.gifUrl  = url;

    // Show preview in export panel
    document.getElementById('gifPreview').src    = url;
    document.getElementById('gifPreview').style.display = 'block';
    document.getElementById('finalCanvas').style.display = 'none';

    progressWrap.style.display = 'none';
    switchToPanel('panelExport');
    setStepActive(4);

    // Show GIF download, hide PNG download
    document.getElementById('downloadPngBtn').style.display = 'none';
    document.getElementById('downloadGifBtn').style.display = 'block';

    setStatus('GIF ready! Download or share ✓');
    btn.disabled = false;
    isRecording  = false;
  });
}

function encodeGif(frames, frameDelay, progressBar, callback) {
  // Use gif.js library
  if (typeof GIF === 'undefined') {
    setStatus('⚠ GIF library not loaded. Check internet connection.');
    return;
  }

  const gif = new GIF({
    workers: 2,
    quality: 12,
    width:   480,
    height:  360,
    workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
  });

  let loaded = 0;
  frames.forEach(src => {
    const img = new Image();
    img.onload = () => {
      gif.addFrame(img, { delay: frameDelay, copy: true });
      loaded++;
      progressBar.style.width = `${50 + (loaded / frames.length) * 50}%`;
      if (loaded === frames.length) gif.render();
    };
    img.src = src;
  });

  gif.on('finished', blob => callback(blob));
  gif.on('progress', p => {
    progressBar.style.width = `${50 + p * 50}%`;
  });
}