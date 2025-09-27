/* =========================================================
 * api.js — phiên bản tương thích Cloudflare Worker + Apps Script HMAC
 * - BASE URL: /api (route qua Worker, KHÔNG lộ URL Apps Script)
 * - Tất cả thao tác ghi/sửa/xoá dùng POST(JSON)
 * - GET chỉ cho dữ liệu công khai (được cache ở edge)
 * - Limiter + retry/backoff để tránh burst/CAPTCHA
 * - Có batch import để giảm số request
 * ========================================================= */

/** ================== Cấu hình chung ================== */
const API_BASE = "/api";                 // Route same-origin qua Cloudflare Worker
const MAX_CONCURRENCY = 1;               // Số request đồng thời tối đa
const MIN_INTERVAL_MS = 350;             // Khoảng cách tối thiểu giữa 2 request (ms)
const RETRY_STATUS = new Set([429, 503]); // Trạng thái nên retry
const MAX_RETRIES = 4;                   // Số lần retry tối đa
const INITIAL_BACKOFF_MS = 400;          // Backoff khởi đầu

/** (Tuỳ chọn) cache tạm ở client cho GET nhẹ nhàng */
const clientCache = new Map(); // key -> { expireAt, data }
const DEFAULT_TTL_MS = 30_000; // 30s
function cacheGet(key) {
  const hit = clientCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expireAt) {
    clientCache.delete(key);
    return null;
  }
  return hit.data;
}
function cacheSet(key, data, ttl = DEFAULT_TTL_MS) {
  clientCache.set(key, { data, expireAt: Date.now() + ttl });
}

/** ================== Limiter hàng đợi ================== */
const _q = [];
let _active = 0;
let _lastAt = 0;

async function _schedule(fn) {
  return new Promise((resolve, reject) => {
    _q.push({ fn, resolve, reject });
    _drain();
  });
}
async function _drain() {
  if (_active >= MAX_CONCURRENCY) return;
  const task = _q.shift();
  if (!task) return;

  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL_MS - (now - _lastAt));
  _active++;
  setTimeout(async () => {
    _lastAt = Date.now();
    try {
      const val = await task.fn();
      task.resolve(val);
    } catch (e) {
      task.reject(e);
    } finally {
      _active--;
      _drain();
    }
  }, wait);
}

/** ================== Fetch chuẩn hoá + retry ================== */
async function _doFetch(url, init = {}, { cacheKey = null, cacheTTL = 0 } = {}) {
  // Cache client (GET)
  if (cacheKey && cacheTTL > 0) {
    const cached = cacheGet(cacheKey);
    if (cached) return structuredClone(cached);
  }

  // Gói trong limiter
  return _schedule(async () => {
    let attempt = 0;
    let backoff = INITIAL_BACKOFF_MS;
    // Đảm bảo header Content-Type cho POST
    if (init.method && init.method.toUpperCase() !== "GET") {
      init.headers = { ...(init.headers || {}), "Content-Type": "application/json" };
    }

    while (true) {
      const res = await fetch(url, init);
      // Trả về JSON/throw theo status
      if (!RETRY_STATUS.has(res.status)) {
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if (j && j.error) msg += `: ${j.error}`;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        if (cacheKey && cacheTTL > 0) cacheSet(cacheKey, data, cacheTTL);
        return data;
      }

      // Retry với 429/503
      attempt++;
      if (attempt > MAX_RETRIES) {
        throw new Error(`HTTP ${res.status} (max retries)`);
      }
      await _sleep(backoff);
      backoff = Math.min(backoff * 1.8, 4000);
    }
  });
}

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** ================== Helper gọi API ================== */
async function apiGet(func, params = {}, { cacheTTL = DEFAULT_TTL_MS } = {}) {
  const qs = new URLSearchParams({ func, ...params }).toString();
  const url = `${API_BASE}?${qs}`;
  const cacheKey = `GET:${url}`;
  return _doFetch(url, { method: "GET" }, { cacheKey, cacheTTL });
}

async function apiPost(func, payload = {}) {
  const url = `${API_BASE}?func=${encodeURIComponent(func)}`;
  return _doFetch(url, { method: "POST", body: JSON.stringify(payload) });
}

/** ================== API NHẠY CẢM → POST(JSON) ================== */
// Auth
async function login(sdt, password) {
  return apiPost("Login", { sdt, password });
}
async function register(user) {
  // user: { sdt, password, ... }
  return apiPost("Register", user);
}
async function forgotPassword(sdt) {
  return apiPost("ForgotPassword", { sdt });
}

// Học sinh (CRUD)
async function themHocsinh(hs) {
  return apiPost("ThemHocsinh", hs);
}
async function suaHocsinh(hs) {
  return apiPost("UpdateHocsinh", hs);
}
async function xoaHocsinh(id) {
  return apiPost("DeleteHocsinh", { id });
}
async function xoaNhieuHocsinh(ids) {
  return apiPost("DeleteManyHocsinh", { ids });
}

