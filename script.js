// ---------- Countdown to launch ----------
// TODO: set this to your real launch date
const LAUNCH_DATE = new Date('2026-09-24T00:00:00');

function updateCountdown() {
  const now = new Date();
  const diff = LAUNCH_DATE - now;

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  if (diff <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minsEl.textContent = '00';
    secsEl.textContent = '00';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minsEl.textContent = String(mins).padStart(2, '0');
  secsEl.textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Waitlist form ----------
const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const hint = document.getElementById('formHint');
const btn = document.getElementById('subscribeBtn');

const DEFAULT_HINT = 'Be the first to know when we launch.';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setHint(text, state) {
  if (!hint) return;
  hint.textContent = text;
  hint.classList.remove('success', 'error');
  if (state) hint.classList.add(state);
}

// ---------- Confetti Animation ----------
// NOTE: canvas-confetti normally appends its own <canvas> as position:fixed
// directly to <body>. In WebKit browsers (Safari, iOS), a position:fixed
// descendant can still get clipped if any ancestor (here: body/.page) has
// overflow:hidden — even though spec-wise it shouldn't. That silently
// "hides" the confetti with no console error.
//
// Fix: create our own dedicated canvas, append it to <html> (outside the
// overflow:hidden chain), and drive it with confetti.create() instead of
// the global confetti() helper.
let myConfetti = null;

function getConfettiInstance() {
  if (myConfetti) return myConfetti;

  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.top = '0';
  confettiCanvas.style.left = '0';
  confettiCanvas.style.width = '100%';
  confettiCanvas.style.height = '100%';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = '9999';
  document.documentElement.appendChild(confettiCanvas);

  myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });
  return myConfetti;
}

function triggerConfetti() {
  const fire = getConfettiInstance();
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ff4757', '#2ed573'];

  (function frame() {
    fire({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    fire({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// --- REAL API INTEGRATION HERE ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = emailInput.value.trim();

  if (!isValidEmail(value)) {
    setHint('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  // 1. Show loading state
  btn.disabled = true;
  btn.textContent = 'Adding...';
  setHint('Processing your request...', null);

  try {
    // IMPORTANT: This is your LIVE Render API URL.
    // (If testing locally, change this to: 'http://127.0.0.1:8000/api/core/subscribe/')
    const API_URL = 'https://pihub-backend.onrender.com/api/core/subscribe/';

    // 2. Send the real request to your Django backend
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: value }),
    });

    const data = await response.json();

    // 3. Handle the backend's response
    if (response.ok) {
      // Success! (201 Created)
      setHint(" You're on the list! Check your email for a welcome message.", 'success');
      emailInput.value = ''; // Clear the input field

      //  TRIGGER CONFETTI CELEBRATION!
      triggerConfetti();

    } else {
      // Backend returned an error (e.g., 400 Bad Request)
      // Django often returns errors like: {"email": ["Enter a valid email address."]}
      const errorMsg = data.email ? data.email[0] : (data.error || data.detail || 'Something went wrong. Please try again.');
      setHint(errorMsg, 'error');
    }
  } catch (error) {
    // Network error (e.g., backend is down, or CORS blocked it)
    console.error('Subscription error:', error);
    setHint('Network error. Please check your connection and try again.', 'error');
  } finally {
    // 4. Reset button state no matter what happens
    btn.disabled = false;
    btn.textContent = 'Join waitlist';
  }
});

emailInput.addEventListener('input', () => {
  if (hint && hint.classList.contains('error')) {
    setHint(DEFAULT_HINT, null);
  }
});