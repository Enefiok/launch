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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = emailInput.value.trim();

  if (!isValidEmail(value)) {
    setHint('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  setTimeout(() => {
    setHint("You're on the list! We'll be in touch soon.", 'success');
    emailInput.value = '';
    btn.disabled = false;
    btn.textContent = 'Join waitlist';
  }, 600);
});

emailInput.addEventListener('input', () => {
  if (hint && hint.classList.contains('error')) {
    setHint(DEFAULT_HINT, null);
  }
});