// Sử dụng link Apps Script Web App của bạn!
const API_BASE = "https://script.google.com/macros/s/AKfycbwfsTcpgpduAP6bsQnDu1vsUTzMrtYNRMyZLsqKDJu-5j910xP69GXmdS1OaOAdKbNJ/exec";


// --- Drop-in limiter for fetch: queue + retry + small cache ---
// (() => {
//   const origFetch = window.fetch.bind(window);

//   // Cấu hình nhẹ
//   const MAX_CONCURRENCY = 3;     // chạy song song tối đa
//   const MIN_INTERVAL_MS = 150;   // giãn cách giữa 2 lượt lấy từ hàng đợi
//   const RETRIES = 2;             // retry khi lỗi mạng / 429
//   const RETRY_BASE_MS = 400;     // backoff cơ bản
//   const CACHE_TTL_MS = 30_000;   // cache GET 30s để chống gọi lặp

//   const cache = new Map(); // key: URL, val: {ts, jsonPromise}
//   const q = [];
//   let active = 0, lastDeq = 0;

//   async function limitedFetch(input, init) {
//     // Cache GET trong 30s (login/register là GET hiện tại)
//     const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
//     const url = (typeof input === 'string' ? input : input.url);

//     if (method === 'GET' && CACHE_TTL_MS > 0) {
//       const c = cache.get(url);
//       const now = Date.now();
//       if (c && (now - c.ts) < CACHE_TTL_MS) return c.jsonPromise.then(data => new Response(new Blob([JSON.stringify(data)]), {headers: {'Content-Type':'application/json'}}));
//     }

//     // Đưa vào hàng đợi
//     return new Promise((resolve, reject) => {
//       q.push({ input, init, resolve, reject, attempt: 0 });
//       pump();
//     });

//     function pump() {
//       if (!q.length) return;
//       const now = Date.now();
//       if (active >= MAX_CONCURRENCY || (now - lastDeq) < MIN_INTERVAL_MS) {
//         setTimeout(pump, MIN_INTERVAL_MS);
//         return;
//       }
//       lastDeq = now;
//       const task = q.shift();
//       active++;
//       doFetch(task).finally(() => { active--; pump(); });
//     }

//     async function doFetch(task) {
//       try {
//         const res = await origFetch(task.input, task.init);
//         // Thử backoff mềm nếu bị 429 hoặc lỗi tạm thời
//         if ((res.status === 429 || res.status === 503) && task.attempt < RETRIES) {
//           task.attempt++;
//           const wait = RETRY_BASE_MS * Math.pow(2, task.attempt - 1);
//           await new Promise(r => setTimeout(r, wait));
//           return doFetch(task);
//         }
//         // Cache JSON của GET
//         if (method === 'GET' && res.ok && res.headers.get('Content-Type')?.includes('application/json')) {
//           const jsonPromise = res.clone().json();
//           cache.set(url, { ts: Date.now(), jsonPromise });
//         }
//         task.resolve(res);
//       } catch (err) {
//         if (task.attempt < RETRIES) {
//           task.attempt++;
//           const wait = RETRY_BASE_MS * Math.pow(2, task.attempt - 1);
//           await new Promise(r => setTimeout(r, wait));
//           return doFetch(task);
//         }
//         task.reject(err);
//       }
//     }
//   }

//   window.fetch = limitedFetch;
// })();




