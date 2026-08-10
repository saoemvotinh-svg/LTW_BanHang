# Website Bán Hàng Cơ Bản
Website bán hàng cơ bản - Bài tập môn học. Phạm vi project được giữ ở mức cơ bản để phù hợp bài tập môn học: **không triển khai đặt hàng, thanh toán online hoặc cổng thanh toán**. Tập trung vào hiển thị sản phẩm, tìm kiếm/danh mục, giỏ hàng cơ bản, tài khoản User và quản trị Admin.
## Công nghệ
- **Frontend:** HTML + CSS + JavaScript
- **Backend:** PHP + MySQL
## Tính năng cuối kỳ
- Trang chủ và giao diện sản phẩm.
- Danh sách sản phẩm, chi tiết sản phẩm, danh mục, tìm kiếm/lọc cơ bản.
- Giỏ hàng cơ bản: thêm, xóa, tăng/giảm số lượng, tính tổng tiền.
- Tài khoản: đăng ký, đăng nhập, đăng xuất, profile.
- Admin: Dashboard đơn giản, CRUD sản phẩm, CRUD danh mục, quản lý User.
- PHP + MySQL Backend; HTML/CSS/JS Frontend tách riêng.
- Responsive cơ bản.
- **Không** triển khai đặt hàng, checkout, thanh toán online hoặc tích hợp cổng thanh toán.
## Phân công nhóm (Yêu cầu Full-stack cho tất cả thành viên)

| Thành viên | Module | Nhiệm vụ (HTML, CSS, JS, PHP, MySQL) | File chính |
| :--- | :--- | :--- | :--- |
| Thành viên 1 | Xác thực & Người dùng (Auth/User) | Thiết kế bảng CSDL User, dựng HTML/CSS/JS, viết PHP API cho đăng ký, đăng nhập, profile và middleware bảo vệ trang. | `frontend/login.html`; `register.html`; `profile.html`; `css/auth.css`; `js/auth.js`; `backend/models/User.php`; `backend/api/auth/` |
| Thành viên 2 | Trang chủ & Giao diện chung | Thiết kế HTML/CSS/JS layout chung (Header, Footer, Banner). Thiết kế CSDL (Read) và PHP API hiển thị sản phẩm nổi bật, banner. | `frontend/index.html`; `includes/header.html`; `includes/footer.html`; `css/global.css`; `js/main.js`; `backend/api/products/list.php` |
| Thành viên 3 | Sản phẩm & Danh mục (Public) | Thiết kế CSDL Danh mục, HTML/CSS/JS và PHP API cho trang danh sách sản phẩm, chi tiết sản phẩm, lọc và tìm kiếm. | `frontend/pages/products.html`; `product-detail.html`; `category.html`; `search.html`; `css/product.css`; `js/product.js`; `backend/models/Category.php`; `backend/api/categories/list.php` |
| Thành viên 4 | Giỏ hàng cơ bản | Thiết kế bảng CSDL Giỏ hàng, HTML/CSS/JS và PHP API xử lý thêm, xóa, sửa số lượng, tính tổng tiền (không checkout). | `frontend/pages/cart.html`; `css/cart.css`; `js/cart.js`; `backend/models/Cart.php`; `backend/api/cart/` |
| Thành viên 5 | Admin (Sản phẩm & Upload) | Thiết kế bảng CSDL Sản phẩm (Write), HTML/CSS/JS giao diện quản lý Sản phẩm Admin, PHP API xử lý CRUD sản phẩm và upload ảnh. | `frontend/admin/products.html`; `css/admin.css`; `js/admin.js`; `backend/api/products/create.php`; `update.php`; `delete.php`; `upload.php` |
| Thành viên 6 | Admin (Dashboard, Danh mục, User) & Core Setup | Tạo cấu trúc CSDL chung, file kết nối MySQL. HTML/CSS/JS và PHP API cho Dashboard, CRUD Danh mục Admin, quản lý User Admin. | `database/ecommerce.sql`; `backend/config/`; `frontend/admin/index.html`; `categories.html`; `users.html`; `backend/api/categories/` |

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
