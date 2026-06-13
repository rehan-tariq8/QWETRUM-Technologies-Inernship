/**
 * app.js — Multi-Step Registration Form
 * Matches the original blue glassmorphism design from screenshot.
 *
 * Features:
 *  - 3-step form: Personal Info → Account Details → Confirmation
 *  - Client-side validation with inline errors
 *  - Password strength indicator (Weak / Fair / Strong)
 *  - Password show/hide toggle
 *  - localStorage persistence + entries table with delete
 *  - Smooth step transitions
 *  - Duplicate submission guard
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────────── */
const state = {
  step: 1,          // current step (1, 2, 3)
  submitting: false, // guard against double-submit
  data: {           // collected form values
    name: '',
    age: '',
    phone: '',
    email: '',
    password: ''
  }
};

/* ─────────────────────────────────────────────────────────────
   DOM SHORTCUTS
───────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const inputs = {
  name:    $('name'),
  age:     $('age'),
  phone:   $('phone'),
  email:   $('email'),
  pwd:     $('password'),
  cpwd:    $('confirm-password')
};

/* ─────────────────────────────────────────────────────────────
   VALIDATORS
   Each returns '' on success or an error string on failure.
───────────────────────────────────────────────────────────── */
const validators = {
  name(v) {
    if (!v.trim()) return 'Full name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  age(v) {
    if (!v && v !== 0) return 'Age is required.';
    const n = parseInt(v, 10);
    if (isNaN(n)) return 'Please enter a valid number.';
    if (n < 18) return 'You must be at least 18 years old.';
    if (n > 120) return 'Please enter a realistic age (max 120).';
    return '';
  },
  phone(v) {
    if (!v.trim()) return 'Phone number is required.';
    // Accept: 1234567890 | 123-456-7890 | (123) 456-7890 | +1-123-456-7890
    const clean = v.replace(/\s/g, '');
    if (!/^(\+?1[-.]?)?(\(?\d{3}\)?[-.]?)?\d{3}[-.]?\d{4}$/.test(clean))
      return 'Enter a valid phone number, e.g. (123) 456-7890.';
    return '';
  },
  email(v) {
    if (!v.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
      return 'Enter a valid email address.';
    return '';
  },
  password(v) {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter.';
    if (!/[a-z]/.test(v)) return 'Include at least one lowercase letter.';
    if (!/\d/.test(v)) return 'Include at least one number.';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Include at least one special character (!@#$…).';
    return '';
  },
  confirmPwd(v, pwd) {
    if (!v) return 'Please confirm your password.';
    if (v !== pwd) return 'Passwords do not match.';
    return '';
  }
};

/* ─────────────────────────────────────────────────────────────
   FIELD STATE HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Set a field as valid or invalid, showing/hiding its error message.
 * @param {HTMLInputElement} el
 * @param {string} errorId
 * @param {string} message  — empty = valid
 */
function setField(el, errorId, message) {
  const errEl = $(errorId);
  if (message) {
    el.classList.add('is-invalid');
    el.classList.remove('is-valid');
    if (errEl) errEl.textContent = message;
    el.setAttribute('aria-invalid', 'true');
  } else {
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
    if (errEl) errEl.textContent = '';
    el.removeAttribute('aria-invalid');
  }
}

/** Clear all validation styling from a field. */
function clearField(el, errorId) {
  el.classList.remove('is-valid', 'is-invalid');
  el.removeAttribute('aria-invalid');
  const errEl = $(errorId);
  if (errEl) errEl.textContent = '';
}

/* ─────────────────────────────────────────────────────────────
   STEP VALIDATION
   Returns true if the step is fully valid.
───────────────────────────────────────────────────────────── */
function validateStep(step) {
  let ok = true;

  if (step === 1) {
    const pairs = [
      [inputs.name, 'name-err', validators.name(inputs.name.value)],
      [inputs.age,  'age-err',  validators.age(inputs.age.value)],
      [inputs.phone,'phone-err',validators.phone(inputs.phone.value)]
    ];
    pairs.forEach(([el, eid, err]) => {
      setField(el, eid, err);
      if (err) ok = false;
    });
    if (!ok) {
      // Focus the first invalid field
      const first = pairs.find(([,, err]) => err);
      if (first) first[0].focus();
    }
  }

  if (step === 2) {
    const pwd = inputs.pwd.value;
    const eErr  = validators.email(inputs.email.value);
    const pErr  = validators.password(pwd);
    const cErr  = validators.confirmPwd(inputs.cpwd.value, pwd);

    setField(inputs.email, 'email-err', eErr);
    setField(inputs.pwd,   'pwd-err',   pErr);
    setField(inputs.cpwd,  'cpwd-err',  cErr);

    if (eErr || pErr || cErr) {
      ok = false;
      (eErr ? inputs.email : pErr ? inputs.pwd : inputs.cpwd).focus();
    }
  }

  return ok;
}

/* ─────────────────────────────────────────────────────────────
   STEP NAVIGATION
───────────────────────────────────────────────────────────── */
function goToStep(n) {
  // Hide current, show target
  $(`step-${state.step}`).classList.add('d-none');
  $(`step-${n}`).classList.remove('d-none');
  state.step = n;
  updateStepBar(n);
  // Scroll card into view on mobile
  document.querySelector('.glass-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepBar(n) {
  [1, 2, 3].forEach(i => {
    const dot = $(`dot-${i}`);
    dot.classList.remove('active', 'done');
    if (i < n)  dot.classList.add('done');
    if (i === n) dot.classList.add('active');
  });
  // Connectors
  if ($('con-1')) $('con-1').classList.toggle('done', n > 1);
  if ($('con-2')) $('con-2').classList.toggle('done', n > 2);
  // ARIA
  const bar = $('step-bar');
  if (bar) bar.setAttribute('aria-valuenow', n);
}

/* ─────────────────────────────────────────────────────────────
   BUTTON HANDLERS: Next / Back
───────────────────────────────────────────────────────────── */
$('next-1').addEventListener('click', () => {
  if (!validateStep(1)) return;
  // Collect step 1 data
  state.data.name  = inputs.name.value.trim();
  state.data.age   = inputs.age.value.trim();
  state.data.phone = inputs.phone.value.trim();
  goToStep(2);
});

$('back-2').addEventListener('click', () => goToStep(1));

$('next-2').addEventListener('click', () => {
  if (!validateStep(2)) return;
  // Collect step 2 data
  state.data.email    = inputs.email.value.trim();
  state.data.password = inputs.pwd.value;
  populateConfirm();
  goToStep(3);
});

$('back-3').addEventListener('click', () => goToStep(2));

/* ─────────────────────────────────────────────────────────────
   CONFIRMATION STEP: populate read-only summary
───────────────────────────────────────────────────────────── */
function populateConfirm() {
  $('c-name').textContent  = state.data.name;
  $('c-age').textContent   = state.data.age;
  $('c-phone').textContent = state.data.phone;
  $('c-email').textContent = state.data.email;
  // Mask password visually
  $('c-password').textContent = '•'.repeat(state.data.password.length);

  // Ensure success banner is hidden and buttons visible on re-visit
  $('success-banner').classList.add('d-none');
  $('step3-btns').style.display = '';
}

/* ─────────────────────────────────────────────────────────────
   SUBMIT
───────────────────────────────────────────────────────────── */
$('submit-btn').addEventListener('click', () => {
  if (state.submitting) return;
  state.submitting = true;

  const btn = $('submit-btn');
  btn.disabled = true;
  btn.classList.add('loading');

  // Simulate async save (replace setTimeout with real fetch in production)
  setTimeout(() => {
    saveEntry({
      name:  state.data.name,
      email: state.data.email,
      phone: state.data.phone,
      age:   state.data.age,
      date:  new Date().toLocaleString()
    });

    // Show success banner, hide buttons
    $('success-banner').classList.remove('d-none');
    $('step3-btns').style.display = 'none';

    btn.disabled = false;
    btn.classList.remove('loading');

    renderEntriesTable();

    // Auto-reset after 2.5 s
    setTimeout(() => {
      resetForm();
      state.submitting = false;
    }, 2500);
  }, 1200);
});

/* ─────────────────────────────────────────────────────────────
   FORM RESET
───────────────────────────────────────────────────────────── */
function resetForm() {
  // Clear all inputs
  Object.values(inputs).forEach(el => {
    el.value = '';
    clearField(el, el.id + '-err'); // best-effort; error ids may differ
  });
  // Explicitly clear error fields
  ['name-err','age-err','phone-err','email-err','pwd-err','cpwd-err'].forEach(id => {
    const el = $(id); if (el) el.textContent = '';
  });
  // Clear validation classes
  Object.values(inputs).forEach(el => el.classList.remove('is-valid','is-invalid'));
  // Reset strength bar
  updateStrengthBar('');
  // Reset data object
  Object.keys(state.data).forEach(k => state.data[k] = '');
  // Go to step 1
  $('success-banner').classList.add('d-none');
  $('step3-btns').style.display = '';
  goToStep(1);
}

/* ─────────────────────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────────────────────── */

/**
 * Returns 0 (empty), 1 (weak), 2 (fair), 3 (strong)
 */
function strengthScore(v) {
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (score <= 1) return 1;      // weak
  if (score <= 3) return 2;      // fair
  return 3;                      // strong
}

function updateStrengthBar(value) {
  const score  = strengthScore(value);
  const segs   = [$('seg-1'), $('seg-2'), $('seg-3'), $('seg-4')];
  const label  = $('strength-label');
  const cls    = ['', 'weak', 'fair', 'fair', 'strong']; // map score → segment class
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['', 'rgba(255,180,180,0.9)', 'rgba(245,166,35,0.9)', 'rgba(34,200,122,0.9)'];

  segs.forEach((seg, i) => {
    seg.className = 'strength-seg';
    // Fill segments proportionally: score 1 = 1 seg, 2 = 2 segs, 3 = 4 segs
    const threshold = score === 3 ? 1 : score === 2 ? 2 : 4;
    if (value && i < threshold) seg.classList.add(cls[score] || '');
  });

  if (label) {
    label.textContent = value ? labels[score] : '';
    label.style.color = value ? colors[score] : '';
  }
}

inputs.pwd.addEventListener('input', () => updateStrengthBar(inputs.pwd.value));

/* ─────────────────────────────────────────────────────────────
   INLINE BLUR VALIDATION (real-time feedback)
───────────────────────────────────────────────────────────── */
inputs.name.addEventListener('blur', function() {
  if (this.value) setField(this, 'name-err', validators.name(this.value));
});
inputs.name.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'name-err', validators.name(this.value));
});

