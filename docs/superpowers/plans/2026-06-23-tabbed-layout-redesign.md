# Tabbed Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all 33 session pages from single-long-scroll to tabbed layout (Learn | Lab | Quiz) with interactive quiz, copy buttons, scroll-spy sidebar, and mobile responsiveness.

**Architecture:** Pure HTML/CSS/JS. No build step. A Python transform script handles bulk restructuring of 33 session HTML files. New `session.js` handles tab switching, clipboard, quiz scoring, and scroll-spy. CSS is rewritten for session styles while preserving landing/section styles.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6), Python 3 (transform script only)

---

## File Structure

```
openrouter-mastery/
├── assets/
│   ├── css/styles.css            MODIFY — rewrite session styles, keep landing styles
│   └── js/
│       ├── progress.js           MODIFY — minor: emit event on completion change
│       └── session.js            CREATE — tabs, copy, quiz, scroll-spy, progress
├── index.html                    MODIFY — track accent colors, favicon
├── sections/
│   ├── beginner.html             MODIFY — track accent color
│   ├── intermediate.html         MODIFY — track accent color
│   └── expert.html               MODIFY — track accent color
├── sessions/
│   ├── beginner/*.html           MODIFY — all 10, restructured to tab layout
│   ├── intermediate/*.html       MODIFY — all 11, restructured to tab layout
│   └── expert/*.html             MODIFY — all 12, restructured to tab layout
└── transform.py                  CREATE — one-time script to restructure session HTML
```

---

### Task 1: Create transform.py — batch script to restructure session pages

**Files:**
- Create: `transform.py`

- [ ] **Step 1: Write the transform script**