async function login(sdt, password) {
  const url = `${API_BASE}?func=Login&sdt=${encodeURIComponent(sdt)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url);
  return await res.json();
}
// async function register(user) {
//   const url = `${API_BASE}?func=Register&ho_ten=${encodeURIComponent(user.ho_ten)}&sdt=${encodeURIComponent(user.sdt)}&password=${encodeURIComponent(user.password)}&ma_truong=${encodeURIComponent(user.ma_truong)}&loai_user=${encodeURIComponent(user.loai_user)}`;
//   const res = await fetch(url);
//   return await res.json();
// }

async function register(user) {
  // Sửa loai_user thành phan_quyen
  const url = `${API_BASE}?func=Register&ho_ten=${encodeURIComponent(user.ho_ten)}&sdt=${encodeURIComponent(user.sdt)}&password=${encodeURIComponent(user.password)}&ma_truong=${encodeURIComponent(user.ma_truong)}&phan_quyen=${encodeURIComponent(user.phan_quyen)}&lop_hoc=${encodeURIComponent(user.lop_hoc || "")}`; // <-- SỬA Ở ĐÂY
  const res = await fetch(url);
  return await res.json();
}
async function forgotPassword(sdt) {
  const url = `${API_BASE}?func=ForgotPassword&sdt=${encodeURIComponent(sdt)}`;
  const res = await fetch(url);
  return await res.json();
}

// API lấy toàn bộ danh sách học sinh
async function getAllDanhSachHocsinh(ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetAllDanhSachHocsinh&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Lấy danh sách học sinh phân trang + tìm kiếm + sort
async function getDanhSachHocsinhPaginated(ma_truong, lop_hoc, start = 0, limit = 10, query = "", sortField = "", sortDir = 1) {
  const url = `${API_BASE}?func=GetDanhSachHocsinhPaginated`
    + `&ma_truong=${encodeURIComponent(ma_truong)}`
    + `&lop_hoc=${encodeURIComponent(lop_hoc)}`
    + `&start=${start}`
    + `&limit=${limit}`
    + `&query=${encodeURIComponent(query)}`
    + `&sortField=${encodeURIComponent(sortField)}`
    + `&sortDir=${sortDir}`;
  const res = await fetch(url);
  return await res.json();
}

// Thêm học sinh đơn lẻ
async function themHocsinh(hs) {
  const url = `${API_BASE}?func=ThemHocsinh`
    + `&ma_so_bhxh=${encodeURIComponent(hs.ma_so_bhxh)}`
    + `&ho_ten_hoc_sinh=${encodeURIComponent(hs.ho_ten_hoc_sinh)}`
    + `&ngay_sinh=${encodeURIComponent(hs.ngay_sinh)}`
    + `&gioi_tinh=${encodeURIComponent(hs.gioi_tinh)}`
    + `&dia_chi=${encodeURIComponent(hs.dia_chi)}`
    + `&ngay_het_han_bhyt=${encodeURIComponent(hs.ngay_het_han_bhyt)}`
    + `&ngay_het_han_bhtn=${encodeURIComponent(hs.ngay_het_han_bhtn)}`
    + `&lop_hoc=${encodeURIComponent(hs.lop_hoc)}`
    + `&sdt_lienhe=${encodeURIComponent(hs.sdt_lienhe)}`
    + `&so_dinh_danh=${encodeURIComponent(hs.so_dinh_danh)}`
    + `&noi_kham_bhyt=${encodeURIComponent(hs.noi_kham_bhyt)}`
    + `&ten_cha_me=${encodeURIComponent(hs.ten_cha_me)}`
    + `&doi_tuong_dong=${encodeURIComponent(hs.doi_tuong_dong ?? "null")}`
    + `&ghi_chu=${encodeURIComponent(hs.ghi_chu ?? "null")}`
    + `&ma_truong=${encodeURIComponent(hs.ma_truong)}`;
  const res = await fetch(url);
  return await res.json();
}

// Import từng dòng (giữ nguyên chiến lược)
async function importDanhSachHocsinh(listHS) {
  let okCount = 0, failCount = 0, errors = [];
  for (const hs of listHS) {
    const url = `${API_BASE}?func=ThemHocsinh`
      + `&ma_so_bhxh=${encodeURIComponent(hs.ma_so_bhxh)}`
      + `&ho_ten_hoc_sinh=${encodeURIComponent(hs.ho_ten_hoc_sinh)}`
      + `&ngay_sinh=${encodeURIComponent(hs.ngay_sinh)}`
      + `&gioi_tinh=${encodeURIComponent(hs.gioi_tinh)}`
      + `&dia_chi=${encodeURIComponent(hs.dia_chi)}`
      + `&ngay_het_han_bhyt=${encodeURIComponent(hs.ngay_het_han_bhyt)}`
      + `&ngay_het_han_bhtn=${encodeURIComponent(hs.ngay_het_han_bhtn)}`
      + `&lop_hoc=${encodeURIComponent(hs.lop_hoc)}`
      + `&sdt_lienhe=${encodeURIComponent(hs.sdt_lienhe)}`
      + `&so_dinh_danh=${encodeURIComponent(hs.so_dinh_danh)}`
      + `&noi_kham_bhyt=${encodeURIComponent(hs.noi_kham_bhyt)}`
      + `&ten_cha_me=${encodeURIComponent(hs.ten_cha_me)}`
      + `&doi_tuong_dong=${encodeURIComponent(hs.doi_tuong_dong ?? "null")}`
      + `&ghi_chu=${encodeURIComponent(hs.ghi_chu ?? "null")}`
      + `&ma_truong=${encodeURIComponent(hs.ma_truong)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) okCount++;
      else { failCount++; errors.push(json.message || "Lỗi không xác định"); }
    } catch (err) {
      failCount++; errors.push(err.message);
    }
    await sleep(150); // 👈 giãn 150ms giữa mỗi request
  }
  if (failCount === 0) return { success: true, imported: okCount };
  else return { success: false, imported: okCount, errors };
}

