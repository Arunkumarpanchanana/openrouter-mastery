/**
 * OpenRouter Mastery — Progress Tracker
 * Uses localStorage to track completed sessions across devices/tabs
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'openrouter_mastery_progress';
  const TOTAL_SESSIONS = 33;

  function getProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function getCompletedCount() {
    const progress = getProgress();
    return Object.values(progress).filter(Boolean).length;
  }

  function isCompleted(sessionId) {
    return !!getProgress()[sessionId];
  }

  function toggleSession(sessionId) {
    const progress = getProgress();
    progress[sessionId] = !progress[sessionId];
    saveProgress(progress);
    updateAllUI();
    return progress[sessionId];
  }

  function updateAllUI() {
    const completed = getCompletedCount();
    const pct = TOTAL_SESSIONS > 0 ? Math.round((completed / TOTAL_SESSIONS) * 100) : 0;

    // Update progress bar
    document.querySelectorAll('.progress-bar-fill').forEach(el => {
      el.style.width = pct + '%';
    });

    document.querySelectorAll('.progress-text').forEach(el => {
      el.textContent = completed + ' / ' + TOTAL_SESSIONS;
    });

    document.querySelectorAll('.progress-pct').forEach(el => {
      el.textContent = pct + '%';
    });

    // Update completion checkboxes
    document.querySelectorAll('[data-session-id]').forEach(el => {
      const sid = el.dataset.sessionId;
      const done = isCompleted(sid);
      if (el.type === 'checkbox') {
        el.checked = done;
      }
      if (el.classList.contains('completion-toggle')) {
        el.classList.toggle('completed', done);
        const label = el.querySelector('.toggle-label');
        if (label) {
          label.textContent = done ? 'Completed ✓' : 'Mark as complete';
        }
      }
    });

    // Update session cards
    document.querySelectorAll('.session-card[data-session-id]').forEach(el => {
      el.classList.toggle('completed', isCompleted(el.dataset.sessionId));
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function() {
    updateAllUI();

    // Bind completion toggles
    document.addEventListener('click', function(e) {
      const toggle = e.target.closest('.completion-toggle');
      if (!toggle) return;

      const sessionId = toggle.dataset.sessionId;
      if (sessionId) {
        toggleSession(sessionId);
        e.preventDefault();
      }
    });

    // Bind checkbox changes inside completion toggles
    document.addEventListener('change', function(e) {
      if (e.target.matches('.completion-toggle input[type="checkbox"]')) {
        const toggle = e.target.closest('.completion-toggle');
        const sessionId = toggle && toggle.dataset.sessionId;
        if (sessionId) {
          // Let the click handler above handle it
        }
      }
    });
  });

  // Expose for debugging
  window.ORM = {
    getProgress,
    saveProgress,
    getCompletedCount,
    isCompleted,
    toggleSession,
    TOTAL_SESSIONS
  };
})();