```python
#!/usr/bin/env python3
"""Transform all 33 session HTML files from single-scroll to tabbed layout.

Reads each file, finds the Learn/Lab/Quiz sections, wraps them in tab-content
divs, adds the tab bar, removes old page nav, transforms quiz <details> answers
into data-correct attributes, and writes the output.
"""

import re
import os
import glob
from html.parser import HTMLParser

SESSION_DIR = os.path.join(os.path.dirname(__file__), "sessions")

def transform_quiz(html):
    """Replace <details> answer reveals with data-correct attributes on labels."""
    # Pattern: <li class="quiz-question">...<label><input...> A) text</label>...
    # ...<details><summary>Answer</summary><p>B) ...</p></details></li>
    
    def replace_answer(m):
        block = m.group(0)
        # Extract correct answer letter from <details>
        details_match = re.search(r'<details>.*?<summary>\s*Answer\s*</summary>\s*<p>\s*([A-D])\s*\)', block, re.DOTALL)
        if not details_match:
            return block
        correct = details_match.group(1)
        # Remove the <details> block
        block = re.sub(r'<details>.*?</details>', '', block, flags=re.DOTALL)
        # Add data-correct to the matching label
        block = re.sub(
            rf'(<label[^>]*>.*?<input[^>]*>.*?\b{re.escape(correct)}\b\s*\).*?</label>)',
            r'<label data-correct="true">\1</label>',
            block
        )
        return block
    
    # Match each quiz question li
    html = re.sub(
        r'<li[^>]*class="quiz-question"[^>]*>.*?(?=<li class="quiz-question"|</ol>|</div>\s*</section>)',
        replace_answer,
        html,
        flags=re.DOTALL
    )
    return html


def add_tab_structure(html):
    """Wrap Learn/Lab/Quiz sections in tab-content divs and add tab bar."""
    # Find the main content after breadcrumb and title
    # The structure is: ...<div class="session-meta">...</div>... then sections
    
    # Remove old page-nav (sticky Learn/Lab/Quiz anchors)
    html = re.sub(
        r'<nav class="page-nav">.*?</nav>',
        '',
        html,
        flags=re.DOTALL
    )
    
    # Add tab bar after session meta
    tab_bar = '''<div class="tab-bar" role="tablist">
  <button class="tab-btn active" role="tab" aria-selected="true" data-tab="learn" onclick="switchTab('learn')">📖 Learn</button>
  <button class="tab-btn" role="tab" aria-selected="false" data-tab="lab" onclick="switchTab('lab')">🔬 Lab</button>
  <button class="tab-btn" role="tab" aria-selected="false" data-tab="quiz" onclick="switchTab('quiz')">📝 Quiz</button>
</div>'''
    
    # Wrap each section in tab-content
    # Learn section
    html = re.sub(
        r'(<section id="learn"[^>]*>.*?</section>)',
        r'<div id="tab-learn" class="tab-content active" role="tabpanel">\1</div>',
        html,
        flags=re.DOTALL
    )
    # Lab section
    html = re.sub(
        r'(<section id="lab"[^>]*>.*?</section>)',
        r'<div id="tab-lab" class="tab-content" role="tabpanel">\1</div>',
        html,
        flags=re.DOTALL
    )
    # Quiz section
    html = re.sub(
        r'(<section id="quiz"[^>]*>.*?</section>)',
        r'<div id="tab-quiz" class="tab-content" role="tabpanel">\1</div>',
        html,
        flags=re.DOTALL
    )
    
    # Insert tab bar before the first tab-content
    html = re.sub(
        r'(<div id="tab-learn")',
        tab_bar + r'\1',
        html
    )
    
    return html


def add_session_js_link(html):
    """Add session.js script tag if not present."""
    if 'session.js' not in html:
        html = html.replace(
            '<script src="../../assets/js/progress.js"></script>',
            '<script src="../../assets/js/progress.js"></script>\n<script src="../../assets/js/session.js"></script>'
        )
    return html


def main():
    patterns = [
        os.path.join(SESSION_DIR, "beginner", "*.html"),
        os.path.join(SESSION_DIR, "intermediate", "*.html"),
        os.path.join(SESSION_DIR, "expert", "*.html"),
    ]
    
    for pattern in patterns:
        for filepath in glob.glob(pattern):
            print(f"Processing: {filepath}")
            with open(filepath, "r") as f:
                html = f.read()
            
            html = transform_quiz(html)
            html = add_tab_structure(html)
            html = add_session_js_link(html)
            
            with open(filepath, "w") as f:
                f.write(html)
            
            print(f"  Done: {os.path.basename(filepath)}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify the script parses correctly**

Run: `python3 -c "import ast; ast.parse(open('/Users/apanchanana/Openrouter mastery/openrouter-mastery/transform.py').read()); print('Syntax OK')"`
Expected: `Syntax OK`

- [ ] **Step 3: Commit**

```bash
git add transform.py
git commit -m "feat: add transform script for tabbed layout migration"
```

---

### Task 2: Rewrite `styles.css` — add session tab styles

**Files:**
- Modify: `assets/css/styles.css`

- [ ] **Step 1: Add CSS variables for track colors**

Add to `:root`:
```css
:root {
  --track-beginner: #6A3DE8;
  --track-intermediate: #F59E0B;
  --track-expert: #10B981;
  --tab-learn-bg: #FFFFFF;
  --tab-lab-bg: #FFF7ED;
  --tab-lab-border: #FED7AA;
  --tab-quiz-bg: #ECFDF5;
  --tab-quiz-border: #A7F3D0;
}
```

- [ ] **Step 2: Add tab bar styles**

Add after the `:root` block:
```css
/* === TABBED LAYOUT === */
.tab-bar {
  display: flex;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  margin-bottom: 1.5rem;
  background: var(--off-bg);
  position: sticky;
  top: 56px;
  z-index: 50;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  background: rgba(106, 61, 232, 0.05);
  color: var(--text);
}

.tab-btn.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

.tab-content {
  display: none;
  animation: fadeIn 0.25s ease;
}

.tab-content.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Add Lab tab distinct styles**

```css
/* === LAB TAB === */
#tab-lab .session-content {
  background: var(--tab-lab-bg);
  border: 1px solid var(--tab-lab-border);
  border-radius: 10px;
  padding: 1.5rem;
}

#tab-lab h2 {
  color: #C2410C;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

#tab-lab .lab-step {
  background: #fff;
  border: 1px solid var(--tab-lab-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

#tab-lab .lab-step h3 {
  color: #9A3412;
  font-size: 1rem;
}
```

- [ ] **Step 4: Add Quiz tab distinct styles**

```css
/* === QUIZ TAB === */
#tab-quiz .session-content {
  background: var(--tab-quiz-bg);
  border: 1px solid var(--tab-quiz-border);
  border-radius: 10px;
  padding: 1.5rem;
}

#tab-quiz h2 {
  color: #047857;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.quiz-question {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  list-style: none;
}

.quiz-question p {
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.quiz-question label {
  display: block;
  padding: 0.6rem 0.75rem;
  margin: 0.25rem 0;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.9rem;
}

.quiz-question label:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.quiz-question label.correct {
  background: #D1FAE5;
  border-color: #10B981;
}

.quiz-question label.wrong {
  background: #FEE2E2;
  border-color: #EF4444;
}

.quiz-submit {
  display: inline-block;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.quiz-submit:hover {
  background: var(--primary-dark);
}

.quiz-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz-score {
  display: inline-block;
  background: #D1FAE5;
  color: #047857;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.quiz-reset {
  background: transparent;
  color: var(--text-light);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.quiz-reset:hover {
  background: var(--off-bg);
}
```

