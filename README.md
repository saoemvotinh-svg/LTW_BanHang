# Website Bán Hàng Cơ Bản
Website bán hàng cơ bản - Bài tập môn học[span_0](start_span)[span_0](end_span). Phạm vi project được giữ ở mức cơ bản để phù hợp bài tập môn học: **không triển khai đặt hàng, thanh toán online hoặc cổng thanh toán**[span_1](start_span)[span_1](end_span). Tập trung vào hiển thị sản phẩm, tìm kiếm/danh mục, giỏ hàng cơ bản, tài khoản User và quản trị Admin[span_2](start_span)[span_2](end_span).
## Công nghệ
- **Frontend:** HTML + CSS + JavaScript[span_3](start_span)[span_3](end_span)
- **Backend:** PHP + MySQL[span_4](start_span)[span_4](end_span)
## Tính năng cuối kỳ
- Trang chủ và giao diện sản phẩm[span_5](start_span)[span_5](end_span).
- Danh sách sản phẩm, chi tiết sản phẩm, danh mục, tìm kiếm/lọc cơ bản[span_6](start_span)[span_6](end_span).
- Giỏ hàng cơ bản: thêm, xóa, tăng/giảm số lượng, tính tổng tiền[span_7](start_span)[span_7](end_span).
- Tài khoản: đăng ký, đăng nhập, đăng xuất, profile[span_8](start_span)[span_8](end_span).
- Admin: Dashboard đơn giản, CRUD sản phẩm, CRUD danh mục, quản lý User[span_9](start_span)[span_9](end_span).
- PHP + MySQL Backend; HTML/CSS/JS Frontend tách riêng[span_10](start_span)[span_10](end_span).
- Responsive cơ bản[span_11](start_span)[span_11](end_span).
- **Không** triển khai đặt hàng, checkout, thanh toán online hoặc tích hợp cổng thanh toán[span_12](start_span)[span_12](end_span).
## Phân công nhóm (Yêu cầu Full-stack cho tất cả thành viên)

| Thành viên | Module | Nhiệm vụ (HTML, CSS, JS, PHP, MySQL) | File chính |
| :--- | :--- | :--- | :--- |
| Thành viên 1 | Xác thực & Người dùng (Auth/User)[span_13](start_span)[span_13](end_span) | Thiết kế bảng CSDL User, dựng HTML/CSS/JS, viết PHP API cho đăng ký, đăng nhập, profile và middleware bảo vệ trang[span_14](start_span)[span_14](end_span). | `frontend/login.html`; `register.html`; `profile.html`; `css/auth.css`; `js/auth.js`; `backend/models/User.php`; `backend/api/auth/`[span_15](start_span)[span_15](end_span) |
| Thành viên 2 | Trang chủ & Giao diện chung[span_16](start_span)[span_16](end_span) | Thiết kế HTML/CSS/JS layout chung (Header, Footer, Banner)[span_17](start_span)[span_17](end_span). Thiết kế CSDL (Read) và PHP API hiển thị sản phẩm nổi bật, banner[span_18](start_span)[span_18](end_span). | `frontend/index.html`; `includes/header.html`; `includes/footer.html`; `css/global.css`; `js/main.js`; `backend/api/products/list.php`[span_19](start_span)[span_19](end_span) |
| Thành viên 3 | Sản phẩm & Danh mục (Public)[span_20](start_span)[span_20](end_span) | Thiết kế CSDL Danh mục, HTML/CSS/JS và PHP API cho trang danh sách sản phẩm, chi tiết sản phẩm, lọc và tìm kiếm[span_21](start_span)[span_21](end_span). | `frontend/pages/products.html`; `product-detail.html`; `category.html`; `search.html`; `css/product.css`; `js/product.js`; `backend/models/Category.php`; `backend/api/categories/list.php`[span_22](start_span)[span_22](end_span) |
| Thành viên 4 | Giỏ hàng cơ bản[span_23](start_span)[span_23](end_span) | Thiết kế bảng CSDL Giỏ hàng, HTML/CSS/JS và PHP API xử lý thêm, xóa, sửa số lượng, tính tổng tiền (không checkout)[span_24](start_span)[span_24](end_span). | `frontend/pages/cart.html`; `css/cart.css`; `js/cart.js`; `backend/models/Cart.php`; `backend/api/cart/`[span_25](start_span)[span_25](end_span) |
| Thành viên 5 | Admin (Sản phẩm & Upload)[span_26](start_span)[span_26](end_span) | Thiết kế bảng CSDL Sản phẩm (Write), HTML/CSS/JS giao diện quản lý Sản phẩm Admin, PHP API xử lý CRUD sản phẩm và upload ảnh[span_27](start_span)[span_27](end_span). | `frontend/admin/products.html`; `css/admin.css`; `js/admin.js`; `backend/api/products/create.php`; `update.php`; `delete.php`; `upload.php`[span_28](start_span)[span_28](end_span) |
| Thành viên 6 | Admin (Dashboard, Danh mục, User) & Core Setup[span_29](start_span)[span_29](end_span) | Tạo cấu trúc CSDL chung, file kết nối MySQL[span_30](start_span)[span_30](end_span). HTML/CSS/JS và PHP API cho Dashboard, CRUD Danh mục Admin, quản lý User Admin[span_31](start_span)[span_31](end_span). | `database/ecommerce.sql`; `backend/config/`; `frontend/admin/index.html`; `categories.html`; `users.html`; `backend/api/categories/`[span_32](start_span)[span_32](end_span) |

## Cấu trúc thư mục
```text
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
