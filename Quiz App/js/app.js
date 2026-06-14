/**
 * app.js — QuizMaster Application Logic
 *
 * Modules:
 *  1. State Management
 *  2. Navigation
 *  3. Render: Home
 *  4. Render: Category Select
 *  5. Quiz Engine (start, render question, answer, timer)
 *  6. Render: Results
 *  7. Render: Leaderboard
 *  8. Helpers (toast, shuffle, share)
 *  9. Bootstrap
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. STATE MANAGEMENT
   ═══════════════════════════════════════════════════════════ */

/** Centralised mutable state — never mutated outside setState() */
const STATE = {
  selectedCatKey: null,   // string key matching CATEGORIES
  questions:      [],     // shuffled array of question objects for current quiz
  currentIndex:   0,      // 0-based active question index
  answers:        [],     // Array<number|null>  null = unanswered, -1 = timed out
  correctCount:   0,      // running tally
  timerInterval:  null,   // setInterval handle
  timerSec:       30,     // seconds remaining
  TIMER_MAX:      30,
  quizStartTime:  null,   // Date for elapsed tracking
  gemsTotal:      160,    // user's gem wallet
};

/** Patch state safely */
function setState(patch) {
  Object.assign(STATE, patch);
}

/* ═══════════════════════════════════════════════════════════
   2. NAVIGATION
   ═══════════════════════════════════════════════════════════ */

/** All page IDs */
const PAGES = ['home', 'category', 'quiz', 'results', 'leaderboard'];

/**
 * Show a page by key; hide all others.
 * Also syncs the header nav active state.
 * @param {string} key  — one of PAGES
 */
function navigateTo(key) {
  PAGES.forEach(id => {
    const el = document.getElementById(`page-${id}`);
    if (el) el.classList.toggle('active', id === key);
  });

  // Sync header nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === key);
  });

  // Scroll page to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy-render pages that need it
  if (key === 'leaderboard') renderLeaderboard();
}

/* ═══════════════════════════════════════════════════════════
   3. RENDER: HOME
   ═══════════════════════════════════════════════════════════ */

/** Populate the home category strip and recent activity grid */
function renderHome() {
  renderHomeCatStrip();
  renderRecentActivity();
}

function renderHomeCatStrip() {
  const wrap = document.getElementById('home-cat-strip');
  if (!wrap) return;
  wrap.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const el = document.createElement('button');
    el.className = 'cat-chip-web';
    el.setAttribute('aria-label', `Start ${cat.label} quiz`);
    el.innerHTML = `
      <span class="cat-chip-emoji">${cat.icon}</span>
      <span class="cat-chip-name">${cat.label}</span>
      <span class="cat-chip-count">${QUESTION_BANK[cat.key].length} Qs</span>`;
    el.onclick = () => {
      navigateTo('category');
      preselectCategory(cat.key);
    };
    wrap.appendChild(el);
  });
}

function renderRecentActivity() {
  const grid = document.getElementById('activity-grid');
  if (!grid) return;
  grid.innerHTML = '';

  RECENT_ACTIVITY.forEach(item => {
    const meta = CATEGORIES.find(c => c.key === item.catKey);
    if (!meta) return;

    const pct = Math.round((item.correct / item.total) * 100);
    const card = document.createElement('div');
    card.className = 'act-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="act-icon-box" style="background:${meta.bg}">${meta.icon}</div>
      <div class="act-info">
        <div class="act-name">${meta.label}</div>
        <div class="act-count">${item.total} Questions</div>
      </div>
      <div class="act-score-badge"
           style="background:${meta.bg};color:${meta.color}">
        ${item.correct}/${item.total}
      </div>`;

    const launch = () => { navigateTo('category'); preselectCategory(meta.key); };
    card.onclick = launch;
    card.onkeydown = e => e.key === 'Enter' && launch();
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════
   4. RENDER: CATEGORY SELECT
   ═══════════════════════════════════════════════════════════ */

function renderCategorySelect() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cat-card-web';
    card.dataset.key = cat.key;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <span class="cat-card-emoji">${cat.icon}</span>
      <div class="cat-card-name">${cat.label}</div>
      <div class="cat-card-count">${QUESTION_BANK[cat.key].length} Questions · ${cat.desc}</div>
      <span class="cat-card-check">✓</span>`;

    const select = () => preselectCategory(cat.key);
    card.onclick  = select;
    card.onkeydown = e => e.key === 'Enter' && select();
    grid.appendChild(card);
  });
}

