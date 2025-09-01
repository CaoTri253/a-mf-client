/* Anti-DevTools v2.5 – hardening (mobile-safe + anti-save + anti-view-source) */
(function () {
  'use strict';

  // Do not run on anti_spam page itself
  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  // Absolute redirect to avoid /views/views duplication
  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;

  // Tunables (inherit from mobile-safe)
  var CHECK_INTERVAL = 700;
  var SIZE_THRESHOLD_DESKTOP = 260;
  var SIZE_THRESHOLD_MOBILE  = 480;
  var CONSECUTIVE_DESKTOP    = 2;
  var CONSECUTIVE_MOBILE     = 8;
  var MIN_DESKTOP_WIDTH      = 900;
  var MIN_DESKTOP_HEIGHT     = 600;

  var consecutiveHits = 0;
  var chkTimer = null;
  var lastVVH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  var keyboardOpen = false;
  var lastInteractionTs = 0;
  var lastContextMenuTs = 0;
  var lastSuspiciousTs = 0; // key combos like Ctrl+U / Ctrl+S / print

  // Simple mobile detection (best-effort)
  var isMobile = (function(){
    try {
      if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
        return navigator.userAgentData.mobile;
      }
    } catch(_) {}
    var ua = (navigator.userAgent || "").toLowerCase();
    var coarse = false;
    try { coarse = matchMedia && matchMedia('(pointer:coarse)').matches; } catch(_) {}
    var touch = (navigator.maxTouchPoints || 0) > 1;
    return /mobi|android|iphone|ipad|ipod|opera mini|iemobile/.test(ua) || coarse || touch;
  })();

  // ---- SCRAMBLE + REDIRECT ----
  function scrambleHtml(){
    try {
      var junk = "";
      for (var i = 0; i < 1400; i++) {
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
    setTimeout(hardRedirect, 1200);
  }

  // ---- MOBILE-SAFE HEURISTIC ----
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function(){
      var h = window.visualViewport.height;
      var delta = lastVVH - h;
      var ae = document.activeElement;
      var isTypingTarget = ae && (
        ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable === true
      );
      keyboardOpen = (delta > 140) && isTypingTarget;
      lastVVH = h;
    }, {passive:true});
  }
  ['touchstart','touchmove','scroll'].forEach(function(ev){
    window.addEventListener(ev, function(){ lastInteractionTs = Date.now(); }, {passive:true});
  });

  function sizeHeuristicOpen() {
    if (keyboardOpen) return false;
    var outerW = window.outerWidth || screen.width || window.innerWidth;
    var outerH = window.outerHeight || screen.height || window.innerHeight;
    var innerW = window.innerWidth;
    var innerH = window.innerHeight;
    var dw = Math.abs(outerW - innerW);
    var dh = Math.abs(outerH - innerH);
    var ratioW = innerW / (outerW || 1);
    var ratioH = innerH / (outerH || 1);
    var landscape = innerW >= innerH;
    var TH = isMobile ? SIZE_THRESHOLD_MOBILE : SIZE_THRESHOLD_DESKTOP;
    var largeEnough = (!isMobile) ? (innerW >= MIN_DESKTOP_WIDTH && innerH >= MIN_DESKTOP_HEIGHT) : false;
    if (!isMobile && !largeEnough) return false;
    var byWidth  = landscape && (dw > TH) && (ratioW < 0.86);
    var byHeight = landscape && (dh > TH) && (ratioH < 0.86);
    return byWidth || byHeight;
  }
  function shouldTripNow() {
    if (isMobile && Date.now() - lastInteractionTs < 600) return false;
    return sizeHeuristicOpen();
  }
  function tick() {
    if (shouldTripNow()) {
      consecutiveHits++;
      var need = isMobile ? CONSECUTIVE_MOBILE : CONSECUTIVE_DESKTOP;
      if (consecutiveHits >= need) triggerDefense();
    } else {
      consecutiveHits = 0;
    }
  }
  window.addEventListener('resize', tick, {passive:true});
  chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

  // ---- ANTI VIEW SOURCE / SAVE / PRINT ----
  // Block common keys and mark as suspicious to handle menu actions via visibility/blur fallbacks.
  function onKey(e){
    var key = (e.key || '').toUpperCase();
    var ctrl = e.ctrlKey || e.metaKey;
    // Devtools
    if (key === 'F12' || (ctrl && e.shiftKey && ['I','J','C'].indexOf(key) >= 0)) {
      e.preventDefault(); e.stopPropagation(); lastSuspiciousTs = Date.now(); triggerDefense(); return false;
    }
    // View Source
    if (ctrl && key === 'U') { e.preventDefault(); e.stopPropagation(); lastSuspiciousTs = Date.now(); triggerDefense(); return false; }
    // Save Page
    if (ctrl && (key === 'S')) { e.preventDefault(); e.stopPropagation(); lastSuspiciousTs = Date.now(); triggerDefense(); return false; }
    // Print Page
    if (ctrl && (key === 'P')) { e.preventDefault(); e.stopPropagation(); lastSuspiciousTs = Date.now(); triggerDefense(); return false; }
  }
  window.addEventListener('keydown', onKey, {capture:true, passive:false});
  window.addEventListener('keypress', onKey, {capture:true, passive:false});
  window.addEventListener('keyup', onKey, {capture:true, passive:false});

  // Trap contextmenu to avoid "View Source" via right-click
  function onContext(e){
    lastContextMenuTs = Date.now();
    e.preventDefault(); e.stopPropagation();
    // Tiny decoy: copy URL then defend
    try { navigator.clipboard && navigator.clipboard.writeText(location.href); } catch(_){}
    triggerDefense();
    return false;
  }
  window.addEventListener('contextmenu', onContext, {capture:true});

  // If user uses browser menu (not interceptable), detect via print hooks & visibility/blur fallbacks
  window.addEventListener('beforeprint', function(){ lastSuspiciousTs = Date.now(); triggerDefense(); });
  window.addEventListener('blur', function(){
    // If page loses focus right after context menu or suspicious key → defend
    var now = Date.now();
    if ((now - lastContextMenuTs < 1200) || (now - lastSuspiciousTs < 1200)) {
      setTimeout(triggerDefense, 40);
    }
  });
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') {
      var now = Date.now();
      if ((now - lastContextMenuTs < 1200) || (now - lastSuspiciousTs < 1200)) {
        setTimeout(triggerDefense, 40);
      }
    }
  });

  // Optional: limit selection/drag/copy as further deterrence
  function prevent(e){ e.preventDefault(); e.stopPropagation(); return false; }
  document.addEventListener('copy', prevent, {capture:true});
  document.addEventListener('cut', prevent, {capture:true});
  document.addEventListener('dragstart', prevent, {capture:true});
  document.addEventListener('selectstart', prevent, {capture:true});

  // Note: cannot truly prevent "File > Save Page As" menu. We deter via hotkeys + fallbacks.
  // Does not touch window.API_BASE or any app globals.
})();