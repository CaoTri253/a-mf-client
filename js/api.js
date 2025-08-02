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