inputs.age.addEventListener('blur', function() {
  if (this.value) setField(this, 'age-err', validators.age(this.value));
});
inputs.age.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'age-err', validators.age(this.value));
});

inputs.phone.addEventListener('blur', function() {
  if (this.value) setField(this, 'phone-err', validators.phone(this.value));
});
inputs.phone.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'phone-err', validators.phone(this.value));
});

inputs.email.addEventListener('blur', function() {
  if (this.value) setField(this, 'email-err', validators.email(this.value));
});
inputs.email.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'email-err', validators.email(this.value));
});

inputs.pwd.addEventListener('blur', function() {
  if (this.value) setField(this, 'pwd-err', validators.password(this.value));
});
inputs.pwd.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'pwd-err', validators.password(this.value));
  // Also re-validate confirm if it already has a value
  if (inputs.cpwd.value)
    setField(inputs.cpwd, 'cpwd-err', validators.confirmPwd(inputs.cpwd.value, this.value));
});

inputs.cpwd.addEventListener('blur', function() {
  if (this.value)
    setField(this, 'cpwd-err', validators.confirmPwd(this.value, inputs.pwd.value));
});
inputs.cpwd.addEventListener('input', function() {
  if (this.classList.contains('is-invalid'))
    setField(this, 'cpwd-err', validators.confirmPwd(this.value, inputs.pwd.value));
});

