document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      let sdt = document.getElementById("sdt").value;
      let password = document.getElementById("password").value;
      let res = await apiRequest("auth/login", "POST", { sdt, password });
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        window.location.href = "dashboard.html";
      } else {
        alert(res.message || "Đăng nhập thất bại");
      }
    });
  }
});