/**
 * Visually mark a category as selected and enable the Start button.
 * @param {string} key
 */
function preselectCategory(key) {
  setState({ selectedCatKey: key });

  document.querySelectorAll('.cat-card-web').forEach(c => {
    c.classList.toggle('selected', c.dataset.key === key);
  });

  const meta = CATEGORIES.find(c => c.key === key);
  const info = document.getElementById('start-bar-info');
  if (info && meta) info.textContent = `${meta.icon}  ${meta.label} — ${QUESTION_BANK[key].length} questions`;

  const btn = document.getElementById('btn-start');
  if (btn) btn.disabled = false;
}

/* ═══════════════════════════════════════════════════════════
   5. QUIZ ENGINE
   ═══════════════════════════════════════════════════════════ */

/* ── 5a. Start ─────────────────────────────────────────── */

/** Kick off a fresh quiz session */
function startQuiz() {
  const key = STATE.selectedCatKey;
  if (!key || !QUESTION_BANK[key]) { showToast('Please select a category first'); return; }

  const pool = shuffle([...QUESTION_BANK[key]]);
  setState({
    questions:     pool,
    currentIndex:  0,
    answers:       new Array(pool.length).fill(null),
    correctCount:  0,
    quizStartTime: Date.now(),
  });

  // Header labels
  const meta = CATEGORIES.find(c => c.key === key);
  setEl('quiz-topic-badge', meta ? meta.label : key);
  setEl('quiz-q-count',     `${pool.length} Questions`);

  // Build the question-map dots in the sidebar
  buildQMap();

  navigateTo('quiz');
  renderQuestion();
}

/** Re-start with a fresh shuffle */
function restartQuiz() {
  clearTimer();
  startQuiz();
}

/* ── 5b. Render a question ─────────────────────────────── */

function renderQuestion() {
  const { questions, currentIndex, answers } = STATE;
  const total = questions.length;
  const idx   = currentIndex;
  const q     = questions[idx];

  // Q-number label
  setEl('q-num-label', `Question ${idx + 1} of ${total}`);

  // Question text
  setEl('question-text', q.q);

  // Progress ring in sidebar (circumference ≈ 264 for r=42)
  const ringPct     = (idx + 1) / total;
  const ringEl      = document.getElementById('progress-ring');
  const circumference = 2 * Math.PI * 42; // ≈ 263.9
  if (ringEl) {
    ringEl.style.strokeDashoffset = circumference - ringPct * circumference;
  }
  setEl('ring-num',   idx + 1);
  setEl('ring-denom', `/${total}`);

  // Tally sidebar stats
  const correct = answers.filter((a, i) => a !== null && a !== -1 && a === questions[i].ans).length;
  const wrong   = answers.filter((a, i) => a !== null && a !== -1 && a !== questions[i].ans).length;
  const skip    = answers.filter(a => a === -1).length;
  setEl('stat-correct', correct);
  setEl('stat-wrong',   wrong);
  setEl('stat-skip',    skip);

  // Options (2-column grid)
  const grid = document.getElementById('options-grid');
  if (grid) {
    grid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'option-btn';
      btn.dataset.idx = i;
      btn.innerHTML   = `
        <span class="option-letter">${letters[i]}</span>
        <span class="option-text">${opt}</span>
        <span class="option-check"></span>`;

      const saved = answers[idx];
      if (saved !== null) {
        // Restore styling for already-answered question
        applyAnswerStyle(btn, i, saved, q.ans);
        btn.disabled = true;
      } else {
        btn.onclick = () => handleAnswer(i);
      }
      grid.appendChild(btn);
    });
  }

  // Dot progress strip (quiz-nav-row)
  buildQDots();

  // Q-map in sidebar
  updateQMap();

  // Show "See Results" only when every question has been touched
  const allDone = answers.every(a => a !== null);
  const srBtn   = document.getElementById('see-result-btn');
  if (srBtn) srBtn.style.display = allDone ? 'inline' : 'none';

  // Prev / Next buttons
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (nextBtn) nextBtn.textContent = idx === total - 1 ? 'Finish ✓' : 'Next →';

  // Timer — start fresh unless already answered
  if (answers[idx] === null) {
    startTimer();
  } else {
    clearTimer();
    updateTimerUI(STATE.TIMER_MAX); // reset visual
  }
}

