/* global localStorage, document */
// Apply saved theme before first paint to prevent flash of wrong theme.
// Must match the Zustand persist key format used by theme-store.ts.
;(function () {
  try {
    var stored = JSON.parse(localStorage.getItem('trove-theme') || '{}')
    var theme = (stored.state && stored.state.theme) || 'dark'
    if (theme === 'light') document.documentElement.dataset.theme = 'light'
  } catch { /* intentionally empty — fall back to dark theme */ }
})()
