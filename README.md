# Website Bán Hàng Cơ Bản

Website bán hàng cơ bản - Bài tập môn học. Phạm vi project được giữ ở mức cơ bản phù hợp bài tập môn học: **không triển khai đặt hàng, thanh toán online hoặc cổng thanh toán**. Tập trung vào hiển thị sản phẩm, tìm kiếm/danh mục, giỏ hàng cơ bản, tài khoản User và quản trị Admin.

## Công nghệ

- **Frontend:** HTML + CSS + JavaScript
- **Backend:** PHP
- **Database:** MySQL

## Tính năng cuối kỳ

- Trang chủ và giao diện sản phẩm.
- Danh sách sản phẩm, chi tiết sản phẩm, danh mục, tìm kiếm/lọc cơ bản.
- Giỏ hàng cơ bản: thêm, xóa, tăng/giảm số lượng, tính tổng tiền.
- Tài khoản: đăng ký, đăng nhập, đăng xuất, profile.
- Admin: Dashboard đơn giản, CRUD sản phẩm, CRUD danh mục, quản lý User.
- PHP + MySQL Backend; HTML/CSS/JS Frontend tách riêng.
- Responsive cơ bản.
- **Không** triển khai đặt hàng, checkout, thanh toán online hoặc tích hợp cổng thanh toán.

## Phân công nhóm (6 thành viên)

| Thành viên | Module | Nhiệm vụ | File chính |
|---|---|---|---|
| Thành viên 1 | Trang chủ + giao diện dùng chung | Header, Footer, trang chủ, banner, danh sách sản phẩm nổi bật, bố cục dùng chung | `frontend/index.html`; `includes/header.html`; `includes/footer.html`; `css/global.css`; `css/home.css`; `js/main.js` |
| Thành viên 2 | Sản phẩm + danh mục User | Danh sách sản phẩm, chi tiết sản phẩm, danh mục, tìm kiếm và lọc cơ bản | `pages/products.html`; `product-detail.html`; `category.html`; `search.html`; `css/product.css`; `js/product.js`; Product API |
| Thành viên 3 | Giỏ hàng cơ bản | Thêm vào giỏ, xóa, tăng/giảm số lượng, tính tổng tiền. Không có checkout/thanh toán | `pages/cart.html`; `css/cart.css`; `js/cart.js`; Cart API/logic |
| Thành viên 4 | Tài khoản User | Đăng ký, đăng nhập, đăng xuất, profile và bảo vệ trang cần đăng nhập | `pages/login.html`; `register.html`; `profile.html`; `css/auth.css`; `js/auth.js`; Auth/User API |
| Thành viên 5 | Admin | Dashboard đơn giản, CRUD sản phẩm, CRUD danh mục, quản lý User | `admin/index.html`; `products.html`; `categories.html`; `users.html`; `css/admin.css`; `js/admin.js`; Admin API |
| Thành viên 6 | Database + Backend tích hợp | Thiết kế CSDL, PHP API, kết nối MySQL, middleware/phân quyền, tích hợp và kiểm thử | `database/ecommerce.sql`; `backend/config`; `models`; `controllers`; `api`; `middleware`; README |

## Cấu trúc thư mục

```
ecommerce/
├── frontend/
│   ├── index.html
│   ├── pages/
│   │   ├── products.html
│   │   ├── product-detail.html
│   │   ├── category.html
│   │   ├── search.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── profile.html
│   │   └── cart.html
│   ├── admin/
│   │   ├── index.html
│   │   ├── products.html
│   │   ├── categories.html
│   │   └── users.html
│   ├── css/
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── product.css
│   │   ├── cart.css
│   │   ├── auth.css
│   │   ├── admin.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── admin.js
│   ├── includes/
│   │   ├── header.html
│   │   └── footer.html
│   └── assets/
│       ├── images/
│       │   ├── logo.png
│       │   ├── banners/
│       │   └── products/
│       └── icons/
├── backend/
│   ├── config/
│   │   ├── database.php
│   │   └── config.php
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── UserController.php
│   │   ├── ProductController.php
│   │   ├── CategoryController.php
│   │   └── CartController.php
│   ├── models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   └── Cart.php
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── logout.php
│   │   │   └── profile.php
│   │   ├── products/
│   │   │   ├── list.php
│   │   │   ├── detail.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   ├── delete.php
│   │   │   └── upload.php
│   │   ├── categories/
│   │   │   ├── list.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   └── delete.php
│   │   └── cart/
│   │       ├── list.php
│   │       ├── add.php
│   │       ├── update.php
│   │       └── delete.php
│   ├── middleware/
│   │   ├── auth.php
│   │   └── admin.php
│   └── uploads/
│       ├── products/
│       └── users/
├── database/
│   └── ecommerce.sql
├── .gitignore
└── README.md
```

## Kế hoạch 5 tuần

| Tuần | Nội dung | Kết quả |
|---|---|---|
| Tuần 1 - HTML | Dựng toàn bộ khung trang bằng HTML, chưa xử lý dữ liệu thật | Tất cả trang HTML mở được và liên kết với nhau |
| Tuần 2 - CSS | Hoàn thiện giao diện và responsive | Website có giao diện thống nhất, đẹp và responsive |
| Tuần 3 - JavaScript | Thêm tương tác Frontend và xử lý dữ liệu giả | Các chức năng Frontend chạy được bằng dữ liệu mẫu |
| Tuần 4 - PHP + MySQL | Xây dựng Backend/API và kết nối cơ sở dữ liệu | Frontend gọi PHP bằng `fetch()`, PHP xử lý và MySQL lưu dữ liệu |
| Tuần 5 - Tích hợp + kiểm thử | Kết nối toàn bộ hệ thống, sửa lỗi, hoàn thiện demo và source | Hoàn thành User + Admin, CRUD, đăng nhập/phân quyền, tìm kiếm, giỏ hàng cơ bản, responsive |

## Quy ước làm việc

- **Không nhúng PHP vào HTML.** Frontend gọi PHP API bằng `fetch()`.
- PHP xử lý nghiệp vụ và truy vấn MySQL, trả dữ liệu JSON cho JavaScript.
- `database/ecommerce.sql` là cơ sở dữ liệu chung; thay đổi cấu trúc phải thống nhất cả nhóm.
- Mỗi thành viên làm branch riêng và merge vào `develop` sau khi test.
- Tuần 1-3 ưu tiên HTML/CSS/JS; tuần 4 kết nối PHP + MySQL; tuần 5 tích hợp và kiểm thử.

## Cài đặt và chạy dự án

1. Cài XAMPP (Apache + PHP + MySQL), đặt project vào thư mục `htdocs`.
2. Tạo database `ecommerce` và import `database/ecommerce.sql`.
3. Cấu hình kết nối MySQL trong `backend/config/database.php` và `backend/config/config.php`.
4. Truy cập `http://localhost/<tên-thư-mục-project>/frontend/index.html`.