/* ── 5c. Answer handling ───────────────────────────────── */

/**
 * Handle the user selecting an option.
 * @param {number} chosenIdx  0-3
 */
function handleAnswer(chosenIdx) {
  // Guard: ignore if already answered
  if (STATE.answers[STATE.currentIndex] !== null) return;

  clearTimer();

  const q       = STATE.questions[STATE.currentIndex];
  const correct = q.ans;

  // Record answer
  const newAnswers = [...STATE.answers];
  newAnswers[STATE.currentIndex] = chosenIdx;
  setState({ answers: newAnswers });

  if (chosenIdx === correct) {
    setState({ correctCount: STATE.correctCount + 1 });
  }

  // Style all option buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    applyAnswerStyle(btn, parseInt(btn.dataset.idx), chosenIdx, correct);
  });

  // Update sidebar stats
  const { questions, answers } = STATE;
  const totalCorrect = answers.filter((a, i) => a !== null && a !== -1 && a === questions[i].ans).length;
  const totalWrong   = answers.filter((a, i) => a !== null && a !== -1 && a !== questions[i].ans).length;
  setEl('stat-correct', totalCorrect);
  setEl('stat-wrong',   totalWrong);
  updateQMap();

  // Show "See Results" when all answered
  const allDone = newAnswers.every(a => a !== null);
  const srBtn   = document.getElementById('see-result-btn');
  if (srBtn) srBtn.style.display = allDone ? 'inline' : 'none';

  // Auto-advance after short feedback delay
  const isLast = STATE.currentIndex === STATE.questions.length - 1;
  setTimeout(() => {
    if (isLast) goToResults();
    else        nextQuestion();
  }, 1100);
}

/**
 * Apply correct/wrong/neutral CSS classes to an option button.
 * @param {HTMLButtonElement} btn
 * @param {number} optIdx    — index of this button's option
 * @param {number} chosen    — what the user picked (-1 if timed out)
 * @param {number} correct   — the correct answer index
 */
function applyAnswerStyle(btn, optIdx, chosen, correct) {
  const check = btn.querySelector('.option-check');
  btn.classList.remove('selected', 'correct', 'wrong');
  if (optIdx === correct) {
    btn.classList.add('correct');
    if (check) check.textContent = '✓';
  } else if (optIdx === chosen && chosen !== correct) {
    btn.classList.add('wrong');
    if (check) check.textContent = '✗';
  }
}

/* ── 5d. Navigation ────────────────────────────────────── */

function nextQuestion() {
  clearTimer();
  const { currentIndex, questions } = STATE;
  if (currentIndex < questions.length - 1) {
    setState({ currentIndex: currentIndex + 1 });
    renderQuestion();
  } else {
    goToResults();
  }
}

function prevQuestion() {
  clearTimer();
  const { currentIndex } = STATE;
  if (currentIndex > 0) {
    setState({ currentIndex: currentIndex - 1 });
    renderQuestion();
  }
}

