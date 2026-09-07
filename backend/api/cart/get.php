<?php

/*
|--------------------------------------------------------------------------
| CART GET API
| GET /api/cart/get.php
| Lấy giỏ hàng của user đang đăng nhập
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ GET']);
    exit;
}

session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {

    $db   = new Database();
    $conn = $db->connect();

    // Xác thực user qua token hoặc session
    $userId = null;

    $bearerToken = null;
    $authHeader  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }
    $cookieToken  = $_COOKIE['login_token'] ?? null;
    $tokenToCheck = $bearerToken ?? $cookieToken;

    if (!empty($tokenToCheck)) {
        $stmt = $conn->prepare("
            SELECT s.user_id
            FROM sessions s
            WHERE s.session_token = :token AND s.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $tokenToCheck]);
        $row = $stmt->fetch();
        if ($row) {
            $userId = (int) $row['user_id'];
        }
    }

    if ($userId === null && isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        $userId = (int) $_SESSION['user_id'];
    }

    if ($userId === null) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập']);
        exit;
    }

    // Lấy cart của user (mỗi user chỉ có 1 cart)
    $cartStmt = $conn->prepare("SELECT id FROM carts WHERE user_id = ? LIMIT 1");
    $cartStmt->execute([$userId]);
    $cart = $cartStmt->fetch();

    if (!$cart) {
        // Chưa có cart → trả giỏ rỗng
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    $cartId = (int) $cart['id'];

    // Lấy cart items kèm thông tin sản phẩm
    $itemsStmt = $conn->prepare("
        SELECT
            ci.id,
            ci.product_id,
            ci.quantity,
            p.name        AS product_name,
            p.price       AS unit_price,
            p.stock,
            COALESCE(pi.image_url, '') AS image
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE ci.cart_id = ?
        ORDER BY ci.id ASC
    ");
    $itemsStmt->execute([$cartId]);
    $items = $itemsStmt->fetchAll();

    // Tính subtotal cho mỗi item
    foreach ($items as &$item) {
        $item['subtotal'] = (float) $item['unit_price'] * (int) $item['quantity'];
    }

    echo json_encode([
        'success' => true,
        'data'    => $items,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