- [ ] **Step 5: Add callout box styles**

```css
/* === CALLOUT BOXES === */
.callout {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid;
  font-size: 0.9rem;
}

.callout.note {
  background: #EFF6FF;
  border-left-color: #3B82F6;
}

.callout.tip {
  background: #F0FDF4;
  border-left-color: #22C55E;
}

.callout.warning {
  background: #FFFBEB;
  border-left-color: #F59E0B;
}

.callout strong:first-child {
  display: block;
  margin-bottom: 0.25rem;
}
```

- [ ] **Step 6: Add code block copy button styles**

```css
/* === CODE BLOCKS === */
.code-block-wrapper {
  position: relative;
  margin: 1rem 0;
}

.code-block-wrapper pre {
  border-radius: 8px;
  overflow-x: auto;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255,255,255,0.1);
  color: #D1D5DB;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.code-block-wrapper:hover .copy-btn {
  opacity: 1;
}

.copy-btn.copied {
  background: #10B981;
  color: #fff;
  border-color: #10B981;
}
```

- [ ] **Step 7: Add Learn tab sidebar styles**

```css
/* === LEARN SIDEBAR === */
.learn-layout {
  display: flex;
  gap: 2rem;
}

.learn-content {
  flex: 3;
  min-width: 0;
}

.learn-sidebar {
  flex: 1;
  min-width: 200px;
  position: sticky;
  top: 120px;
  align-self: flex-start;
  background: var(--off-bg);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
}

.learn-sidebar h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.learn-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.learn-sidebar li {
  padding: 0.35rem 0;
  border-left: 2px solid transparent;
  padding-left: 0.75rem;
  margin-bottom: 0.15rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-light);
}

.learn-sidebar li:hover {
  color: var(--primary);
}

.learn-sidebar li.active {
  color: var(--primary);
  border-left-color: var(--primary);
  font-weight: 500;
}
```

- [ ] **Step 8: Add mobile responsive styles**

```css
/* === MOBILE === */
@media (max-width: 768px) {
  .tab-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    border-radius: 8px;
  }

  .tab-bar::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex: 0 0 auto;
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .learn-layout {
    flex-direction: column;
  }

  .learn-sidebar {
    position: static;
    margin-bottom: 1rem;
  }

  .learn-sidebar h4 {
    cursor: pointer;
  }

  .learn-sidebar ul {
    display: none;
  }

  .learn-sidebar.open ul {
    display: block;
  }

  .code-block-wrapper pre {
    font-size: 0.75rem;
  }

  .quiz-question {
    padding: 0.75rem;
  }

  .quiz-question label {
    padding: 0.75rem;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .copy-btn {
    opacity: 1;
    padding: 0.3rem 0.6rem;
  }

  #tab-lab .session-content,
  #tab-quiz .session-content {
    padding: 1rem;
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add assets/css/styles.css
git commit -m "feat: add tab-based session layout styles"
```

---

### Task 3: Create `session.js` — tab logic, quiz, copy, scroll-spy

**Files:**
- Create: `assets/js/session.js`

- [ ] **Step 1: Write the session.js file**

