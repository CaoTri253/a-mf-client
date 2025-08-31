/* Anti-DevTools v2.2 – combo+: scramble + redirect + context‑menu trap */
(function () {
  'use strict';

  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;
  var CHECK_INTERVAL = 600;
  var SIZE_THRESHOLD = 300;

  var lastContextMenuTs = 0;
  var fakeMenu;

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

  // ---------------- Context‑menu trap ----------------
  function createFakeMenu(){
    if (fakeMenu) return;
    fakeMenu = document.createElement('div');
    fakeMenu.style.position = 'fixed';
    fakeMenu.style.zIndex = 2147483647;
    fakeMenu.style.background = '#1b1f2a';
    fakeMenu.style.color = '#e6ebff';
    fakeMenu.style.border = '1px solid #2c3245';
    fakeMenu.style.borderRadius = '8px';
    fakeMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,.4)';
    fakeMenu.style.font = '13px/1.5 -apple-system,Segoe UI,Roboto,Arial';
    fakeMenu.style.minWidth = '220px';
    fakeMenu.style.padding = '6px 0';
    fakeMenu.style.display = 'none';
    fakeMenu.innerHTML = [
      '<div data-act="viewsource" style="padding:8px 14px;cursor:pointer;">👀 View Page Source</div>',
      '<div data-act="inspect" style="padding:8px 14px;cursor:pointer;">🛠️ Inspect</div>',
      '<div data-act="copy" style="padding:8px 14px;cursor:pointer;">📋 Copy</div>',
      '<hr style="border:none;border-top:1px solid #2c3245;margin:6px 0;">',
      '<div style="padding:8px 14px;color:#8aa0ff;">Psst… tò mò quá đó nha 😏</div>'
    ].join('');
    fakeMenu.addEventListener('click', function(e){
      var target = e.target.closest('[data-act]');
      if (!target) return;
      var act = target.getAttribute('data-act');
      if (act === 'viewsource' || act === 'inspect') {
        triggerDefense();
      } else if (act === 'copy') {
        try { navigator.clipboard.writeText(location.href); } catch(_){}
        triggerDefense();
      }
      hideFakeMenu();
    });
    document.body.appendChild(fakeMenu);
  }

  function showFakeMenu(x,y){
    createFakeMenu();
    fakeMenu.style.left = Math.max(4, Math.min(x, innerWidth - fakeMenu.offsetWidth - 4)) + 'px';
    fakeMenu.style.top  = Math.max(4, Math.min(y, innerHeight - fakeMenu.offsetHeight - 4)) + 'px';
    fakeMenu.style.display = 'block';
  }

  function hideFakeMenu(){
    if (fakeMenu) fakeMenu.style.display = 'none';
  }

  function onContextMenu(e){
    lastContextMenuTs = Date.now();
    e.preventDefault(); e.stopPropagation();
    showFakeMenu(e.clientX, e.clientY);
  }
  window.addEventListener('contextmenu', onContextMenu, {capture:true});

  window.addEventListener('click', hideFakeMenu, {capture:true});
  window.addEventListener('scroll', hideFakeMenu, {capture:true});
  window.addEventListener('resize', hideFakeMenu, {capture:true});

  // If user selected real browser menu (cannot be intercepted) it often causes the page to lose focus.
  // We use a soft heuristic: if blur happens shortly after a contextmenu, assume a "view source" attempt.
  window.addEventListener('blur', function(){
    if (Date.now() - lastContextMenuTs < 1200) {
      // Give a tiny delay for the new tab/menu to open, then defend
      setTimeout(triggerDefense, 50);
    }
  });

  // ---------------- Hotkeys & detection ----------------
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

  // No touching of API_BASE or your app globals.
})();