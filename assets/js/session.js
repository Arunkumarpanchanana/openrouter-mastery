/**
 * OpenRouter Mastery — Session Page Interactivity
 * Tab switching, quiz, copy buttons, scroll-spy sidebar, progress bar, callout standardization
 */
(function() {
  'use strict';

  // ======================== TAB SWITCHING ========================

  function switchTab(tabName) {
    var tabContent = document.getElementById('tab-' + tabName);
    if (!tabContent) return;

    var tabs = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }
    tabContent.classList.add('active');

    var buttons = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < buttons.length; j++) {
      var btn = buttons[j];
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    }

    tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      localStorage.setItem('openrouter-last-tab', tabName);
    } catch (_) {}
  }

  window.switchTab = switchTab;

  // ======================== RESTORE LAST TAB ========================

  function restoreLastTab() {
    try {
      var lastTab = localStorage.getItem('openrouter-last-tab');
      if (lastTab && document.getElementById('tab-' + lastTab)) {
        switchTab(lastTab);
      }
    } catch (_) {}
  }

  // ======================== INTERACTIVE QUIZ ========================

  function buildQuiz() {
    var quizTab = document.getElementById('tab-quiz');
    if (!quizTab) return;
    var questions = quizTab.querySelectorAll('.quiz-question');
    if (questions.length === 0) return;

    var scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'quiz-score';
    scoreDisplay.style.cssText = 'margin-top: 1rem; font-weight: 600; display: none;';

    var controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 1.5rem; display: flex; gap: 0.5rem; align-items: center;';

    var submitBtn = document.createElement('button');
    submitBtn.id = 'quiz-submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Submit & Check';

    var resetBtn = document.createElement('button');
    resetBtn.id = 'quiz-reset';
    resetBtn.className = 'btn btn-outline';
    resetBtn.textContent = 'Reset';

    controls.appendChild(submitBtn);
    controls.appendChild(resetBtn);
    quizTab.appendChild(controls);
    quizTab.appendChild(scoreDisplay);

    submitBtn.addEventListener('click', function() {
      checkQuiz(questions, submitBtn, scoreDisplay);
    });

    resetBtn.addEventListener('click', function() {
      resetQuiz(questions, submitBtn, scoreDisplay);
    });
  }

  function checkQuiz(questions, submitBtn, scoreDisplay) {
    var score = 0;
    var total = questions.length;

    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var options = q.querySelectorAll('.quiz-option');
      var selected = q.querySelector('input[type="radio"]:checked');
      if (!selected) continue;

      var selectedLabel = selected.closest('.quiz-option');
      var isCorrect = selectedLabel && selectedLabel.dataset.correct === 'true';

      if (isCorrect) {
        selectedLabel.classList.add('correct');
        score++;
      } else {
        if (selectedLabel) {
          selectedLabel.classList.add('wrong');
        }

        for (var k = 0; k < options.length; k++) {
          if (options[k].dataset.correct === 'true') {
            options[k].classList.add('correct');
            break;
          }
        }
      }

      var inputs = q.querySelectorAll('input[type="radio"]');
      for (var m = 0; m < inputs.length; m++) {
        inputs[m].disabled = true;
      }
    }

    scoreDisplay.textContent = 'Score: ' + score + ' / ' + total;
    scoreDisplay.style.display = 'block';
    submitBtn.disabled = true;
  }

  function resetQuiz(questions, submitBtn, scoreDisplay) {
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var inputs = q.querySelectorAll('input[type="radio"]');
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].checked = false;
        inputs[j].disabled = false;
      }

      var labels = q.querySelectorAll('.quiz-option');
      for (var k = 0; k < labels.length; k++) {
        labels[k].classList.remove('correct', 'wrong');
      }
    }

    submitBtn.disabled = false;
    scoreDisplay.style.display = 'none';
  }

  // ======================== COPY BUTTONS ========================

  function initCopyButtons() {
    var tabLearn = document.getElementById('tab-learn');
    var tabLab = document.getElementById('tab-lab');
    var pres = [];

    if (tabLearn) {
      var p1 = tabLearn.querySelectorAll('pre');
      for (var i = 0; i < p1.length; i++) pres.push(p1[i]);
    }
    if (tabLab) {
      var p2 = tabLab.querySelectorAll('pre');
      for (var j = 0; j < p2.length; j++) pres.push(p2[j]);
    }

    for (var k = 0; k < pres.length; k++) {
      var pre = pres[k];
      if (pre.parentNode && pre.parentNode.classList.contains('code-block-wrapper')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', makeCopyHandler(pre, btn));
      wrapper.appendChild(btn);
    }
  }

  function makeCopyHandler(codeEl, btn) {
    return function() {
      var text = codeEl.textContent || '';
      copyToClipboard(text, btn);
    };
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopied(btn);
      }).catch(function() {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position: fixed; opacity: 0;';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (_) {}
    document.body.removeChild(textarea);
  }

  function showCopied(btn) {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  }

  // ======================== SCROLL-SPY SIDEBAR ========================

  function initScrollSpy() {
    var learnTab = document.getElementById('tab-learn');
    if (!learnTab) return;

    var sidebar = document.querySelector('.learn-sidebar');
    if (!sidebar) return;

    var headings = learnTab.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    var list = document.createElement('ul');
    var headingToggle = document.createElement('h4');
    headingToggle.textContent = 'On this page';
    headingToggle.style.cursor = 'pointer';

    var items = [];

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      h.id = id;

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent.trim();
      a.style.cssText = 'color: inherit; text-decoration: none; display: block;';

      if (h.tagName === 'H3') {
        li.style.paddingLeft = '1.5rem';
      }

      li.appendChild(a);
      li.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.querySelector('a').getAttribute('href').substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      list.appendChild(li);
      items.push({ el: li, id: id, heading: h });
    }

    sidebar.appendChild(headingToggle);
    sidebar.appendChild(list);

    headingToggle.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
      }
    });

    function updateActive() {
      var scrollY = window.scrollY;
      var activeId = null;

      for (var j = 0; j < items.length; j++) {
        var rect = items[j].heading.getBoundingClientRect();
        if (rect.top <= 150) {
          activeId = items[j].id;
        }
      }

      if (!activeId && items.length > 0) {
        activeId = items[items.length - 1].id;
        var lastRect = items[items.length - 1].heading.getBoundingClientRect();
        if (lastRect.top > 150 && items[0].heading.getBoundingClientRect().top > 150) {
          activeId = items[0].id;
        }
      }

      for (var k = 0; k < items.length; k++) {
        items[k].el.classList.toggle('active', items[k].id === activeId);
      }
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  // ======================== CALLOUT STANDARDIZATION ========================

  function standardizeCallouts() {
    var targets = document.querySelectorAll('.note, .tip, .warning');
    for (var i = 0; i < targets.length; i++) {
      if (!targets[i].classList.contains('callout')) {
        targets[i].classList.add('callout');
      }
    }
  }

  // ======================== PROGRESS BAR ========================

  function initProgressBar() {
    var container = document.querySelector('#tab-learn .session-content') || document.querySelector('#tab-learn');
    if (!container) return;

    var data = {};
    try {
      data = JSON.parse(localStorage.getItem('openrouter-progress') || '{}');
    } catch (_) {}

    var completed = 0;
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && data[key] === true) {
        completed++;
      }
    }

    var total = 33;
    var pct = Math.round((completed / total) * 100);

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 1.5rem;';

    var label = document.createElement('div');
    label.style.cssText = 'font-size: 0.85rem; color: #6B7280; margin-bottom: 0.5rem;';
    label.textContent = 'Course progress: ' + completed + ' / ' + total + ' sessions';

    var pctSpan = document.createElement('span');
    pctSpan.style.cssText = 'font-weight: 600; color: #6A3DE8; margin-left: 0.25rem;';
    pctSpan.textContent = pct + '%';
    label.appendChild(pctSpan);

    var track = document.createElement('div');
    track.style.cssText = 'height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;';

    var fill = document.createElement('div');
    fill.style.cssText = 'height: 100%; width: ' + pct + '%; background: linear-gradient(90deg, #6A3DE8, #8B5CF6); border-radius: 4px; transition: width 0.3s ease;';

    track.appendChild(fill);
    wrapper.appendChild(label);
    wrapper.appendChild(track);
    container.insertBefore(wrapper, container.firstChild);
  }

  // ======================== INIT ========================

  document.addEventListener('DOMContentLoaded', function() {
    restoreLastTab();
    buildQuiz();
    initCopyButtons();
    initScrollSpy();
    standardizeCallouts();
    initProgressBar();
  });

})();