// Sửa học sinh
async function suaHocsinh(hs) {
  const url = `${API_BASE}?func=UpdateHocsinh`
    + `&stt=${encodeURIComponent(hs.stt)}`
    + `&ma_so_bhxh=${encodeURIComponent(hs.ma_so_bhxh)}`
    + `&ho_ten_hoc_sinh=${encodeURIComponent(hs.ho_ten_hoc_sinh)}`
    + `&ngay_sinh=${encodeURIComponent(hs.ngay_sinh)}`
    + `&gioi_tinh=${encodeURIComponent(hs.gioi_tinh)}`
    + `&dia_chi=${encodeURIComponent(hs.dia_chi)}`
    + `&ngay_het_han_bhyt=${encodeURIComponent(hs.ngay_het_han_bhyt)}`
    + `&ngay_het_han_bhtn=${encodeURIComponent(hs.ngay_het_han_bhtn)}`
    + `&lop_hoc=${encodeURIComponent(hs.lop_hoc)}`
    + `&sdt_lienhe=${encodeURIComponent(hs.sdt_lienhe)}`
    + `&so_dinh_danh=${encodeURIComponent(hs.so_dinh_danh)}`
    + `&noi_kham_bhyt=${encodeURIComponent(hs.noi_kham_bhyt)}`
    + `&ten_cha_me=${encodeURIComponent(hs.ten_cha_me)}`
    + `&doi_tuong_dong=${encodeURIComponent(hs.doi_tuong_dong ?? "null")}`
    + `&ghi_chu=${encodeURIComponent(hs.ghi_chu ?? "null")}`
    + `&ma_truong=${encodeURIComponent(hs.ma_truong)}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa học sinh (theo stt hoặc số định danh)
async function xoaHocsinh(id) {
  const url = `${API_BASE}?func=DeleteHocsinh&id=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa nhiều học sinh
async function xoaNhieuHocsinh(ids) {
  const url = `${API_BASE}?func=DeleteManyHocsinh&ids=${encodeURIComponent(ids.join(","))}`;
  const res = await fetch(url);
  return await res.json();
}

/* ====== BHYT: giữ nguyên các hàm phía dưới nếu đã chạy tốt ====== */
// ... (không thay đổi phần BHYT hiện có)











// Lấy danh sách BHYT theo trường/lớp (trả đủ cột, có so_ho_so)
async function getDanhSachBHYT(ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetDanhSachBHYT&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Trạng thái BHYT theo HS
async function getBHYTStatus(so_dinh_danh, ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetBHYTStatus&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// (Tùy nơi gọi) nộp hồ sơ qua GET param
async function nopHoSoBHYT(payload) {
  const params = Object.entries(payload).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=NopHoSoBHYT&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Sửa hồ sơ qua GET param
async function suaHoSoBHYT(payload) {
  const params = Object.entries(payload).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=SuaHoSoBHYT&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Lấy hồ sơ BHYT theo HS
async function getHosoBHYTByHS(so_dinh_danh, ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetHosoBHYTByHS&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// (Giữ lại) Hàm POST cũ — backend chưa implement; chỉ dùng nếu bạn bổ sung route POST tương ứng
async function nopBHYTHoSo({ so_dinh_danh, noi_kham, so_thang_dong, user_info }) {
  const res = await fetch(`${API_BASE}?func=NopBHYTHoSo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ so_dinh_danh, noi_kham, so_thang_dong, user_info })
  });
  return await res.json();
}


// Xóa hồ sơ BHYT theo so_dinh_danh + ma_truong + lop_hoc (dùng cho "Chưa thu" khi hồ sơ đang chờ duyệt)
async function deleteBHYTByKey({ so_dinh_danh, ma_truong, lop_hoc, phan_quyen = "" }) {
  const url = `${API_BASE}?func=DeleteBHYT`
    + `&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}`
    + `&ma_truong=${encodeURIComponent(ma_truong)}`
    + `&lop_hoc=${encodeURIComponent(lop_hoc)}`
    + `&phan_quyen=${encodeURIComponent(phan_quyen)}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa hồ sơ BHYT theo stt (dùng cho “Đã thu”)
async function deleteBHYTByStt(stt, phan_quyen = "") {
  const url = `${API_BASE}?func=DeleteBHYTByStt`
    + `&stt=${encodeURIComponent(stt)}`
    + `&phan_quyen=${encodeURIComponent(phan_quyen)}`;
  const res = await fetch(url);
  return await res.json();
}














/* ====== BHTN: API tương thích model/controller mới ====== */

// Lấy danh sách BHTN theo trường/lớp
async function getDanhSachBHTN(ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetDanhSachBHTN&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Trạng thái BHTN theo HS (đã đóng/chưa đóng)
async function getBHTNStatus(so_dinh_danh, ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetBHTNStatus&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Lấy hồ sơ BHTN theo HS (1 học sinh)
async function getHosoBHTNByHS(so_dinh_danh, ma_truong, lop_hoc) {
  const url = `${API_BASE}?func=GetHosoBHTNByHS&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}&ma_truong=${encodeURIComponent(ma_truong)}&lop_hoc=${encodeURIComponent(lop_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Bảng giá BHTN (12 tháng)
async function getGiaBHTN() {
  const url = `${API_BASE}?func=GetGiaBHTN`;
  const res = await fetch(url);
  return await res.json();
}


// Helper bóc payload bảng giá BHTN thành object
function normalizeGiaBHTNResponse(res){
  if (!res) return {};
  const d = (res.data !== undefined) ? res.data : res;
  if (Array.isArray(d)) return d[0] || {};
  return d || {};
}




/**
 * Nộp hồ sơ BHTN (tạo mới/ghi đè nếu đã tồn tại theo so_dinh_danh + lớp + trường)
 * Lưu ý:
 *  - ma_so_bhtn có thể rỗng (admin kích hoạt sau).
 *  - so_thang_dong cố định 12 ở backend (không cần gửi).
 *  - KHÔNG có trường noi_kham_bhyt.
 *  - có thể truyền so_tien/hoa_hong để override, nếu không backend sẽ lấy theo Gia_BHTN.
 */
async function nopHoSoBHTN(payload) {
  const qs = Object.entries(payload).map(([k, v]) =>
    `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`
  ).join("&");
  const url = `${API_BASE}?func=NopHoSoBHTN&${qs}`;
  const res = await fetch(url);
  return await res.json();
}

/**
 * Sửa hồ sơ BHTN
 *  - Nếu không muốn thay đổi ma_so_bhtn, có thể KHÔNG gửi field này.
 *  - Backend sẽ tính lại hạn 12 tháng dựa trên ngay_het_han_bhtn_cu nếu bạn gửi cập nhật.
 */
async function suaHoSoBHTN(payload) {
  const qs = Object.entries(payload).map(([k, v]) =>
    `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`
  ).join("&");
  const url = `${API_BASE}?func=SuaHoSoBHTN&${qs}`;
  const res = await fetch(url);
  return await res.json();
}




// Xóa hồ sơ BHTN theo so_dinh_danh + ma_truong + lop_hoc (dùng cho "Chưa thu" khi hồ sơ đang chờ duyệt)
async function deleteBHTNByKey({ so_dinh_danh, ma_truong, lop_hoc, phan_quyen = "" }) {
  const url = `${API_BASE}?func=DeleteBHTN`
    + `&so_dinh_danh=${encodeURIComponent(so_dinh_danh)}`
    + `&ma_truong=${encodeURIComponent(ma_truong)}`
    + `&lop_hoc=${encodeURIComponent(lop_hoc)}`
    + `&phan_quyen=${encodeURIComponent(phan_quyen)}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa hồ sơ BHTN theo stt (dùng cho “ĐÃ THU”)
async function deleteBHTNByStt(stt, phan_quyen = "") {
  const url = `${API_BASE}?func=DeleteBHTNByStt`
    + `&stt=${encodeURIComponent(stt)}`
    + `&phan_quyen=${encodeURIComponent(phan_quyen)}`;
  const res = await fetch(url);
  return await res.json();
}











/* ====== SỨC KHỎE HỌC SINH ====== */

// Lấy hồ sơ khám SK theo mã số BHXH và năm học
async function getSucKhoeRecord(ma_so_bhxh, nam_hoc) {
  const url = `${API_BASE}?func=GetSucKhoeRecord&ma_so_bhxh=${encodeURIComponent(ma_so_bhxh)}&nam_hoc=${encodeURIComponent(nam_hoc)}`;
  const res = await fetch(url);
  return await res.json();
}

// Thêm hồ sơ khám SK mới
async function addSucKhoeRecord(recordData) {
  const params = Object.entries(recordData).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=AddSucKhoeRecord&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Cập nhật hồ sơ khám SK (cần _rowIndex)
async function updateSucKhoeRecord(recordData) {
   const params = Object.entries(recordData).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=UpdateSucKhoeRecord&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa hồ sơ khám SK (cần _rowIndex)
async function deleteSucKhoeRecord(rowIndex) {
  const url = `${API_BASE}?func=DeleteSucKhoeRecord&_rowIndex=${encodeURIComponent(rowIndex)}`;
  const res = await fetch(url);
  return await res.json();
}

// Lấy danh sách sự kiện SK theo mã số BHXH
async function getSucKhoeEvents(ma_so_bhxh) {
  const url = `${API_BASE}?func=GetSucKhoeEvents&ma_so_bhxh=${encodeURIComponent(ma_so_bhxh)}`;
  const res = await fetch(url);
  return await res.json();
}

// Thêm sự kiện SK mới
async function addSucKhoeEvent(eventData) {
   const params = Object.entries(eventData).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=AddSucKhoeEvent&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Cập nhật sự kiện SK (cần _rowIndex)
async function updateSucKhoeEvent(eventData) {
   const params = Object.entries(eventData).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const url = `${API_BASE}?func=UpdateSucKhoeEvent&${params}`;
  const res = await fetch(url);
  return await res.json();
}

// Xóa sự kiện SK (cần _rowIndex)
async function deleteSucKhoeEvent(rowIndex) {
   const url = `${API_BASE}?func=DeleteSucKhoeEvent&_rowIndex=${encodeURIComponent(rowIndex)}`;
  const res = await fetch(url);
  return await res.json();
}
/* ====== SỨC KHỎE HỌC SINH ====== */






// --- API cho Quản lý User (Giáo viên) ---

/**
 * Lấy danh sách tất cả người dùng (sẽ lọc phía client).
 * @returns {Promise<object>} Kết quả từ backend ({success: boolean, data?: Array}).
 */
async function listUsers() {
  const url = `${API_BASE}?func=ListUsers`; // Hoặc func=UserList tùy theo main.gs
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("API Error - listUsers:", error);
    return { success: false, message: "Lỗi kết nối khi lấy danh sách người dùng." };
  }
}


/**
 * Cập nhật thông tin người dùng (giáo viên).
 * @param {object} userData Đối tượng chứa thông tin cập nhật.
 * Phải bao gồm 'sdt_key' (SĐT hiện tại để tìm user)
 * và các trường cần đổi: 'ho_ten', 'sdt' (SĐT mới), 'password' (mật khẩu mới, nếu có), 'lop_hoc'.
 * @returns {Promise<object>} Kết quả từ backend ({success: boolean, message?: string}).
 */
async function updateUser(userData) {
  // Đảm bảo userData có sdt_key
  if (!userData || !userData.sdt_key) {
    console.error("updateUser thiếu sdt_key");
    return { success: false, message: "Thiếu thông tin định danh người dùng." };
  }
  const params = Object.entries(userData)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`) // Gửi cả giá trị rỗng nếu có (vd: password rỗng là không đổi)
    .join('&');
  const url = `${API_BASE}?func=UpdateUser&${params}`; // *** Endpoint mới cần tạo: func=UpdateUser ***
  try {
    const res = await fetch(url);
    if (!res.ok) { // Thêm kiểm tra lỗi HTTP
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("API Error - updateUser:", error);
    return { success: false, message: "Lỗi kết nối khi cập nhật người dùng." };
  }
}

/**
 * Xóa người dùng (giáo viên) dựa trên số điện thoại.
 * @param {string} sdt Số điện thoại của người dùng cần xóa.
 * @returns {Promise<object>} Kết quả từ backend ({success: boolean, message?: string}).
 */
async function deleteUser(sdt) {
  if (!sdt) {
     console.error("deleteUser thiếu sdt");
     return { success: false, message: "Thiếu số điện thoại cần xóa." };
  }
  const url = `${API_BASE}?func=DeleteUser&sdt=${encodeURIComponent(sdt)}`; // *** Endpoint mới cần tạo: func=DeleteUser ***
  try {
    const res = await fetch(url);
     if (!res.ok) { // Thêm kiểm tra lỗi HTTP
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("API Error - deleteUser:", error);
    return { success: false, message: "Lỗi kết nối khi xóa người dùng." };
  }
}

// Lưu ý: Hàm register() đã có sẵn trong api.js của bạn.