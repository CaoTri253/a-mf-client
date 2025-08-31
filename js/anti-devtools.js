/* Anti-DevTools v1.9 – relaxed (low false-positive) */
(function () {
  'use strict';

  // Do not run on anti_spam page itself
  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  // Absolute redirect to avoid /views/views duplication
  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;

  // Relaxed thresholds / checks
  var CHECK_INTERVAL = 600;   // check less frequently
  var SIZE_THRESHOLD = 300;   // larger threshold to reduce false positives

  var chkTimer = null;

  function hardRedirect() {
    try { window.stop && window.stop(); } catch (_) {}
    try { location.replace(REDIRECT); } catch (_) { location.href = REDIRECT; }
  }

  // Keep only the size-based heuristic and resize trigger
  function sizeHeuristicOpen() {
    var w = Math.abs(window.outerWidth - window.innerWidth);
    var h = Math.abs(window.outerHeight - window.innerHeight);
    return (w > SIZE_THRESHOLD) || (h > SIZE_THRESHOLD);
  }

  // Disable breakpoint & drift heuristics to avoid incidental triggers
  function isDevtoolsLikelyOpen() {
    try {
      if (sizeHeuristicOpen()) return true;
    } catch (_) {}
    return false;
  }

  // Block common devtools hotkeys (best-effort)
  function blockHotkeys(e) {
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.shiftKey && ['I','J','C'].indexOf(e.key.toUpperCase()) >= 0) { e.preventDefault(); e.stopPropagation(); return false; }
    if (ctrl && e.key.toUpperCase() === 'U') { e.preventDefault(); e.stopPropagation(); return false; }
  }
  window.addEventListener('keydown', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keypress', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keyup', blockHotkeys, {capture:true, passive:false});

  // React immediately on large layout change (dock devtools)
  window.addEventListener('resize', function () {
    if (sizeHeuristicOpen()) hardRedirect();
  }, {passive:true});

  // Periodic check (relaxed)
  function tick() {
    if (isDevtoolsLikelyOpen()) {
      hardRedirect();
    }
  }
  chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

  // Note: does not touch window.API_BASE or any app globals.
})();