```javascript
// Session page interactivity: tabs, quiz, copy buttons, scroll-spy sidebar

(function() {
  'use strict';

  // === TAB SWITCHING ===
  window.switchTab = function(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    const target = document.getElementById('tab-' + tabName);
    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    if (target) target.classList.add('active');
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }

    // Scroll to top of tab content
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
      const offset = tabBar.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // Save preference
    try {
      localStorage.setItem('openrouter-last-tab', tabName);
    } catch(e) {}
  };

  // Restore last-used tab on page load
  function restoreTab() {
    try {
      const last = localStorage.getItem('openrouter-last-tab');
      if (last && document.getElementById('tab-' + last)) {
        switchTab(last);
      }
    } catch(e) {}
  }

  // === QUIZ ===
  let quizSubmitted = false;

  function setupQuiz() {
    const quizSection = document.getElementById('tab-quiz');
    if (!quizSection) return;

    const questions = quizSection.querySelectorAll('.quiz-question');
    if (questions.length === 0) return;

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'quiz-submit';
    submitBtn.textContent = 'Submit & Check';
    submitBtn.onclick = checkQuiz;

    const resetBtn = document.createElement('button');
    resetBtn.className = 'quiz-reset';
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = resetQuiz;
    resetBtn.style.display = 'none';

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'quiz-score';
    scoreDisplay.style.display = 'none';

    const buttonRow = document.createElement('div');
    buttonRow.style.marginTop = '1rem';
    buttonRow.appendChild(scoreDisplay);
    buttonRow.appendChild(submitBtn);
    buttonRow.appendChild(resetBtn);

    const quizInner = quizSection.querySelector('.session-content') || quizSection;
    quizInner.appendChild(buttonRow);
  }

  function checkQuiz() {
    if (quizSubmitted) return;
    const quizSection = document.getElementById('tab-quiz');
    if (!quizSection) return;

    const questions = quizSection.querySelectorAll('.quiz-question');
    let score = 0;

    questions.forEach((q, idx) => {
      const labels = q.querySelectorAll('label');
      const inputs = q.querySelectorAll('input[type="radio"]');

      let answered = false;
      labels.forEach((label, i) => {
        const input = inputs[i];
        if (input.checked) {
          answered = true;
          if (label.hasAttribute('data-correct')) {
            label.classList.add('correct');
            score++;
          } else {
            label.classList.add('wrong');
          }
        }
        // Show correct answer
        if (label.hasAttribute('data-correct')) {
          label.classList.add('correct');
        }
        // Disable further changes
        input.disabled = true;
      });

      // Highlight unanswered questions
      if (!answered) {
        q.style.borderColor = '#EF4444';
      }
    });

    quizSubmitted = true;

    const submitBtn = quizSection.querySelector('.quiz-submit');
    if (submitBtn) submitBtn.disabled = true;

    const resetBtn = quizSection.querySelector('.quiz-reset');
    if (resetBtn) resetBtn.style.display = 'inline-block';

    const scoreDisplay = quizSection.querySelector('.quiz-score');
    if (scoreDisplay) {
      scoreDisplay.style.display = 'inline-block';
      scoreDisplay.textContent = `Score: ${score} / ${questions.length}`;
    }
  }

  function resetQuiz() {
    quizSubmitted = false;
    const quizSection = document.getElementById('tab-quiz');
    if (!quizSection) return;

    const questions = quizSection.querySelectorAll('.quiz-question');
    questions.forEach(q => {
      q.style.borderColor = '';
      const labels = q.querySelectorAll('label');
      const inputs = q.querySelectorAll('input[type="radio"]');
      labels.forEach((label, i) => {
        label.classList.remove('correct', 'wrong');
        inputs[i].disabled = false;
        inputs[i].checked = false;
      });
    });

    const submitBtn = quizSection.querySelector('.quiz-submit');
    if (submitBtn) submitBtn.disabled = false;

    const resetBtn = quizSection.querySelector('.quiz-reset');
    if (resetBtn) resetBtn.style.display = 'none';

    const scoreDisplay = quizSection.querySelector('.quiz-score');
    if (scoreDisplay) scoreDisplay.style.display = 'none';
  }

  // === COPY BUTTONS ===
  function addCopyButtons() {
    document.querySelectorAll('.code-block-wrapper pre').forEach(pre => {
      const wrapper = pre.parentElement;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.onclick = function() {
        const code = pre.textContent || pre.innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      };
      wrapper.appendChild(btn);
    });
  }

  // === SIDEBAR SCROLL-SPY ===
  function setupScrollSpy() {
    const sidebar = document.querySelector('.learn-sidebar ul');
    if (!sidebar) return;

    const headings = document.querySelectorAll('#tab-learn h2, #tab-learn h3');
    if (headings.length === 0) {
      sidebar.parentElement.style.display = 'none';
      return;
    }

    // Build sidebar items
    headings.forEach(h => {
      const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      h.id = id;
      const li = document.createElement('li');
      li.textContent = h.textContent;
      li.dataset.target = id;
      li.style.cursor = 'pointer';
      li.onclick = function() {
        const target = document.getElementById(this.dataset.target);
        if (target) {
          const offset = target.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      };
      if (h.tagName === 'H3') {
        li.style.paddingLeft = '1.25rem';
        li.style.fontSize = '0.8rem';
      }
      sidebar.appendChild(li);
    });

    // Scroll spy
    let ticking = false;
    function updateActive() {
      const items = sidebar.querySelectorAll('li');
      let current = items[0];
      headings.forEach((h, i) => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 150) {
          current = items[i];
        }
      });
      items.forEach(li => li.classList.remove('active'));
      if (current) current.classList.add('active');
    }

    document.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    });
    updateActive();

    // Mobile toggle
    const sidebarTitle = sidebar.parentElement.querySelector('h4');
    if (sidebarTitle && window.innerWidth <= 768) {
      sidebarTitle.onclick = function() {
        sidebar.parentElement.classList.toggle('open');
      };
    }
  }

  // === INIT ===
  document.addEventListener('DOMContentLoaded', function() {
    restoreTab();
    setupQuiz();
    addCopyButtons();
    setupScrollSpy();
  });

})();
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/session.js
git commit -m "feat: add session.js with tabs, quiz, copy buttons, scroll-spy"
```

