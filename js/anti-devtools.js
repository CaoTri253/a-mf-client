/* Anti-DevTools v1.7 – client-side hardening (best-effort) */
(function () {
  'use strict';

  /* đặt ngay sau 'use strict'; */
  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) {
    // Không chạy cơ chế anti-devtools trên chính trang cảnh báo
    return;
  }

  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;
  var OBFUSCATE_INTERVAL = 600;
  var CHECK_INTERVAL = 400;
  var SIZE_THRESHOLD = 160;
  var DRIFT_THRESHOLD = 120;
  var devtoolsOpen = false, obfTimer = null, chkTimer = null, lastTick = Date.now();

  function hardRedirect() {
    try { window.stop && window.stop(); } catch (_) {}
    try { location.replace(REDIRECT); } catch (_) { location.href = REDIRECT; }
  }

  function startObfuscation() {
    if (obfTimer) return;
    try {
      var junk = function () {
        try {
          console.clear && console.clear();
          var s = '';
          for (var i = 0; i < 128; i++) {
            s += String.fromCharCode(0x2580 + Math.floor(Math.random() * 128));
          }
          var box = '%c' + s + '\\n' + s.split('').reverse().join('');
          console.log(box, 'font-size:1px; line-height:1px;');
        } catch (_) {}
      };
      var methods = ['log','info','warn','error','debug','table','dir'];
      methods.forEach(function (m) {
        if (!console[m]) return;
        var orig = console[m];
        Object.defineProperty(console, m, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: function () { return; }
        });
        window['__c_' + m] = orig;
      });
      obfTimer = setInterval(junk, OBFUSCATE_INTERVAL);
    } catch (_) {}
  }

  function sizeHeuristicOpen() {
    var w = window.outerWidth - window.innerWidth;
    var h = window.outerHeight - window.innerHeight;
    return (w > SIZE_THRESHOLD) || (h > SIZE_THRESHOLD);
  }

  function driftHeuristicOpen() {
    var now = Date.now();
    var drift = now - lastTick - CHECK_INTERVAL;
    lastTick = now;
    return drift > DRIFT_THRESHOLD;
  }

  function breakpointHeuristicOpen() {
    var t0 = performance.now();
    debugger;
    var t1 = performance.now();
    return (t1 - t0) > 20;
  }

  function isDevtoolsLikelyOpen() {
    try {
      if (sizeHeuristicOpen()) return true;
      if (driftHeuristicOpen()) return true;
      if (breakpointHeuristicOpen()) return true;
    } catch (_) {}
    return false;
  }

  function blockHotkeys(e) {
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.shiftKey && ['I','J','C'].indexOf(e.key.toUpperCase()) >= 0) { e.preventDefault(); e.stopPropagation(); return false; }
    if (ctrl && e.key.toUpperCase() === 'U') { e.preventDefault(); e.stopPropagation(); return false; }
  }
  window.addEventListener('keydown', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keypress', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keyup', blockHotkeys, {capture:true, passive:false});

  window.addEventListener('resize', function () {
    if (sizeHeuristicOpen()) {
      devtoolsOpen = true;
      try { clearInterval(chkTimer); } catch(_) {}
      hardRedirect();
      startObfuscation();
    }
  }, {passive:true});

  function tick() {
    if (isDevtoolsLikelyOpen()) {
      devtoolsOpen = true;
      hardRedirect();
      startObfuscation();
    }
  }
  lastTick = Date.now();
  chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

  try {
    Object.defineProperty(window, 'API_BASE', {
      get: function () { hardRedirect(); return undefined; },
      configurable: false
    });
  } catch (_) {}
})();
