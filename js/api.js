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


// Lấy danh sách học sinh phân trang + tìm kiếm
async function getDanhSachHocsinhPaginated(ma_truong, lop, start, limit, query) {
  const url = `${API_BASE}?func=GetDanhSachHocsinhPaginated&ma_truong=${encodeURIComponent(ma_truong)}&lop=${encodeURIComponent(lop)}&start=${start}&limit=${limit}&query=${encodeURIComponent(query||"")}`;
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
    + `&lop=${encodeURIComponent(hs.lop)}`
    + `&sdt_lienhe=${encodeURIComponent(hs.sdt_lienhe)}`
    + `&so_dinh_danh=${encodeURIComponent(hs.so_dinh_danh)}`
    + `&ma_truong=${encodeURIComponent(hs.ma_truong)}`;
  const res = await fetch(url);
  return await res.json();
}

// Gửi từng học sinh bằng GET (có thể dùng Promise.all nếu muốn chờ hết)
async function importDanhSachHocsinh(listHS) {
  let okCount = 0, failCount = 0, errors = [];
  for (const hs of listHS) {
    const url = `${API_BASE}?func=ThemHocsinh`
      + `&ma_so_bhxh=${encodeURIComponent(hs.ma_so_bhxh)}`
      + `&ho_ten_hoc_sinh=${encodeURIComponent(hs.ho_ten_hoc_sinh)}`
      + `&ngay_sinh=${encodeURIComponent(hs.ngay_sinh)}`
      + `&gioi_tinh=${encodeURIComponent(hs.gioi_tinh)}`
      + `&dia_chi=${encodeURIComponent(hs.dia_chi)}`
      + `&lop=${encodeURIComponent(hs.lop)}`
      + `&sdt_lienhe=${encodeURIComponent(hs.sdt_lienhe)}`
      + `&so_dinh_danh=${encodeURIComponent(hs.so_dinh_danh)}`
      + `&ma_truong=${encodeURIComponent(hs.ma_truong)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) okCount++;
      else { failCount++; errors.push(json.message || "Lỗi không xác định"); }
    } catch (err) {
      failCount++;
      errors.push(err.message);
    }
  }
  if (failCount === 0) return { success: true, imported: okCount };
  else return { success: false, imported: okCount, errors };
}

