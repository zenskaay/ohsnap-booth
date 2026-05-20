'use strict';
// export.js — Download, Print, Email, Retake

// ⚠️ Ganti dengan EmailJS credentials kamu
const EMAILJS_PUBLIC_KEY  = 'GANTI_PUBLIC_KEY_KAMU';
const EMAILJS_SERVICE_ID  = 'GANTI_SERVICE_ID_KAMU';
const EMAILJS_TEMPLATE_ID = 'GANTI_TEMPLATE_ID_KAMU';

window.addEventListener('DOMContentLoaded', () => {

  // Init EmailJS (load via CDN if needed)
  const initEmailJS = () => {
    if (typeof emailjs !== 'undefined') {
      try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e){}
    }
  };
  setTimeout(initEmailJS, 1000);

  // Download PNG
  document.getElementById('downloadPngBtn').addEventListener('click', () => {
    const data = window.finalDataURL || window.stripDataURL;
    if (!data) return;
    const a = document.createElement('a');
    a.href = data; a.download = `ohsnap_${Date.now()}.png`; a.click();
  });

  // Download GIF
  document.getElementById('downloadGifBtn').addEventListener('click', () => {
    if (!window.gifBlob) return;
    const a = document.createElement('a');
    a.href = window.gifUrl; a.download = `ohsnap_${Date.now()}.gif`; a.click();
  });

  // Print
  document.getElementById('printBtn').addEventListener('click', () => {
    const data = window.finalDataURL || window.stripDataURL || window.gifUrl;
    if (!data) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html>
      <head><title>OhSnap Booth</title>
      <style>
        body { margin:0; background:#111; display:flex; justify-content:center; align-items:center; min-height:100vh; }
        img  { max-height:95vh; max-width:95vw; }
        @media print { body{background:white;} img{max-height:100vh;max-width:100vw;} }
      </style></head>
      <body><img src="${data}"/>
      <script>window.onload=()=>window.print();<\/script>
      </body></html>`);
    win.document.close();
  });

  // Email modal
  document.getElementById('emailBtn').addEventListener('click', () => {
    document.getElementById('emailModal').classList.add('open');
    document.getElementById('emailStatus').textContent = '';
    document.getElementById('emailInput').value = '';
  });
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('emailModal').classList.remove('open');
  });
  document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);

  // Retake
  document.getElementById('retakeBtn').addEventListener('click', () => {
    switchToPanel('panelRaw');
    resetResultPanels();
    setStepActive(1);
    document.getElementById('shootBtn').disabled = false;
    setStatus('Camera ready — choose mode & shoot!');
    window.gifBlob = null;
    window.gifUrl  = null;
  });
});

async function sendEmail() {
  const to       = document.getElementById('emailInput').value.trim();
  const statusEl = document.getElementById('emailStatus');
  const sendBtn  = document.getElementById('sendEmailBtn');

  if (!to.includes('@')) { statusEl.textContent = '⚠ Enter a valid email'; return; }

  const data = window.finalDataURL || window.stripDataURL;
  if (!data) { statusEl.textContent = '⚠ No photo found'; return; }

  sendBtn.textContent = 'Sending...'; sendBtn.disabled = true;

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:  to,
      from_name: 'OhSnap Booth',
      message:   'Here is your OhSnap Booth photo strip!',
      photo_url: data,
      date: new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }),
    });
    statusEl.style.color = '#4ade80';
    statusEl.textContent = '✓ Sent! Check your inbox.';
    setTimeout(() => document.getElementById('emailModal').classList.remove('open'), 2500);
  } catch(err) {
    console.error(err);
    statusEl.style.color = '#f87171';
    statusEl.textContent = '⚠ Failed. Check EmailJS config in export.js.';
  }
  sendBtn.textContent = 'Send'; sendBtn.disabled = false;
}