/* ─────────────────────────────────────────────────────────────
   PASSWORD VISIBILITY TOGGLE
───────────────────────────────────────────────────────────── */
function setupEyeToggle(btnId, inputEl, eyeId, eyeOffId) {
  $(btnId).addEventListener('click', () => {
    const isHidden = inputEl.type === 'password';
    inputEl.type = isHidden ? 'text' : 'password';
    $(eyeId).style.display    = isHidden ? 'none' : '';
    $(eyeOffId).style.display = isHidden ? '' : 'none';
    $(btnId).setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
}

setupEyeToggle('eye-pwd',  inputs.pwd,  'icon-eye',   'icon-eye-off');
setupEyeToggle('eye-cpwd', inputs.cpwd, 'icon-eye-c', 'icon-eye-off-c');

/* ─────────────────────────────────────────────────────────────
   OAUTH BUTTONS (demo)
───────────────────────────────────────────────────────────── */
document.querySelectorAll('.oauth-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.dataset.provider || 'this provider';
    // In production, redirect to OAuth URL for the provider
    alert(`${p} OAuth is not configured in this demo.`);
  });
});

/* ─────────────────────────────────────────────────────────────
   SIGN IN LINK (demo)
───────────────────────────────────────────────────────────── */
const signinLink = $('signin-link');
if (signinLink) {
  signinLink.addEventListener('click', e => {
    e.preventDefault();
    alert('Sign in page — link your login page URL here.');
  });
}

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE — ENTRIES PERSISTENCE
───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'nexus_registrations';

/** Load all saved entries from localStorage. */
function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Save a new entry to localStorage. */
function saveEntry(entry) {
  try {
    const entries = loadEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

/** Delete an entry by index. */
function deleteEntry(index) {
  try {
    const entries = loadEntries();
    entries.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Could not delete from localStorage:', e);
  }
  renderEntriesTable();
}

/** Clear all entries. */
$('clear-all-btn').addEventListener('click', () => {
  if (!confirm('Remove all registered entries? This cannot be undone.')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  renderEntriesTable();
});

/** Render the entries table below the card. */
function renderEntriesTable() {
  const entries = loadEntries();
  const section = $('entries-section');
  const tbody   = $('entries-body');

  if (!entries.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  tbody.innerHTML = entries.map((e, i) => `
    <tr>
      <td>${escapeHtml(e.name  || '')}</td>
      <td>${escapeHtml(e.email || '')}</td>
      <td>${escapeHtml(e.phone || '')}</td>
      <td>${escapeHtml(e.age   || '')}</td>
      <td style="white-space:nowrap">${escapeHtml(e.date || '')}</td>
      <td>
        <button class="btn-delete" onclick="deleteEntry(${i})" aria-label="Delete entry for ${escapeHtml(e.name || '')}">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

/** XSS-safe HTML escaping for table cells. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────── */
// Load any previously saved entries on page load
renderEntriesTable();
