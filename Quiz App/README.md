# QuizMaster — Interactive Quiz Web Application

> **Internship Task** | Web Development 
> **Organization:** QWETRUM Technologies
> **Role:** Web Developer Intern
> **Submitted by:** Rehan Tariq

---

## 📋 Task Overview

This project was assigned as part of the Web Development internship program at **QWETRUM Technologies**. The objective was to design and develop a fully functional, responsive quiz web application from scratch using only vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no external dependencies.

The application had to demonstrate:
- Clean, semantic HTML structure
- Responsive layout working across all screen sizes (mobile → desktop)
- Modular, well-commented JavaScript with clear separation of concerns
- A polished UI matching a provided design reference
- Production-ready code quality and organization

---

## 🌐 Live Preview

Open `index.html` directly in any modern browser. No server, no build step required.

```
quiz-web-app/
└── index.html   ← open this
```

---

## ✨ Features

### 🏠 Home Page
- User profile header with gem/points balance
- Hero section with animated floating quiz preview cards
- Scrollable category strip for quick navigation
- Recent activity grid showing past quiz performance per topic

### 📚 Category Select Page
- Visual card grid for all 5 quiz categories
- Single-click category selection with active highlight
- Start bar showing selected category details and question count
- Start button enabled only after a category is chosen

### 🧠 Quiz Page
- **Two-column web layout** — sidebar + main question panel
- **30-second countdown timer** per question with animated progress bar (turns red under 8s)
- **Progress ring** in sidebar showing current question vs total
- **Live stats** — correct, wrong, and skipped counts update in real time
- **Question map** — clickable dot grid to jump to any question
- **2×2 option grid** — color-coded feedback on answer selection (green = correct, red = wrong)
- Auto-advances to next question 1.1s after an answer is selected
- Previous / Next navigation with dot progress strip
- "See Results" shortcut appears once all questions are touched

### 🏆 Results Page
- Animated SVG score ring fills to the user's percentage
- Dynamic feedback message and emoji based on performance tier
- Stats breakdown: correct, wrong, skipped, accuracy, gems earned, category
- Full answer review list with color-coded left-border per item
- Restart (reshuffles questions), Share, and Back to Home actions
- Gems awarded: **+10 💎 per correct answer**, synced to the header badge

### 📊 Leaderboard Page
- Top 10 players with medal icons for top 3 (🥇🥈🥉)
- Gradient row highlights for podium positions
- Shows name, ID, score, gems, and top category per player

### Across All Pages
- Sticky site header with logo, nav links, gem badge, and user pill
- Hamburger menu collapses nav on mobile (tap-outside closes)
- Toast notifications for timer expiry, clipboard copy, etc.

---

## 🗂️ Project Structure

```
quiz-web-app/
│
├── index.html          ← Single HTML file; all pages rendered as <section> blocks
│
├── css/
│   └── style.css       ← All styles: tokens, layout, components, responsive breakpoints
│
└── js/
    ├── data.js         ← Question bank (60 questions), category metadata, leaderboard seed
    └── app.js          ← All application logic: navigation, quiz engine, timer, rendering
```

### Why this structure?

| Concern | File |
|---|---|
| Content & markup | `index.html` |
| Visual design & responsiveness | `css/style.css` |
| Static data (questions, categories) | `js/data.js` |
| Business logic & DOM interactions | `js/app.js` |

Separating `data.js` from `app.js` means the question bank can be updated, expanded, or swapped out without touching any application logic — a pattern that mirrors how a real front-end would consume an API.

---

## 📖 Question Bank

| Category | Questions | Topics Covered |
|---|---|---|
| 🌐 HTML | 12 | Semantics, attributes, HTML5 elements, forms |
| ⚡ JavaScript | 12 | Types, closures, DOM, arrays, ES6+ features |
| ⚛️ React | 12 | JSX, Hooks, Virtual DOM, component lifecycle |
| ⚙️ C++ | 12 | Pointers, OOP, memory management, syntax |
| 🐍 Python | 12 | Data types, functions, exceptions, builtins |

**Total: 60 questions** across 5 categories. Each question object contains:

```js
{
  q:    'Who is making the Web standards?',          // question text
  opts: ['W3C', 'Microsoft', 'Mozilla', 'Google'],   // 4 options
  ans:  0                                            // correct index (0-based)
}
```