function confirmQuit() {
  if (confirm('Quit this quiz? Your progress will be lost.')) {
    clearTimer();
    navigateTo('home');
  }
}

/* ── 5e. Timer ─────────────────────────────────────────── */

/** Start countdown from TIMER_MAX seconds */
function startTimer() {
  clearTimer();
  setState({ timerSec: STATE.TIMER_MAX });
  updateTimerUI(STATE.TIMER_MAX);

  STATE.timerInterval = setInterval(() => {
    const next = STATE.timerSec - 1;
    setState({ timerSec: next });

    if (next < 0) {
      // Time's up
      clearTimer();
      onTimerExpired();
      return;
    }
    updateTimerUI(next);
  }, 1000);
}

/** Visually update the timer elements */
function updateTimerUI(sec) {
  const numEl  = document.getElementById('timer-num');
  const fillEl = document.getElementById('timer-fill');
  const pct    = (sec / STATE.TIMER_MAX) * 100;

  if (numEl)  numEl.textContent  = sec;
  if (fillEl) fillEl.style.width = pct + '%';

  const urgent = sec <= 8;
  if (numEl)  numEl.classList.toggle('urgent',  urgent);
  if (fillEl) fillEl.classList.toggle('urgent', urgent);
}

/** Called when timer reaches zero */
function onTimerExpired() {
  if (STATE.answers[STATE.currentIndex] !== null) return; // already answered

  // Mark as timed-out
  const newAnswers = [...STATE.answers];
  newAnswers[STATE.currentIndex] = -1;
  setState({ answers: newAnswers });

  const skip = newAnswers.filter(a => a === -1).length;
  setEl('stat-skip', skip);
  updateQMap();

  // Briefly highlight the correct answer then advance
  const q       = STATE.questions[STATE.currentIndex];
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (parseInt(btn.dataset.idx) === q.ans) btn.classList.add('correct');
  });

  showToast('⏱ Time\'s up!');
  setTimeout(() => {
    if (STATE.currentIndex < STATE.questions.length - 1) nextQuestion();
    else goToResults();
  }, 900);
}

function clearTimer() {
  if (STATE.timerInterval) {
    clearInterval(STATE.timerInterval);
    setState({ timerInterval: null });
  }
}

/* ── 5f. Q-map & dot helpers ───────────────────────────── */

/** Build the sidebar question-map dots (once per quiz) */
function buildQMap() {
  const map = document.getElementById('q-map');
  if (!map) return;
  map.innerHTML = '';
  STATE.questions.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className    = 'q-dot';
    dot.textContent  = i + 1;
    dot.setAttribute('aria-label', `Jump to question ${i + 1}`);
    dot.onclick = () => {
      clearTimer();
      setState({ currentIndex: i });
      renderQuestion();
    };
    dot.id = `q-dot-${i}`;
    map.appendChild(dot);
  });
}

/** Refresh sidebar q-dot states */
function updateQMap() {
  const { questions, answers, currentIndex } = STATE;
  questions.forEach((q, i) => {
    const dot = document.getElementById(`q-dot-${i}`);
    if (!dot) return;
    dot.className = 'q-dot';
    if (i === currentIndex) {
      dot.classList.add('current');
    } else if (answers[i] === null) {
      // unanswered
    } else if (answers[i] === -1) {
      dot.classList.add('skipped');
    } else if (answers[i] === q.ans) {
      dot.classList.add('correct');
    } else {
      dot.classList.add('wrong');
    }
  });
}

/** Build the mini-dot progress strip in the nav row */
function buildQDots() {
  const wrap = document.getElementById('q-dots');
  if (!wrap) return;
  const { questions, currentIndex, answers } = STATE;
  const total = questions.length;

  // Show max 10 dots; collapse if more
  const show = Math.min(total, 10);
  wrap.innerHTML = '';
  for (let i = 0; i < show; i++) {
    const d = document.createElement('div');
    d.className = 'q-dot-mini';
    if (i === currentIndex)   d.classList.add('active');
    else if (answers[i] !== null) d.classList.add('done');
    wrap.appendChild(d);
  }
}

