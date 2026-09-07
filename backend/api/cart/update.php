<?php

/*
|--------------------------------------------------------------------------
| CART UPDATE API
| POST /api/cart/update.php
| Body JSON: { "cart_item_id": 5, "quantity": 3 }
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ POST']);
    exit;
}

session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {

    $db   = new Database();
    $conn = $db->connect();

    // Xác thực user
    $userId = null;

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $stmt = $conn->prepare("
            SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1
        ");
        $stmt->execute([$matches[1]]);
        $row = $stmt->fetch();
        if ($row) {
            $userId = (int) $row['user_id'];
        }
    }

    if ($userId === null && ($cookie = $_COOKIE['login_token'] ?? null)) {
        $stmt = $conn->prepare("
            SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1
        ");
        $stmt->execute([$cookie]);
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

    $input        = json_decode(file_get_contents('php://input'), true);
    $cart_item_id = (int) ($input['cart_item_id'] ?? 0);
    $quantity     = (int) ($input['quantity']     ?? 0);

    if ($cart_item_id <= 0 || $quantity < 1) {
        echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
        exit;
    }

    // Kiểm tra cart_item thuộc về user này
    $checkStmt = $conn->prepare("
        SELECT ci.id, p.stock
        FROM cart_items ci
        INNER JOIN carts c ON ci.cart_id = c.id
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ? AND c.user_id = ?
        LIMIT 1
    ");
    $checkStmt->execute([$cart_item_id, $userId]);
    $item = $checkStmt->fetch();

    if (!$item) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm trong giỏ']);
        exit;
    }

    // Không cho phép đặt số lượng vượt tồn kho
    $safeQty = min($quantity, (int) $item['stock']);

    $updateStmt = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE id = ?");
    $updateStmt->execute([$safeQty, $cart_item_id]);

    echo json_encode([
        'success'  => true,
        'message'  => 'Đã cập nhật giỏ hàng',
        'quantity' => $safeQty,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
