/* Anti-DevTools v2.0 – relaxed + DOM scramble */
(function () {
  'use strict';

  // Do not run on anti_spam page itself
  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  // Absolute redirect to avoid /views/views duplication
  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;

  // Relaxed thresholds / checks
  var CHECK_INTERVAL = 600;   // check less frequently
  var SIZE_THRESHOLD = 300;   // larger threshold to reduce false positives

  // --- Scramble: replace entire DOM with junk characters
  function scrambleHtml(){
    try {
      var junk = "";
      for (var i = 0; i < 1200; i++) {
        junk += String.fromCharCode(0x2580 + Math.floor(Math.random()*128));
        if (i % 80 === 79) junk += "\\n";
      }
      // Minimal safe HTML to avoid CSP/style issues
      var css = "body{background:#0b0e13;color:#00f89c;margin:0;font:14px/1.3 monospace}pre{white-space:pre-wrap;word-break:break-all;padding:16px}";
      var scrambled = "<!doctype html><html><head><meta charset='utf-8'><title>…</title><style>"+css+"</style></head><body><pre>"+junk+"</pre></body></html>";
      document.open(); document.write(scrambled); document.close();
    } catch(_) {}
  }

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
    // Ctrl/Cmd+Shift+I/J/C -> prevent & scramble as deterrent
    if (ctrl && e.shiftKey && ['I','J','C'].indexOf(e.key.toUpperCase()) >= 0) {
      e.preventDefault(); e.stopPropagation(); scrambleHtml(); return false;
    }
    // Ctrl/Cmd+U (View Source) -> prevent & scramble
    if (ctrl && e.key.toUpperCase() === 'U') {
      e.preventDefault(); e.stopPropagation(); scrambleHtml(); return false;
    }
  }
  window.addEventListener('keydown', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keypress', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keyup', blockHotkeys, {capture:true, passive:false});

  // React immediately on large layout change (dock devtools)
  window.addEventListener('resize', function () {
    if (sizeHeuristicOpen()) {
      // Option A: scramble instead of redirect for maximum annoyance
      scrambleHtml();
      // Option B (fallback): redirect
      // hardRedirect();
    }
  }, {passive:true});

  // Periodic check (relaxed)
  function tick() {
    if (isDevtoolsLikelyOpen()) {
      scrambleHtml();
      // hardRedirect();
    }
  }
  var chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

  // Note: does not touch window.API_BASE or any app globals.
})();