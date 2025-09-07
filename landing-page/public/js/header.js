// File: landing-page/public/js/header.js
// Accessible, modular header controller for Host Helper Ai
// - Injects scroll state, manages mobile disclosure, and focus trapping
// - Keeps API minimal and readable

(function () {
  /** Utility: toggle hidden attribute */
  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) {
      el.setAttribute('hidden', '');
    } else {
      el.removeAttribute('hidden');
    }
  }

  /** Manage sticky header "scrolled" state for legibility */
  function setupScrollState() {
    var header = document.querySelector('.hh-header');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Mobile disclosure menu: ARIA + focus management */
  function setupMobileMenu() {
    var toggle = document.getElementById('hh-toggle');
    var panel = document.getElementById('hh-mobile-menu');
    if (!toggle || !panel) return;

    var firstFocusable = null;
    var lastFocusable = null;

    function cacheFocusables() {
      var focusables = panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      firstFocusable = focusables[0] || null;
      lastFocusable = focusables[focusables.length - 1] || null;
    }

    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      setHidden(panel, false);
      cacheFocusables();
      if (firstFocusable) firstFocusable.focus();
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('click', onClickOutside);
    }

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      setHidden(panel, true);
      toggle.focus();
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onClickOutside);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key === 'Tab') {
        // Trap focus inside the panel
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          if (lastFocusable) lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          if (firstFocusable) firstFocusable.focus();
        }
      }
    }

    function onClickOutside(e) {
      if (!panel.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
  }

  // Public init so we can run after template injection
  function init() {
    setupScrollState();
    setupMobileMenu();
  }

  // Expose for template loader
  window.hhHeaderInit = init;

  // Auto-run on DOM ready (in case template is already present in SSR/static)
  document.addEventListener('DOMContentLoaded', init);
})();


