// =============================================
// BASE URL — Thay đổi khi deploy lên hosting
// =============================================
// Development: "http://localhost:8080/"
// Production:  "/" (nếu frontend và backend cùng domain)
// Hoặc:        "https://domain.com/" (nếu khác domain)
export const BASE_URL = "http://localhost:8080/";


// =============================================
// IMAGE URL HELPER
// =============================================
/**
 * Chuyển relative image path (lưu trong DB) thành URL đầy đủ để dùng trong <img src>.
 *
 * Kiến trúc:
 *   - Backend chạy tại: http://localhost:8080/  (document root = thư mục backend/)
 *   - File ảnh nằm:   backend/assets/products/abc.jpg
 *   - URL truy cập:   http://localhost:8080/assets/products/abc.jpg
 *   - DB lưu:          assets/products/abc.jpg
 *
 * Khi deploy cùng domain: đổi BASE_URL thành domain thật.
 * Frontend không bao giờ hard-code localhost trong component.
 *
 * @param {string} imagePath - Relative path từ DB, có thể null/undefined
 * @param {string} fallback  - URL fallback nếu không có ảnh
 * @returns {string} URL đầy đủ
 */
export function getImageUrl(imagePath, fallback = 'https://placehold.co/60x60/e2e8f0/94a3b8?text=SP') {
    if (!imagePath || imagePath.trim() === '') {
        return fallback;
    }

    // Nếu đã là URL đầy đủ (http/https) — trả về nguyên
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Path mới từ DB: "assets/products/abc123.jpg"
    // Backend server root = backend/ nên đường dẫn web là BASE_URL + path
    // Ví dụ: http://localhost:8080/assets/products/abc123.jpg
    if (imagePath.startsWith('assets/')) {
        return BASE_URL + imagePath;
    }

    // Path cũ (backward compatibility): "../assets/images/products/abc.jpg"
    // Lấy basename và map sang path mới
    if (imagePath.includes('/')) {
        const filename = imagePath.split('/').pop();
        if (imagePath.includes('/products/')) {
            return BASE_URL + 'assets/products/' + filename;
        }
        if (imagePath.includes('/categories/')) {
            return BASE_URL + 'assets/categories/' + filename;
        }
        if (imagePath.includes('/users/')) {
            return BASE_URL + 'assets/users/' + filename;
        }
    }

    // Fallback
    return fallback;
}


// =============================================
// AUTH
// =============================================
export const HOME_URL      = BASE_URL;
export const LOGIN_URL     = BASE_URL + "api/auth/login.php";
export const REGISTER_URL  = BASE_URL + "api/auth/register.php";
export const LOGOUT_URL    = BASE_URL + "api/auth/logout.php";
export const CHECK_URL     = BASE_URL + "api/auth/check.php";
export const PROFILE_URL   = BASE_URL + "api/auth/profile.php";

// =============================================
// PRODUCTS (frontend user)
// =============================================
export const GET_HOME_PRODUCTS_URL = BASE_URL + "api/products/get_home.php";
export const GET_ALL_PRODUCTS_URL  = BASE_URL + "api/products/get_all.php";
export const GET_PRODUCT_DETAIL_URL = BASE_URL + "api/products/detail.php";

// =============================================
// CART
// =============================================
export const CART_GET_URL    = BASE_URL + "api/cart/get.php";
export const CART_ADD_URL    = BASE_URL + "api/cart/add.php";
export const CART_UPDATE_URL = BASE_URL + "api/cart/update.php";
export const CART_REMOVE_URL = BASE_URL + "api/cart/remove.php";

// =============================================
// ORDERS (user)
// =============================================
export const ORDER_CREATE_URL = BASE_URL + "api/orders/create.php";

// =============================================
// ADMIN APIs
// =============================================
export const ADMIN_DASHBOARD_URL = BASE_URL + "api/admin/dashboard.php";

export const ADMIN_PRODUCTS_LIST_URL   = BASE_URL + "api/admin/products/list.php";
export const ADMIN_PRODUCTS_DETAIL_URL = BASE_URL + "api/admin/products/detail.php";
export const ADMIN_PRODUCTS_CREATE_URL = BASE_URL + "api/admin/products/create.php";
export const ADMIN_PRODUCTS_UPDATE_URL = BASE_URL + "api/admin/products/update.php";
export const ADMIN_PRODUCTS_DELETE_URL = BASE_URL + "api/admin/products/delete.php";
export const ADMIN_PRODUCTS_DELETE_IMAGE_URL = BASE_URL + "api/admin/products/delete_image.php";
export const ADMIN_PRODUCTS_SET_PRIMARY_URL  = BASE_URL + "api/admin/products/set_primary_image.php";

export const ADMIN_CATEGORIES_LIST_URL   = BASE_URL + "api/admin/categories/list.php";
export const ADMIN_CATEGORIES_CREATE_URL = BASE_URL + "api/admin/categories/create.php";
export const ADMIN_CATEGORIES_UPDATE_URL = BASE_URL + "api/admin/categories/update.php";
export const ADMIN_CATEGORIES_DELETE_URL = BASE_URL + "api/admin/categories/delete.php";

export const ADMIN_ORDERS_LIST_URL          = BASE_URL + "api/admin/orders/list.php";
export const ADMIN_ORDERS_DETAIL_URL        = BASE_URL + "api/admin/orders/detail.php";
export const ADMIN_ORDERS_UPDATE_STATUS_URL = BASE_URL + "api/admin/orders/update_status.php";

export const ADMIN_USERS_LIST_URL   = BASE_URL + "api/admin/users/list.php";
export const ADMIN_USERS_DETAIL_URL = BASE_URL + "api/admin/users/detail.php";
export const ADMIN_USERS_CHANGE_PASSWORD_URL = BASE_URL + "api/admin/users/change_password.php";