Questions are **shuffled on every quiz start** using a Fisher-Yates algorithm, so no two sessions are identical.

---

## 🎮 How to Use

1. **Open** `index.html` in any browser
2. **Home page** — browse categories or recent activity
3. **Click any category** or press "Quizzes" in the nav to open the category selector
4. **Select a topic** — the card highlights and the Start button enables
5. **Start Quiz** — the 30-second timer begins immediately
6. **Select an answer** — instant color feedback; auto-advances after 1.1s
7. **Navigate freely** — use Previous / Next or click any dot in the sidebar map
8. **Finish** — view your score ring, answer review, and earned gems
9. **Restart** — reshuffles all questions for a fresh attempt

---

## 📐 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `> 1024px` | Full two-column quiz layout, hero with card stack visual |
| `≤ 1024px` | Single-column quiz, hero visual hidden, leaderboard gems column hidden |
| `≤ 768px` | Nav collapses to hamburger, 2-col option grid → 1-col, sidebar stacks below |
| `≤ 480px` | Compact header, single-column grids throughout, dot strip hidden |

---

## 🧩 JavaScript Architecture

`app.js` is organized into **9 clearly commented modules**:

```
1. State Management     — centralised STATE object + setState() patcher
2. Navigation           — navigateTo(key) shows/hides page sections
3. Render: Home         — category strip + recent activity grid
4. Render: Category     — card grid + preselectCategory()
5. Quiz Engine          — startQuiz(), renderQuestion(), handleAnswer()
6. Timer                — startTimer(), updateTimerUI(), onTimerExpired()
7. Render: Results      — score ring animation, stats, answer review list
8. Render: Leaderboard  — medal rows, podium highlights
9. Helpers              — shuffle(), showToast(), shareScore(), setEl()
```

### State shape

```js
const STATE = {
  selectedCatKey: null,   // active category key
  questions:      [],     // shuffled question array
  currentIndex:   0,      // active question (0-based)
  answers:        [],     // null | 0-3 | -1 (timed out)
  correctCount:   0,      // running tally
  timerInterval:  null,   // setInterval handle
  timerSec:       30,     // seconds remaining
  TIMER_MAX:      30,     // seconds per question
  quizStartTime:  null,   // session start timestamp
  gemsTotal:      160,    // user wallet
};
```

All mutations go through `setState(patch)` — no stray global assignments.

---

## ⚙️ Technical Decisions

| Decision | Rationale |
|---|---|
| Vanilla JS only | Task requirement; demonstrates core language proficiency without framework abstraction |
| Single `index.html` with `<section>` pages | Avoids a router dependency; `display:none/block` transitions serve the same UX |
| `data.js` separate from `app.js` | Clean separation; data can be replaced with a `fetch()` call to an API with zero logic changes |
| CSS custom properties for tokens | Single source of truth for all colors, radii, and shadows |
| Fisher-Yates shuffle on every start | Guarantees true randomness; prevents pattern memorisation |
| `answers[-1]` sentinel for timeout | Distinguishes "timed out" from "unanswered" without a separate array |
| `requestAnimationFrame` for score ring | Ensures the CSS transition fires after the element is in the DOM |

---


## 🌍 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome / Safari | ✅ Full |

Uses: CSS Grid, CSS Custom Properties, `fetch` (optional), `navigator.share` (optional — falls back to clipboard). No polyfills required for the target browsers above.

---

## ♿ Accessibility

- All interactive elements are keyboard-focusable with visible `:focus-visible` rings
- `aria-label` on icon-only buttons (back arrow, question map dots)
- `role="button"` + `tabindex="0"` on clickable `<div>` elements
- `prefers-reduced-motion` media query disables all animations for users who opt out
- Colour contrast ratios meet WCAG AA for all text/background combinations

---

## 🚀 Getting Started (for reviewers)

```bash
# No install, no build step — just open the file
cd quiz-web-app
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or drag `index.html` into any browser window.


---

## 👨‍💻 Intern Details

| Field | Detail |
|---|---|
| **Name** | Rehan Tariq |
| **Department** | Web Development |
| **Organization** | QWETRUM Technologies |
| **Task** | Interactive Quiz Web Application |
| **Stack** | HTML5 · CSS3 · Vanilla JavaScript |

---

*Built with care as part of the QWETRUM Technologies Web Development Internship Program.*
