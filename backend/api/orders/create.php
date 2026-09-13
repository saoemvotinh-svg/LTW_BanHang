<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=UTF-8');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Chỉ hỗ trợ phương thức POST'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function responseJson($success, $message, $extra = [], $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode(
        array_merge([
            'success' => $success,
            'message' => $message
        ], $extra),
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    $userId = null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = getallheaders();

        $authHeader =
            $headers['Authorization']
            ?? $headers['authorization']
            ?? '';
    }
    $bearerToken = null;
    if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $bearerToken = trim($matches[1]);
    }

    $cookieToken = $_COOKIE['login_token'] ?? null;
    $token = $bearerToken ?: $cookieToken;
    if (!empty($token)) {
        $sessionStmt = $conn->prepare("
            SELECT user_id
            FROM sessions
            WHERE session_token = :token
              AND expires_at > NOW()
            LIMIT 1
        ");
        $sessionStmt->execute([
            ':token' => $token
        ]);
        $sessionData = $sessionStmt->fetch(PDO::FETCH_ASSOC);
        if ($sessionData) {
            $userId = (int) $sessionData['user_id'];
        }
    }

    if (
        $userId === null &&
        isset($_SESSION['logged_in']) &&
        $_SESSION['logged_in'] === true
    ) {
        $userId = (int) ($_SESSION['user_id'] ?? 0);
    }
    if (!$userId) {
        responseJson(
            false,
            'Vui lòng đăng nhập trước khi đặt hàng',
            [],
            401
        );
    }

    $input = json_decode(
        file_get_contents('php://input'),
        true
    );
    if (!is_array($input)) {
        responseJson(
            false,
            'Dữ liệu gửi lên không hợp lệ',
            [],
            400
        );
    }
    $customerName = trim($input['fullname'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');

    if ($customerName === '') {
        responseJson(false, 'Vui lòng nhập họ và tên');
    }
    if ($phone === '') {
        responseJson(false, 'Vui lòng nhập số điện thoại');
    }
    if (!preg_match('/^(0|\+84)[0-9]{9}$/', $phone)) {
        responseJson(false, 'Số điện thoại không hợp lệ');
    }
    if ($address === '') {
        responseJson(false, 'Vui lòng nhập địa chỉ nhận hàng');
    }

    $conn->beginTransaction();

    $cartStmt = $conn->prepare("
        SELECT id
        FROM carts
        WHERE user_id = :user_id
        LIMIT 1
    ");
    $cartStmt->execute([
        ':user_id' => $userId
    ]);
    $cart = $cartStmt->fetch(PDO::FETCH_ASSOC);
    if (!$cart) {
        $conn->rollBack();
        responseJson(false, 'Giỏ hàng đang trống');
    }

    $cartId = (int) $cart['id'];

    $itemsStmt = $conn->prepare("
        SELECT
            ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.stock
        FROM cart_items ci
        INNER JOIN products p
            ON ci.product_id = p.id
        WHERE ci.cart_id = :cart_id
        FOR UPDATE
    ");
    $itemsStmt->execute([
        ':cart_id' => $cartId
    ]);
    $cartItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$cartItems) {
        $conn->rollBack();

        responseJson(false, 'Giỏ hàng đang trống');
    }

    $totalAmount = 0;
    foreach ($cartItems as $item) {
        $quantity = (int) $item['quantity'];
        $stock = (int) $item['stock'];
        $price = (float) $item['price'];
        if ($quantity <= 0) {
            $conn->rollBack();
            responseJson(false, 'Số lượng sản phẩm không hợp lệ');
        }
        if ($quantity > $stock) {
            $conn->rollBack();
            responseJson(
                false,
                'Sản phẩm "' . $item['name'] . '" không đủ tồn kho'
            );
        }
        $totalAmount += $price * $quantity;
    }

    $orderStmt = $conn->prepare("
        INSERT INTO orders (
            user_id,
            customer_name,
            phone,
            address,
            total_amount,
            status,
            created_at
        )
        VALUES (
            :user_id,
            :customer_name,
            :phone,
            :address,
            :total_amount,
            :status,
            NOW()
        )
    ");
    $orderStmt->execute([
        ':user_id' => $userId,
        ':customer_name' => $customerName,
        ':phone' => $phone,
        ':address' => $address,
        ':total_amount' => $totalAmount,
        ':status' => 'pending'
    ]);

    $orderId = (int) $conn->lastInsertId();
    $orderItemStmt = $conn->prepare("
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
        )
        VALUES (
            :order_id,
            :product_id,
            :quantity,
            :unit_price,
            :subtotal
        )
    ");

    $stockStmt = $conn->prepare("
        UPDATE products
        SET stock = stock - :qty_set
        WHERE id = :product_id
            AND stock >= :qty_where
    ");

    foreach ($cartItems as $item) {
        $productId = (int) $item['product_id'];
        $quantity = (int) $item['quantity'];
        $unitPrice = (float) $item['price'];
        $subtotal = $unitPrice * $quantity;

        $orderItemStmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $productId,
            ':quantity' => $quantity,
            ':unit_price' => $unitPrice,
            ':subtotal' => $subtotal
        ]);

        $stockStmt->execute([
            ':qty_set' => $quantity,
            ':product_id' => $productId,
            ':qty_where' => $quantity
        ]);

        if ($stockStmt->rowCount() === 0) {
            throw new Exception(
                'Không thể cập nhật tồn kho cho sản phẩm ID ' . $productId
            );
        }
    }
// xóa sản phẩm sau khi đặt
    $deleteCartItemsStmt = $conn->prepare("
        DELETE FROM cart_items
        WHERE cart_id = :cart_id
    ");

    $deleteCartItemsStmt->execute([
        ':cart_id' => $cartId
    ]);

    $conn->commit();
    responseJson(
        true,
        'Đặt hàng thành công',
        [
            'order_id' => $orderId,
            'total_amount' => $totalAmount
        ]
    );
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    responseJson(
        false,
        'Lỗi máy chủ: ' . $e->getMessage(),
        [],
        500
    );
}