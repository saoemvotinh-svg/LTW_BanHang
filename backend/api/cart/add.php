<?php
// 1. DANH SÁCH ORIGIN ĐƯỢC PHÉP TRUY CẬP (SẴN SÀNG CHO DEPLOY)
$allowedOrigins = [
    'http://127.0.0.1:5500',

    // Điền domain deploy frontend của bạn vào đây khi lên host (ví dụ: 'https://my-shop.vercel.app')
];

$httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($httpOrigin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $httpOrigin");
} elseif (!empty($httpOrigin)) {
    // Tự động nhận diện origin nếu đang chạy môi trường test/local
    header("Access-Control-Allow-Origin: $httpOrigin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. PHẢN HỒI NGAY CHO PREFLIGHT REQUEST (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. CHỈ CHẤP NHẬN PHƯƠNG THỨC POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Phương thức không được hỗ trợ'
    ]);
    exit();
}

// 4. INCLUDE CẤU HÌNH & DATABASE
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

// Khởi tạo session an toàn nếu có dùng fallback session
if (defined('SESSION_NAME')) {
    session_name(SESSION_NAME);
}
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 5. ĐỌC DỮ LIỆU JSON TỪ BODY
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dữ liệu JSON không hợp lệ'
    ]);
    exit();
}

$productId = isset($input['product_id']) ? (int)$input['product_id'] : 0;
$quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;

if ($productId <= 0 || $quantity <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Thông tin sản phẩm hoặc số lượng không hợp lệ'
    ]);
    exit();
}

try {
    $db = new Database();
    $conn = $db->connect();
    $userId = null;

    // 6. XÁC THỰC NGƯỜI DÙNG (ƯU TIÊN BEARER TOKEN QUA HEADER -> COOKIE -> SESSION)
    $bearerToken = null;
    $authHeader = '';

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', trim($authHeader), $matches)) {
        $bearerToken = $matches[1];
    }

    $token = $bearerToken ?? ($_COOKIE['login_token'] ?? null);

    if (!empty($token)) {
        $stmt = $conn->prepare("
            SELECT user_id 
            FROM sessions 
            WHERE session_token = :token 
            AND expires_at > NOW() 
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($session) {
            $userId = (int)$session['user_id'];
        }
    }

    // Fallback nếu dùng PHP Session cơ bản
    if ($userId === null && isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        $userId = $_SESSION['user_id'] ?? null;
    }

    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập để thực hiện'
        ]);
        exit();
    }

    // 7. KIỂM TRA SẢN PHẨM & SỐ LƯỢNG TỒN KHO
    $stmt = $conn->prepare("SELECT id, name, stock FROM products WHERE id = :product_id LIMIT 1");
    $stmt->execute([':product_id' => $productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Sản phẩm không tồn tại'
        ]);
        exit();
    }

    // 8. LẤY HOẶC KHỞI TẠO GIỎ HÀNG CHO USER
    $stmt = $conn->prepare("SELECT id FROM carts WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $userId]);
    $cart = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cart) {
        $stmt = $conn->prepare("
            INSERT INTO carts (user_id, created_at, updated_at) 
            VALUES (:user_id, NOW(), NOW())
        ");
        $stmt->execute([':user_id' => $userId]);
        $cartId = $conn->lastInsertId();
    } else {
        $cartId = $cart['id'];
    }

    // 9. CẬP NHẬT HOẶC TẠO MỚI ITEM TRONG GIỎ
    $stmt = $conn->prepare("
        SELECT id, quantity 
        FROM cart_items 
        WHERE cart_id = :cart_id AND product_id = :product_id 
        LIMIT 1
    ");
    $stmt->execute([
        ':cart_id' => $cartId,
        ':product_id' => $productId
    ]);
    $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cartItem) {
        $newQuantity = $cartItem['quantity'] + $quantity;
        if ($newQuantity > $product['stock']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Tổng số lượng trong giỏ vượt quá tồn kho (Hiện có: ' . $product['stock'] . ')'
            ]);
            exit();
        }

        $stmt = $conn->prepare("UPDATE cart_items SET quantity = :quantity WHERE id = :id");
        $stmt->execute([
            ':quantity' => $newQuantity,
            ':id' => $cartItem['id']
        ]);
    } else {
        if ($quantity > $product['stock']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Số lượng yêu cầu vượt quá tồn kho'
            ]);
            exit();
        }

        $stmt = $conn->prepare("
            INSERT INTO cart_items (cart_id, product_id, quantity) 
            VALUES (:cart_id, :product_id, :quantity)
        ");
        $stmt->execute([
            ':cart_id' => $cartId,
            ':product_id' => $productId,
            ':quantity' => $quantity
        ]);
    }

    // Cập nhật timestamp cho cart
    $stmt = $conn->prepare("UPDATE carts SET updated_at = NOW() WHERE id = :cart_id");
    $stmt->execute([':cart_id' => $cartId]);

    // 10. PHẢN HỒI THÀNH CÔNG
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công',
        'cart_id' => (int)$cartId,
        'product_id' => $productId,
        'quantity' => $quantity
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi truy vấn cơ sở dữ liệu',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ nội bộ',
        'error' => $e->getMessage()
    ]);
}