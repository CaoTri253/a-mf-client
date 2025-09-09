// Sử dụng link Apps Script Web App của bạn!
const API_BASE = "https://script.google.com/macros/s/AKfycbwfsTcpgpduAP6bsQnDu1vsUTzMrtYNRMyZLsqKDJu-5j910xP69GXmdS1OaOAdKbNJ/exec";

async function login(sdt, password) {
  const url = `${API_BASE}?func=Login&sdt=${encodeURIComponent(sdt)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url);
  return await res.json();
}
async function register(user) {
  const url = `${API_BASE}?func=Register&ho_ten=${encodeURIComponent(user.ho_ten)}&sdt=${encodeURIComponent(user.sdt)}&password=${encodeURIComponent(user.password)}&ma_truong=${encodeURIComponent(user.ma_truong)}&loai_user=${encodeURIComponent(user.loai_user)}`;
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
