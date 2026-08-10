# E-Commerce Project

Dự án thương mại điện tử xây dựng với **HTML + JS + PHP + MySQL**, phát triển theo nhóm 6 thành viên. Mỗi thành viên đảm nhận cả Frontend (HTML, JS) lẫn Backend (PHP, MySQL) cho module được phân công.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Backend | PHP (API thuần, không framework) |
| Database | MySQL |
| Luồng xử lý | HTML → JS fetch() → PHP API → Controller → Model → MySQL |

## Phân công thành viên

| Thành viên | Module | Phần chính |
|---|---|---|
| Member 1 | Authentication & User | Đăng nhập, đăng ký, profile, phân quyền |
| Member 2 | Product | Sản phẩm, chi tiết, tìm kiếm |
| Member 3 | Category + Admin Product | Danh mục + quản lý sản phẩm Admin |
| Member 4 | Cart + Checkout | Giỏ hàng + đặt hàng |
| Member 5 | Order | Lịch sử đơn + quản lý đơn Admin |
| Member 6 | Admin + System | Dashboard, quản lý User, tích hợp hệ thống |

## Cấu trúc thư mục

```
ecommerce/
├── frontend/
│   ├── index.html [M6]
│   ├── pages/
│   │   ├── products.html [M2]
│   │   ├── product-detail.html [M2]
│   │   ├── category.html [M3]
│   │   ├── search.html [M2]
│   │   ├── login.html [M1]
│   │   ├── register.html [M1]
│   │   ├── profile.html [M1]
│   │   ├── cart.html [M4]
│   │   ├── checkout.html [M4]
│   │   └── orders.html [M5]
│   ├── admin/
│   │   ├── index.html [M6]
│   │   ├── users.html [M6]
│   │   ├── products.html [M3]
│   │   ├── categories.html [M3]
│   │   └── orders.html [M5]
│   ├── css/
│   │   ├── style.css [M3 + M6]
│   │   ├── responsive.css [M6]
│   │   └── admin.css [M6]
│   ├── js/
│   │   ├── main.js [M6]
│   │   ├── auth.js [M1]
│   │   ├── product.js [M2]
│   │   ├── cart.js [M4]
│   │   ├── checkout.js [M4]
│   │   └── admin.js [M6]
│   └── assets/
│       ├── images/
│       └── icons/
├── backend/
│   ├── config/
│   │   └── database.php [M6]
│   ├── controllers/
│   │   ├── AuthController.php [M1]
│   │   ├── UserController.php [M1/M6]
│   │   ├── ProductController.php [M2/M3]
│   │   ├── CategoryController.php [M3]
│   │   ├── CartController.php [M4]
│   │   ├── CheckoutController.php [M4]
│   │   └── OrderController.php [M5]
│   ├── models/
│   │   ├── User.php [M1]
│   │   ├── Product.php [M2/M3]
│   │   ├── Category.php [M3]
│   │   ├── ProductImage.php [M3]
│   │   ├── Order.php [M4/M5]
│   │   └── OrderDetail.php [M5]
│   ├── api/
│   │   ├── auth/ [M1]
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── logout.php
│   │   │   └── profile.php
│   │   ├── products/ [M2/M3]
│   │   │   ├── list.php
│   │   │   ├── detail.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   ├── delete.php
│   │   │   └── upload.php
│   │   ├── categories/ [M3]
│   │   │   ├── list.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   └── delete.php
│   │   ├── cart/ [M4]
│   │   │   ├── list.php
│   │   │   ├── add.php
│   │   │   ├── update.php
│   │   │   └── delete.php
│   │   └── orders/ [M5]
│   │       ├── create.php
│   │       ├── list.php
│   │       ├── detail.php
│   │       ├── update-status.php
│   │       └── cancel.php
│   ├── middleware/
│   │   └── auth.php [M6]
│   └── uploads/
│       ├── products/
│       └── users/
├── database/
│   └── ecommerce.sql [M6 + ALL]
└── README.md [M6 + ALL]
```

## Chi tiết tính năng theo module