---

### Task 4: Run transform script on all 33 session files

**Files:**
- Modify: `sessions/beginner/01-what-is-openrouter.html` through `sessions/expert/33-expert-capstone.html` (33 files)

- [ ] **Step 1: Run the transform script**

Run: `python3 transform.py`

Expected output:
```
Processing: .../sessions/beginner/01-what-is-openrouter.html
  Done: 01-what-is-openrouter.html
...
Processing: .../sessions/expert/33-expert-capstone.html
  Done: 33-expert-capstone.html
```

- [ ] **Step 2: Verify one transformed file**

Run: `grep -c 'tab-bar\|tab-content\|data-correct\|session.js' sessions/beginner/04-your-first-api-call.html`
Expected: count >= 3 (tab-bar, tab-content elements, session.js reference all present)

- [ ] **Step 3: Commit**

```bash
git add sessions/
git commit -m "feat: restructure all 33 session pages to tabbed layout"
```

---

### Task 5: Polish quiz HTML — ensure data-correct alignment

**Files:**
- Review and fix: `sessions/*/*.html` (33 files)

- [ ] **Step 1: Check quiz data-correct correctness**

The transform script should have converted quiz `<details>` answer reveals to `data-correct="true"` attributes. 
Run: `grep -c 'data-correct' sessions/*/*.html | sort`
Expected: each file should have at least 5 occurrences (one per quiz question)

- [ ] **Step 2: Spot-check 3 sessions (one per track)**

Open these files and verify the first quiz question has the right `data-correct`:
- `sessions/beginner/01-what-is-openrouter.html`
- `sessions/intermediate/11-structured-outputs-json-schema.html`
- `sessions/expert/22-cost-optimization.html`

Each question should have exactly one `<label data-correct="true">`.

- [ ] **Step 3: Commit fixes if any**

```bash
git add sessions/
git commit -m "fix: correct quiz answer markers in session files"
```

---

### Task 6: Polish landing and section pages

**Files:**
- Modify: `index.html`
- Modify: `sections/beginner.html`
- Modify: `sections/intermediate.html`
- Modify: `sections/expert.html`

- [ ] **Step 1: Add track accent colors to index.html**

In `index.html`, add `style="--track-color: #6A3DE8"` to the Beginner track card, `--track-color: #F59E0B` to Intermediate, `--track-color: #10B981` to Expert.

Find the three track card divs and add a data attribute:
```html
<div class="track-card" data-track="beginner" style="--track-accent: #6A3DE8">
```

```html
<div class="track-card" data-track="intermediate" style="--track-accent: #F59E0B">
```

```html
<div class="track-card" data-track="expert" style="--track-accent: #10B981)">
```

- [ ] **Step 2: Add accent border to track cards in CSS**

Add to `styles.css`:
```css
.track-card[data-track="beginner"] { border-top: 3px solid var(--track-beginner); }
.track-card[data-track="intermediate"] { border-top: 3px solid var(--track-intermediate); }
.track-card[data-track="expert"] { border-top: 3px solid var(--track-expert); }
```

- [ ] **Step 3: Add favicon link to index.html**

```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔀</text></svg>">
```

Add this to the `<head>` section after the viewport meta tag.

- [ ] **Step 4: Commit**

```bash
git add index.html sections/ assets/css/styles.css
git commit -m "feat: add track accent colors and favicon"
```

