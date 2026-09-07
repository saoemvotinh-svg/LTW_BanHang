<?php

/*
|--------------------------------------------------------------------------
| CART ADD API
| POST /api/cart/add.php
| Body JSON: { "product_id": 1, "quantity": 2 }
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

    $bearerToken = null;
    $authHeader  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }
    $cookieToken  = $_COOKIE['login_token'] ?? null;
    $tokenToCheck = $bearerToken ?? $cookieToken;

    if (!empty($tokenToCheck)) {
        $stmt = $conn->prepare("
            SELECT s.user_id FROM sessions s
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

    $input      = json_decode(file_get_contents('php://input'), true);
    $product_id = (int) ($input['product_id'] ?? 0);
    $quantity   = max(1, (int) ($input['quantity'] ?? 1));

    if ($product_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Sản phẩm không hợp lệ']);
        exit;
    }

    // Kiểm tra sản phẩm tồn tại và còn hàng
    $productStmt = $conn->prepare("SELECT id, stock FROM products WHERE id = ? LIMIT 1");
    $productStmt->execute([$product_id]);
    $product = $productStmt->fetch();

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Sản phẩm không tồn tại']);
        exit;
    }

    if ((int) $product['stock'] <= 0) {
        echo json_encode(['success' => false, 'message' => 'Sản phẩm đã hết hàng']);
        exit;
    }

    // Lấy hoặc tạo cart
    $cartStmt = $conn->prepare("SELECT id FROM carts WHERE user_id = ? LIMIT 1");
    $cartStmt->execute([$userId]);
    $cart = $cartStmt->fetch();

    if (!$cart) {
        $createCart = $conn->prepare("
            INSERT INTO carts (user_id, created_at, updated_at)
            VALUES (?, NOW(), NOW())
        ");
        $createCart->execute([$userId]);
        $cartId = (int) $conn->lastInsertId();
    } else {
        $cartId = (int) $cart['id'];
    }

    // Kiểm tra sản phẩm đã trong giỏ chưa
    $itemCheck = $conn->prepare("
        SELECT id, quantity FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        LIMIT 1
    ");
    $itemCheck->execute([$cartId, $product_id]);
    $existingItem = $itemCheck->fetch();

    if ($existingItem) {
        // Tăng số lượng
        $newQty = (int) $existingItem['quantity'] + $quantity;
        $newQty = min($newQty, (int) $product['stock']); // Không vượt tồn kho

        $updateItem = $conn->prepare("
            UPDATE cart_items SET quantity = ? WHERE id = ?
        ");
        $updateItem->execute([$newQty, (int) $existingItem['id']]);
    } else {
        // Thêm mới
        $addItem = $conn->prepare("
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES (?, ?, ?)
        ");
        $addItem->execute([$cartId, $product_id, $quantity]);
    }

    // Cập nhật updated_at của cart
    $conn->prepare("UPDATE carts SET updated_at = NOW() WHERE id = ?")->execute([$cartId]);

    echo json_encode([
        'success' => true,
        'message' => 'Đã thêm vào giỏ hàng',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
