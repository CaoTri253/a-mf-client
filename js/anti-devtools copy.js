/* Anti-DevTools v2.3 – relaxed + mobile-safe (low false-positive) */
(function () {
  'use strict';

  // Do not run on anti_spam page itself
  if (/\/views\/anti_spam\.html$/i.test(location.pathname)) return;

  // Absolute redirect to avoid /views/views duplication
  var REDIRECT = new URL('/views/anti_spam.html', location.origin).href;

  // Tunables
  var CHECK_INTERVAL = 700;      // ms – chậm hơn để tránh nhiễu
  var SIZE_THRESHOLD_DESKTOP = 260;  // px
  var SIZE_THRESHOLD_MOBILE  = 480;  // px (toolbars/keyboard rất dày)
  var CONSECUTIVE_DESKTOP    = 2;    // số lần liên tiếp cần thiết để kết luận mở DevTools
  var CONSECUTIVE_MOBILE     = 8;    // cao hơn trên mobile để giảm false positive
  var MIN_DESKTOP_WIDTH      = 900;  // chỉ chạy heuristic khi khung nhìn đủ lớn
  var MIN_DESKTOP_HEIGHT     = 600;

  var consecutiveHits = 0;
  var chkTimer = null;
  var lastVVH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  var keyboardOpen = false;
  var lastInteractionTs = 0;

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

  // Track focus/typing to infer on-screen keyboard on mobile (via visualViewport)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function(){
      var h = window.visualViewport.height;
      var delta = lastVVH - h;
      var ae = document.activeElement;
      var isTypingTarget = ae && (
        ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable === true
      );
      // Nếu chiều cao giảm mạnh trong khi đang focus input → khả năng là keyboard
      keyboardOpen = (delta > 140) && isTypingTarget;
      lastVVH = h;
    }, {passive:true});
  }
  ['touchstart','touchmove','scroll'].forEach(function(ev){
    window.addEventListener(ev, function(){ lastInteractionTs = Date.now(); }, {passive:true});
  });

  function hardRedirect() {
    try { window.stop && window.stop(); } catch (_) {}
    try { location.replace(REDIRECT); } catch (_) { location.href = REDIRECT; }
  }

  // Size-based heuristic with ratio guard & mobile tuning
  function sizeHeuristicOpen() {
    // Bỏ qua khi đang có khả năng mở keyboard (mobile)
    if (keyboardOpen) return false;

    var outerW = window.outerWidth || screen.width || window.innerWidth;
    var outerH = window.outerHeight || screen.height || window.innerHeight;
    var innerW = window.innerWidth;
    var innerH = window.innerHeight;

    var dw = Math.abs(outerW - innerW);
    var dh = Math.abs(outerH - innerH);

    var ratioW = innerW / (outerW || 1);
    var ratioH = innerH / (outerH || 1);

    // Chỉ xét ở tư thế landscape (giảm nhiễu do thanh địa chỉ dọc/keyboard)
    var landscape = innerW >= innerH;

    // Ngưỡng & số lần yêu cầu theo môi trường
    var TH = isMobile ? SIZE_THRESHOLD_MOBILE : SIZE_THRESHOLD_DESKTOP;

    // Guard: khung nhìn phải đủ lớn để coi là desktop-like
    var largeEnough = (!isMobile) ? (innerW >= MIN_DESKTOP_WIDTH && innerH >= MIN_DESKTOP_HEIGHT) : false;

    if (!isMobile && !largeEnough) {
      // Trên màn hình nhỏ (có thể là tablet/split view), bỏ qua heuristic
      return false;
    }

    // Điều kiện "mở devtools" tương đối chặt:
    // - landscape (ưu tiên độ chính xác)
    // - chênh lệch lớn hơn ngưỡng và tỷ lệ thu hẹp đáng kể
    var byWidth  = landscape && (dw > TH) && (ratioW < 0.86);
    var byHeight = landscape && (dh > TH) && (ratioH < 0.86);

    return byWidth || byHeight;
  }

  function shouldTripNow() {
    // Không trip khi trang vừa có tương tác cuộn/chạm trong 600ms (địa chỉ thanh thu gọn/phồng ra)
    if (isMobile && Date.now() - lastInteractionTs < 600) return false;
    return sizeHeuristicOpen();
  }

  function tick() {
    if (shouldTripNow()) {
      consecutiveHits++;
      var need = isMobile ? CONSECUTIVE_MOBILE : CONSECUTIVE_DESKTOP;
      if (consecutiveHits >= need) {
        hardRedirect();
      }
    } else {
      consecutiveHits = 0;
    }
  }

  // Resize → chỉ tăng bộ đếm thay vì redirect ngay
  window.addEventListener('resize', tick, {passive:true});

  // Hotkeys (không ảnh hưởng mobile, nhưng giữ cho desktop)
  function blockHotkeys(e) {
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); hardRedirect(); return false; }
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.shiftKey && ['I','J','C'].indexOf(e.key.toUpperCase()) >= 0) { e.preventDefault(); e.stopPropagation(); hardRedirect(); return false; }
    if (ctrl && e.key.toUpperCase() === 'U') { e.preventDefault(); e.stopPropagation(); hardRedirect(); return false; }
  }
  window.addEventListener('keydown', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keypress', blockHotkeys, {capture:true, passive:false});
  window.addEventListener('keyup', blockHotkeys, {capture:true, passive:false});

  // Periodic check
  chkTimer = setInterval(tick, CHECK_INTERVAL);
  try { tick(); } catch (_) {}

  // Note: does not touch window.API_BASE or any app globals.
})();