---

### Task 7: Code block wrapper fix — ensure pre blocks have wrapper

**Files:**
- Modify: `assets/js/session.js`

- [ ] **Step 1: Update copy button logic to wrap bare pre blocks**

The current session.js assumes `.code-block-wrapper` exists. But the existing HTML has bare `<pre><code>` blocks. Update the `addCopyButtons` function in `session.js` to first wrap bare pre blocks:

```javascript
function addCopyButtons() {
  // Wrap bare <pre> blocks in .code-block-wrapper
  document.querySelectorAll('#tab-learn pre, #tab-lab pre').forEach(pre => {
    if (!pre.parentElement.classList.contains('code-block-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }
  });

  // Add copy button to each wrapper
  document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
    if (wrapper.querySelector('.copy-btn')) return; // already has one
    const pre = wrapper.querySelector('pre');
    if (!pre) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = function() {
      const code = pre.textContent || pre.innerText;
      navigator.clipboard.writeText(code.trim()).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    };
    wrapper.appendChild(btn);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/session.js
git commit -m "fix: auto-wrap pre blocks for copy button"
```

---

### Task 8: Callout box standardization in session HTML

**Files:**
- Modify: `assets/js/session.js` or a separate transform step

- [ ] **Step 1: Convert existing note/tip/warning divs to callout format**

The existing session HTML uses `class="note"`, `class="tip"`, `class="warning"`. The new CSS uses `.callout.note`, `.callout.tip`, `.callout.warning`. 

Update the transform approach: add a small JS fixup that runs on page load to add the `.callout` class:

Add to session.js `DOMContentLoaded`:
```javascript
document.querySelectorAll('.note, .tip, .warning').forEach(el => {
  if (!el.classList.contains('callout')) {
    el.classList.add('callout');
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/session.js
git commit -m "fix: auto-add callout class to note/tip/warning elements"
```

---

### Task 9: Add on-page progress indicator to session pages

**Files:**
- Modify: `assets/js/session.js`

- [ ] **Step 1: Add progress bar to Learn tab**

Add to session.js `DOMContentLoaded`:
```javascript
function addProgressBar() {
  const learnTab = document.getElementById('tab-learn');
  const contentArea = learnTab ? learnTab.querySelector('.session-content') : null;
  if (!contentArea) return;

  try {
    const progress = JSON.parse(localStorage.getItem('openrouter-progress') || '{}');
    const completed = Object.keys(progress).filter(k => progress[k]).length;
    const total = 33;
    const pct = Math.round((completed / total) * 100);

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;padding:0.75rem 1rem;background:#F9FAFB;border-radius:8px;font-size:0.85rem;';

    const label = document.createElement('span');
    label.textContent = `Course progress: ${completed} / ${total} sessions`;
    label.style.cssText = 'color:#6B7280;white-space:nowrap;';

    const track = document.createElement('div');
    track.style.cssText = 'flex:1;height:8px;background:#E5E7EB;border-radius:4px;overflow:hidden;';

    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;width:${pct}%;background:linear-gradient(90deg,#6A3DE8,#8B5CF6);border-radius:4px;transition:width 0.5s ease;`;

    const pctLabel = document.createElement('span');
    pctLabel.textContent = `${pct}%`;
    pctLabel.style.cssText = 'color:#6B7280;font-weight:600;min-width:2.5rem;text-align:right;';

    track.appendChild(fill);
    bar.appendChild(label);
    bar.appendChild(track);
    bar.appendChild(pctLabel);
    contentArea.insertBefore(bar, contentArea.firstChild);
  } catch(e) {}
}
```

Then add `addProgressBar();` to the DOMContentLoaded call list.

- [ ] **Step 2: Commit**

```bash
git add assets/js/session.js
git commit -m "feat: add course progress bar to session pages"
```

---

### Self-Review Checklist

- [ ] **Spec coverage:** Tab switching (Task 3), Quiz interactive (Task 3 + Task 5), Copy buttons (Task 3), Scroll-spy sidebar (Task 3), Distinct section visuals (Task 2), Mobile responsive (Task 2 step 8), Favicon (Task 6)
- [ ] **Placeholder check:** All code blocks contain actual code. No TODOs or TBDs.
- [ ] **Type/name consistency:** `switchTab()`, `checkQuiz()`, `resetQuiz()`, `addCopyButtons()`, `setupScrollSpy()` all consistent with their use in HTML onclick and DOMContentLoaded.