/* ═══════════════════════════════════════════════════════════
   6. RENDER: RESULTS
   ═══════════════════════════════════════════════════════════ */

function goToResults() {
  clearTimer();

  const { questions, answers } = STATE;
  const total   = questions.length;
  const correct = questions.filter((q, i) => answers[i] === q.ans).length;
  const wrong   = questions.filter((q, i) => answers[i] !== null && answers[i] !== -1 && answers[i] !== q.ans).length;
  const skipped = answers.filter(a => a === -1 || a === null).length;
  const pct     = Math.round((correct / total) * 100);

  // Award gems: 10 per correct answer
  const earned = correct * 10;
  setState({ gemsTotal: STATE.gemsTotal + earned });
  updateGemDisplay();

  /* ── Score ring animation ── */
  const arc  = document.getElementById('score-arc');
  const circ = 2 * Math.PI * 96; // r=96  ≈ 603.2
  if (arc) {
    arc.style.strokeDasharray  = circ;
    arc.style.strokeDashoffset = circ;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        arc.style.strokeDashoffset = circ - (pct / 100) * circ;
      });
    });
  }

  setEl('res-score',   `${correct}/${total}`);
  setEl('res-pct',     `${pct}%`);
  setEl('rs-correct',  correct);
  setEl('rs-wrong',    wrong);
  setEl('rs-skip',     skipped);
  setEl('rs-acc',      `${pct}%`);
  setEl('rs-gems',     `+${earned} 💎`);
  setEl('rs-time',     CATEGORIES.find(c => c.key === STATE.selectedCatKey)?.label || '—');

  /* ── Feedback copy ── */
  let emoji, title, sub;
  const firstName = 'Rumi'; // could pull from a profile state

  if (pct >= 90) {
    emoji = '🏆'; title = 'Outstanding!';
    sub = `Incredible work, ${firstName}! You scored ${correct}/${total}. You're a true expert!`;
  } else if (pct >= 70) {
    emoji = '🎉'; title = 'Congratulations!';
    sub = `Great job, ${firstName}! You scored ${correct}/${total}. Keep it up!`;
  } else if (pct >= 50) {
    emoji = '👍'; title = 'Good Effort!';
    sub = `Not bad, ${firstName}! ${correct}/${total} — a bit more practice and you'll ace it.`;
  } else {
    emoji = '📚'; title = 'Keep Practising!';
    sub = `You scored ${correct}/${total}, ${firstName}. Review the material and try again — you've got this!`;
  }

  setEl('res-emoji', emoji);
  setEl('res-title', title);
  setEl('res-sub',   sub);

  /* ── Answer review list ── */
  renderAnswerReview(questions, answers);

  navigateTo('results');
}

/**
 * Build the detailed answer-review list on the results page.
 * @param {Object[]} questions
 * @param {number[]} answers
 */