### Member 1 — Authentication & User
- Frontend: `login.html`, `register.html`, `profile.html`, `auth.js`
- Backend: `AuthController.php`, `UserController.php`, `User.php`, API `auth/`
- Tính năng: Đăng ký, đăng nhập, đăng xuất, profile, đổi thông tin cá nhân, đổi mật khẩu, kiểm tra đăng nhập, phân quyền User/Admin
- Database: `users`

### Member 2 — Product (User)
- Frontend: `products.html`, `product-detail.html`, `search.html`, `product.js`
- Backend: `ProductController.php`, `Product.php`, `ProductImage.php`, API `products/`
- Tính năng: Danh sách sản phẩm, chi tiết sản phẩm, tìm kiếm, lọc, phân trang, hiển thị nhiều ảnh, sắp xếp giá
- Database: `products`, `product_images`

### Member 3 — Category + Product Admin
- Frontend: `category.html`, admin `products.html`, `categories.html`
- Backend: `ProductController.php`, `CategoryController.php`, `Product.php`, `Category.php`, API `products/`, `categories/`
- Tính năng Product Admin: Thêm/Xem/Sửa/Xóa sản phẩm, upload nhiều ảnh
- Tính năng Category: Thêm/Xem/Sửa/Xóa danh mục
- Database: `products`, `product_images`, `categories`

### Member 4 — Cart + Checkout
- Frontend: `cart.html`, `checkout.html`, `cart.js`, `checkout.js`
- Backend: `CartController.php`, `CheckoutController.php`, `Order.php`, API `cart/`
- Tính năng Cart: Thêm, xóa, tăng/giảm số lượng, tính tổng tiền
- Tính năng Checkout: Thông tin người nhận, địa chỉ, số điện thoại, phương thức thanh toán, xác nhận đặt hàng
- Kiến thức yêu cầu: JavaScript, Fetch API, PHP API, Session, MySQL, Transaction

### Member 5 — Order
- Frontend user: `orders.html`; Frontend admin: `orders.html`
- Backend: `OrderController.php`, `Order.php`, `OrderDetail.php`, API `orders/`
- Tính năng User: Xem đơn hàng, xem chi tiết, theo dõi trạng thái
- Tính năng Admin: Xem đơn, xem chi tiết, xác nhận, đang giao, hoàn thành, hủy đơn
- Ví dụ trạng thái: `Pending → Confirmed → Shipping → Completed` (hoặc `Pending → Cancelled`)

### Member 6 — Admin + System Integration
- Frontend: `index.html`, admin `index.html`, `users.html`, `admin.css`, `responsive.css`, `main.js`, `admin.js`
- Backend: `database.php`, `auth.php` (middleware), toàn bộ API
- Tính năng Dashboard: Tổng người dùng, tổng sản phẩm, tổng đơn hàng, doanh thu
- Tính năng User Admin: Xem/Thêm/Sửa/Xóa/Khóa User, phân quyền

### File dùng chung (không chia riêng cho một người)
- CSS: `style.css` (giao diện User), `responsive.css` (responsive), `admin.css` (giao diện Admin)
- JS: mỗi người phụ trách JS của module mình

## Quy trình làm việc

1. **BUỚC 1**: Thiết kế Database — cả 6 thành viên cùng thống nhất file `ecommerce.sql` từ đầu (vẽ ERD)
2. **BUỚC 2**: Thống nhất API
3. **BUỚC 3**: Tạo cấu trúc project chung
4. **BUỚC 4**: Mỗi người code module được phân công
5. **BUỚC 5**: Tích hợp Frontend + Backend
6. **BUỚC 6**: Kiểm thử (Test) chéo
7. **BUỚC 7**: Deploy và làm slide báo cáo

> **Lưu ý:** Database `ecommerce.sql` là điểm kết nối tất cả các module. Yêu cầu báo cáo có phần phân tích thiết kế hệ thống và CSDL, vì vậy nhóm nên thiết kế ERD kỹ càng trước khi bắt đầu code. Các thành viên dùng chung model/API (ví dụ Member 2 và Member 3 dùng chung Product) cần thống nhất API và Database trước khi code.