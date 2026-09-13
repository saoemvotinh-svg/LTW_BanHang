<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');


if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Phương thức không được hỗ trợ'
    ]);
    exit;
}

session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$input = json_decode(
    file_get_contents('php://input'),
    true
);

$cartItemId = (int)($input['cart_item_id'] ?? 0);
$quantity = (int)($input['quantity'] ?? 0);

if ($cartItemId <= 0 || $quantity <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Dữ liệu không hợp lệ'
    ]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();
    $userId = null;

    // LẤY BEARER TOKEN
    $bearerToken = null;

    // Apache có thể lưu Authorization ở nhiều vị trí khác nhau
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    // Nếu chưa lấy được thì thử getallheaders()
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = getallheaders();

        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? '';
    }

    // Tách token từ chuỗi: Bearer abc123
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }

    // Nếu không có Bearer thì lấy cookie
    $cookieToken = $_COOKIE['login_token'] ?? null;

    $token = $bearerToken ?? $cookieToken;

    // KIỂM TRA SESSION TOKEN
    if (!empty($token)) {
        $stmt = $conn->prepare("
            SELECT user_id
            FROM sessions
            WHERE session_token = :token
            AND expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([
            ':token' => $token
        ]);

        $session = $stmt->fetch();

        if ($session) {
            $userId = (int)$session['user_id'];
        }
    }

    // Nếu không xác thực được bằng token thì kiểm tra PHP session
    if (
        $userId === null &&
        isset($_SESSION['logged_in']) &&
        $_SESSION['logged_in'] === true
    ) {
        $userId = isset($_SESSION['user_id'])
            ? (int)$_SESSION['user_id']
            : null;
    }

    // CHƯA ĐĂNG NHẬP
    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập'
        ]);
        exit;
    }

    // TÌM CART ITEM
    $stmt = $conn->prepare("
        SELECT
            ci.id,
            ci.cart_id,
            ci.product_id,
            p.stock
        FROM cart_items ci
        INNER JOIN carts c
            ON ci.cart_id = c.id
        INNER JOIN products p
            ON ci.product_id = p.id
        WHERE ci.id = :cart_item_id
        AND c.user_id = :user_id
        LIMIT 1
    ");

    $stmt->execute([
        ':cart_item_id' => $cartItemId,
        ':user_id' => $userId
    ]);

    $cartItem = $stmt->fetch();

    if (!$cartItem) {
        echo json_encode([
            'success' => false,
            'message' => 'Sản phẩm không có trong giỏ hàng'
        ]);
        exit;
    }

    // KIỂM TRA TỒN KHO
    if ($quantity > (int)$cartItem['stock']) {
        echo json_encode([
            'success' => false,
            'message' => 'Số lượng sản phẩm vượt quá tồn kho'
        ]);
        exit;
    }

    // CẬP NHẬT SỐ LƯỢNG
    $stmt = $conn->prepare("
        UPDATE cart_items
        SET quantity = :quantity
        WHERE id = :id
    ");

    $stmt->execute([
        ':quantity' => $quantity,
        ':id' => $cartItemId
    ]);

    // CẬP NHẬT THỜI GIAN GIỎ HÀNG
    $stmt = $conn->prepare("
        UPDATE carts
        SET updated_at = NOW()
        WHERE id = :cart_id
    ");

    $stmt->execute([
        ':cart_id' => $cartItem['cart_id']
    ]);

    // RESPONSE
    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật số lượng thành công',
        'cart_item_id' => $cartItemId,
        'quantity' => $quantity
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error' => $e->getMessage()
    ]);
}