// BHYT
async function nopHoSoBHYT(payload) {
  return apiPost("NopHoSoBHYT", payload);
}
async function suaHoSoBHYT(payload) {
  return apiPost("SuaHoSoBHYT", payload);
}
async function deleteBHYTByKey(p) {
  return apiPost("DeleteBHYT", p); // p: { key | fields nhận diện }
}
async function deleteBHYTByStt(stt, phan_quyen = "") {
  return apiPost("DeleteBHYTByStt", { stt, phan_quyen });
}

// BHTN
async function nopHoSoBHTN(payload) {
  return apiPost("NopHoSoBHTN", payload);
}
async function suaHoSoBHTN(payload) {
  return apiPost("SuaHoSoBHTN", payload);
}
async function deleteBHTNByKey(p) {
  return apiPost("DeleteBHTN", p);
}
async function deleteBHTNByStt(stt, phan_quyen = "") {
  return apiPost("DeleteBHTNByStt", { stt, phan_quyen });
}

/** ================== API ĐỌC CÔNG KHAI → GET ================== */
// (được edge-cache tại Cloudflare; ở client TTL ngắn để giảm hit)
async function getGiaBHTN() {
  return apiGet("GetGiaBHTN", {}, { cacheTTL: 30_000 });
}
async function getAllDanhSachHocsinh(ma_truong, lop_hoc) {
  return apiGet("GetAllDanhSachHocsinh", { ma_truong, lop_hoc });
}
async function getDanhSachHocsinhPaginated(
  ma_truong,
  lop_hoc,
  start = 0,
  limit = 10,
  query = "",
  sortField = "",
  sortDir = 1
) {
  return apiGet("GetDanhSachHocsinhPaginated", {
    ma_truong,
    lop_hoc,
    start,
    limit,
    query,
    sortField,
    sortDir,
  });
}
async function getDanhSachBHYT(ma_truong, lop_hoc) {
  return apiGet("GetDanhSachBHYT", { ma_truong, lop_hoc });
}
async function getBHYTStatus(so_dinh_danh, ma_truong, lop_hoc) {
  return apiGet("GetBHYTStatus", { so_dinh_danh, ma_truong, lop_hoc });
}
async function getHosoBHYTByHS(so_dinh_danh, ma_truong, lop_hoc) {
  return apiGet("GetHosoBHYTByHS", { so_dinh_danh, ma_truong, lop_hoc });
}
async function getDanhSachBHTN(ma_truong, lop_hoc) {
  return apiGet("GetDanhSachBHTN", { ma_truong, lop_hoc });
}
async function getBHTNStatus(so_dinh_danh, ma_truong, lop_hoc) {
  return apiGet("GetBHTNStatus", { so_dinh_danh, ma_truong, lop_hoc });
}
async function getHosoBHTNByHS(so_dinh_danh, ma_truong, lop_hoc) {
  return apiGet("GetHosoBHTNByHS", { so_dinh_danh, ma_truong, lop_hoc });
}

/** ================== Import: ưu tiên batch ================== */
async function importDanhSachHocsinhBatch(listHS) {
  // listHS: mảng object học sinh
  return apiPost("BatchThemHocsinh", { list: listHS });
}

/** Fallback nếu backend chưa có batch: import tuần tự có giãn cách */
async function importDanhSachHocsinh(listHS) {
  let ok = 0, fail = 0, errors = [];
  for (const hs of listHS) {
    try {
      const r = await themHocsinh(hs);
      if (r && (r.success || r.ok)) ok++;
      else { fail++; errors.push(r && r.message ? r.message : "Lỗi không rõ"); }
    } catch (e) {
      fail++; errors.push(e.message || String(e));
    }
    await _sleep(350); // tăng từ 150 → 300–400ms để tránh burst
  }
  return fail === 0
    ? { success: true, imported: ok }
    : { success: false, imported: ok, failed: fail, errors };
}

/** ================== Public API export ================== */
const API = {
  // helpers (nếu cần dùng nơi khác)
  apiGet, apiPost,

  // Auth
  login, register, forgotPassword,

  // Học sinh
  themHocsinh, suaHocsinh, xoaHocsinh, xoaNhieuHocsinh,

  // BHYT
  nopHoSoBHYT, suaHoSoBHYT, deleteBHYTByKey, deleteBHYTByStt,

  // BHTN
  nopHoSoBHTN, suaHoSoBHTN, deleteBHTNByKey, deleteBHTNByStt,

  // GET công khai
  getGiaBHTN,
  getAllDanhSachHocsinh,
  getDanhSachHocsinhPaginated,
  getDanhSachBHYT,
  getBHYTStatus,
  getHosoBHYTByHS,
  getDanhSachBHTN,
  getBHTNStatus,
  getHosoBHTNByHS,

  // Import
  importDanhSachHocsinhBatch,
  importDanhSachHocsinh,
};

// Tương thích trình duyệt & bundler
if (typeof window !== "undefined") window.API = API;
try { if (typeof module !== "undefined") module.exports = API; } catch (e) {}

