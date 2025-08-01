Hướng dẫn tạo và sử dụng Frontend

Bước 1: Tạo Repository trên Github.
Bước 2: Đăng nhập Github trên Visual Studio Code
Bước 3: Cài NodeJs dưới Local.
Bước 4: Tạo thư mục chứa toàn bộ Frontend dưới Local. Nhờ Chat GPT tạo thư mục theo cấu trúc MVC, chia chương trình theo module.
Bước 5: Tại thư mục chứa Frontend nhấp phải chuột chạy lệnh cmd: 

📌  Lưu ý nếu chạy lệnh bị lỗi: error: remote origin already exists. Cách khắc phục là chạy lệnh: git remote remove origin
    + git add .
    + git commit -m "First commit: ABT Medu frontend"
    + git branch -M main
    + git push -u origin main
📌 Trên Github vào thư mục chứa Frontend 
    + Chọn Settings, 
    + Chọn Pages
    + Trong phần Source chọn Deploy From a branch
    + Trong phần Branch chọn main, root. Nhấn Save
    + Trang web được Public và trỏ về index.html
