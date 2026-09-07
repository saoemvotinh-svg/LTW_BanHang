<?php

/*
|--------------------------------------------------------------------------
| ORDERS CREATE API
| POST /api/orders/create.php
| Body JSON: { "customer_name": "...", "phone": "...", "address": "..." }
| Transaction: tạo order → order_items → xóa cart
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
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập để đặt hàng']);
        exit;
    }

    // Nhận thông tin đơn hàng
    $input         = json_decode(file_get_contents('php://input'), true);
    $customerName  = trim($input['customer_name'] ?? '');
    $phone         = trim($input['phone']         ?? '');
    $address       = trim($input['address']       ?? '');

    // Validate
    if (empty($customerName)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập họ và tên']);
        exit;
    }

    if (empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập số điện thoại']);
        exit;
    }

    if (!preg_match('/^(0|\+84)[0-9]{9}$/', $phone)) {
        echo json_encode(['success' => false, 'message' => 'Số điện thoại không hợp lệ']);
        exit;
    }

    if (empty($address)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập địa chỉ nhận hàng']);
        exit;
    }

    // Lấy giỏ hàng
    $cartStmt = $conn->prepare("SELECT id FROM carts WHERE user_id = ? LIMIT 1");
    $cartStmt->execute([$userId]);
    $cart = $cartStmt->fetch();

    if (!$cart) {
        echo json_encode(['success' => false, 'message' => 'Giỏ hàng đang trống']);
        exit;
    }

    $cartId = (int) $cart['id'];

    // Lấy cart items kèm thông tin sản phẩm
    $itemsStmt = $conn->prepare("
        SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity, p.price, p.stock, p.name
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ?
    ");
    $itemsStmt->execute([$cartId]);
    $cartItems = $itemsStmt->fetchAll();

    if (empty($cartItems)) {
        echo json_encode(['success' => false, 'message' => 'Giỏ hàng đang trống']);
        exit;
    }

    // Kiểm tra tồn kho tất cả sản phẩm
    foreach ($cartItems as $item) {
        if ((int) $item['quantity'] > (int) $item['stock']) {
            echo json_encode([
                'success' => false,
                'message' => "Sản phẩm \"" . $item['name'] . "\" chỉ còn " . $item['stock'] . " cái trong kho"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Tính tổng tiền
    $totalAmount = 0;
    foreach ($cartItems as $item) {
        $totalAmount += (float) $item['price'] * (int) $item['quantity'];
    }


    // --- TRANSACTION ---
    $conn->beginTransaction();

    // 1. Tạo đơn hàng
    $orderStmt = $conn->prepare("
        INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status, created_at)
        VALUES (:user_id, :customer_name, :phone, :address, :total_amount, 'pending', NOW())
    ");
    $orderStmt->execute([
        ':user_id'       => $userId,
        ':customer_name' => $customerName,
        ':phone'         => $phone,
        ':address'       => $address,
        ':total_amount'  => $totalAmount,
    ]);

    $orderId = (int) $conn->lastInsertId();

    // 2. Tạo order_items + cập nhật stock
    foreach ($cartItems as $item) {
        $subtotal = (float) $item['price'] * (int) $item['quantity'];

        $insertItem = $conn->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
            VALUES (:order_id, :product_id, :quantity, :unit_price, :subtotal)
        ");
        $insertItem->execute([
            ':order_id'   => $orderId,
            ':product_id' => $item['product_id'],
            ':quantity'   => $item['quantity'],
            ':unit_price' => $item['price'],
            ':subtotal'   => $subtotal,
        ]);

        // Giảm tồn kho
        $updateStock = $conn->prepare("
            UPDATE products SET stock = stock - ? WHERE id = ?
        ");
        $updateStock->execute([$item['quantity'], $item['product_id']]);
    }

    // 3. Xóa giỏ hàng
    $conn->prepare("DELETE FROM cart_items WHERE cart_id = ?")->execute([$cartId]);

    $conn->commit();

    echo json_encode([
        'success'  => true,
        'message'  => 'Đặt hàng thành công! Cảm ơn bạn đã mua hàng.',
        'order_id' => $orderId,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