function renderAnswerReview(questions, answers) {
  const list = document.getElementById('review-list');
  if (!list) return;
  list.innerHTML = '';

  questions.forEach((q, i) => {
    const chosen = answers[i];
    const isCorrect = chosen === q.ans;
    const isSkip    = chosen === null || chosen === -1;

    const item = document.createElement('div');
    item.className = `review-item ${isSkip ? 'r-skip' : isCorrect ? 'r-correct' : 'r-wrong'}`;

    const chosenText = isSkip ? '—' : q.opts[chosen];
    const correctText = q.opts[q.ans];

    item.innerHTML = `
      <div class="review-q">${i + 1}. ${q.q}</div>
      <div class="review-ans">
        <span class="${isSkip ? '' : isCorrect ? 'correct' : 'wrong'}">
          ${isSkip ? '⏱ Skipped' : (isCorrect ? '✓ ' : '✗ ') + chosenText}
        </span>
        ${!isCorrect && !isSkip ? `<span class="correct">✓ ${correctText}</span>` : ''}
      </div>`;
    list.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════
   7. RENDER: LEADERBOARD
   ═══════════════════════════════════════════════════════════ */

function renderLeaderboard() {
  const table = document.getElementById('leaderboard-table');
  if (!table) return;

  const medals = ['🥇', '🥈', '🥉'];
  const cls    = ['gold', 'silver', 'bronze'];
  const rowCls = ['top1', 'top2', 'top3'];

  table.innerHTML = `
    <div class="lb-head">
      <div>#</div>
      <div>Player</div>
      <div>Score</div>
      <div>Gems</div>
      <div>Category</div>
    </div>`;

  LEADERBOARD.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = `lb-row${i < 3 ? ' ' + rowCls[i] : ''}`;
    const rankHtml = i < 3
      ? `<span class="lb-rank ${cls[i]}">${medals[i]}</span>`
      : `<span class="lb-rank">${i + 1}</span>`;

    row.innerHTML = `
      ${rankHtml}
      <div class="lb-user">
        <div class="lb-avatar">${entry.name[0]}</div>
        <div>
          <div class="lb-uname">${entry.name}</div>
          <div class="lb-uid">${entry.id}</div>
        </div>
      </div>
      <div class="lb-score">${entry.score} pts</div>
      <div class="lb-gems">💎 ${entry.gems}</div>
      <div><span class="lb-badge">${entry.cat}</span></div>`;
    table.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════
   8. HELPERS
   ═══════════════════════════════════════════════════════════ */

/**
 * Fisher-Yates in-place shuffle.
 * @param {Array} arr
 * @returns {Array} shuffled copy
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Set textContent of an element by ID (safe no-op if missing).
 * @param {string} id
 * @param {string|number} text
 */
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/** Sync gem count across all gem display elements */
function updateGemDisplay() {
  document.querySelectorAll('#header-gems').forEach(el => {
    el.textContent = STATE.gemsTotal;
  });
}

/* ── TOAST ──────────────────────────────────────────────── */
let _toastTimer = null;

/**
 * Show a transient toast notification.
 * @param {string} msg
 */
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ── SHARE ──────────────────────────────────────────────── */

function shareScore() {
  const scoreEl = document.getElementById('res-score');
  const score   = scoreEl ? scoreEl.textContent : '—';
  const catMeta = CATEGORIES.find(c => c.key === STATE.selectedCatKey);
  const cat     = catMeta ? catMeta.label : 'Quiz';
  const message = `🎉 I just scored ${score} on the ${cat} quiz in QuizMaster! Can you beat me? 🧠`;

  if (navigator.share) {
    navigator.share({ title: 'QuizMaster Result', text: message })
      .catch(() => copyText(message));
  } else {
    copyText(message);
  }
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Result copied to clipboard!'))
      .catch(() => showToast(text));
  } else {
    showToast('📋 ' + text);
  }
}

/* ── HAMBURGER ──────────────────────────────────────────── */

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.remove('open');
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

/* ── SVG GRADIENT INJECTION (for progress ring) ─────────── */
function injectSvgGradients() {
  // The quiz sidebar ring needs a gradient def that lives in the SVG
  const svg = document.querySelector('.ring-svg');
  if (svg && !svg.querySelector('#qGrad')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#1b3f8b"/>
        <stop offset="100%" stop-color="#4f78e0"/>
      </linearGradient>`;
    svg.prepend(defs);
  }
}

/* ═══════════════════════════════════════════════════════════
   9. BOOTSTRAP
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Inject gradient defs into SVGs
  injectSvgGradients();

  // Wire up hamburger menu
  initHamburger();

  // Render static home content
  renderHome();

  // Render category select content
  renderCategorySelect();

  // Start on home page
  navigateTo('home');
});