/* Anti-DevTools v2.1 – scramble + redirect */
(function () {
  'use strict';

  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;
  var CHECK_INTERVAL = 600;
  var SIZE_THRESHOLD = 300;

  // --- Scramble the DOM with junk characters
  function scrambleHtml(){
    try {
      var junk = "";
      for (var i = 0; i < 1200; i++) {
        junk += String.fromCharCode(0x2580 + Math.floor(Math.random()*128));
        if (i % 80 === 79) junk += "\\n";
      }
      var css = "body{background:#0b0e13;color:#00f89c;margin:0;font:14px/1.3 monospace}pre{white-space:pre-wrap;word-break:break-all;padding:16px}";
      var scrambled = "<!doctype html><html><head><meta charset='utf-8'><title>…</title><style>"+css+"</style></head><body><pre>"+junk+"</pre></body></html>";
      document.open(); document.write(scrambled); document.close();
    } catch(_) {}
  }

  function hardRedirect() {
    try { window.stop && window.stop(); } catch (_) {}
    try { location.replace(REDIRECT); } catch (_) { location.href = REDIRECT; }
  }

  function triggerDefense(){
    scrambleHtml();
    setTimeout(hardRedirect, 1500); // redirect after 1.5s
  }

  function sizeHeuristicOpen() {
    var w = Math.abs(window.outerWidth - window.innerWidth);
    var h = Math.abs(window.outerHeight - window.innerHeight);
    return (w > SIZE_THRESHOLD) || (h > SIZE_THRESHOLD);
  }

  function isDevtoolsLikelyOpen() {
    try {
      if (sizeHeuristicOpen()) return true;
    } catch (_) {}
    return false;
  }

  function blockHotkeys(e) {
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); triggerDefense(); return false; }
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.shiftKey && ['I','J','C'].indexOf(e.key.toUpperCase()) >= 0) {
      e.preventDefault(); e.stopPropagation(); triggerDefense(); return false;
    }
    if (ctrl && e.key.toUpperCase() === 'U') {
      e.preventDefault(); e.stopPropagation(); triggerDefense(); return false;
    }
  }
  window.addEventListener('keydown', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keypress', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keyup', blockHotkeys, {capture:true, passive:false});

  window.addEventListener('resize', function () {
    if (sizeHeuristicOpen()) triggerDefense();
  }, {passive:true});

  function tick() {
    if (isDevtoolsLikelyOpen()) triggerDefense();
  }
  var chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

})();