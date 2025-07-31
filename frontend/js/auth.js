/**
 * Gửi yêu cầu đăng nhập
 * @param {string} sdt - Số điện thoại người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise<object>} - Kết quả: { success, token, user, error }
 */
async function loginUser(sdt, password) {
  const res = await apiPost("auth/login", { sdt, password });
  return res;
}

/**
 * Đăng xuất khỏi phiên hiện tại
 * @returns {Promise<object>} - { success }
 */
async function logoutUser() {
  const res = await apiPost("auth/logout");
  return res;
}

/**
 * Lấy thông tin người dùng từ token hiện tại
 * @returns {Promise<object>} - { success, user }
 */
async function getCurrentUser() {
  const res = await apiGet("users/me");
  return res;
}
