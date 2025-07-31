const AuthController = {
  login({ sdt, password }) {
    const user = AuthModel.validateLogin(sdt, password);
    if (!user) {
      return { success: false, error: "Sai số điện thoại hoặc mật khẩu" };
    }

    const token = Utils.generateToken();
    Utils.saveSession(token, sdt);

    return {
      success: true,
      token,
      user: {
        ho_ten: user.ho_ten,
        sdt: user.sdt,
        phan_quyen: user.phan_quyen,
        ma_truong: user.ma_truong,
        ten_truong: user.ten_truong
      }
    };
  },

  logout(headers) {
    const token = Utils.getBearerToken(headers);
    if (!token) return { success: false };
    Utils.clearSession(token);
    return { success: true };
  },

  getCurrentUser(headers) {
    const token = Utils.getBearerToken(headers);
    const sdt = Utils.getSessionUser(token);
    if (!sdt) return { success: false };

    const user = AuthModel.getUserByPhone(sdt);
    if (!user) return { success: false };

    return {
      success: true,
      user: {
        ho_ten: user.ho_ten,
        sdt: user.sdt,
        phan_quyen: user.phan_quyen,
        ma_truong: user.ma_truong,
        ten_truong: user.ten_truong
      }
    };
  }
};
