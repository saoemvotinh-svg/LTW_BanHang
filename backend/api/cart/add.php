<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Nhận dữ liệu JSON
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Kiểm tra JSON có hợp lệ không
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dữ liệu JSON không hợp lệ',
        'raw_input' => $rawInput,
        'json_error' => json_last_error_msg()
    ]);
    exit;
}

$productId = isset($input['product_id'])
    ? (int)$input['product_id']
    : 0;

$quantity = isset($input['quantity'])
    ? (int)$input['quantity']
    : 0;

// Kiểm tra dữ liệu
if ($productId <= 0 || $quantity <= 0) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Dữ liệu sản phẩm không hợp lệ',
        'received_data' => $input,
        'product_id' => $productId,
        'quantity' => $quantity
    ]);

    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();
    $userId = null;
    // LẤY BEARER TOKEN
    $bearerToken = null;
    $authHeader = '';
    // Một số máy chủ Apache không tự chuyển Authorization vào HTTP_AUTHORIZATION
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }
    if (preg_match('/^Bearer\s+(\S+)$/i', trim($authHeader), $matches)) {
        $bearerToken = $matches[1];
    }

    // Nếu không có Bearer thì lấy cookie
    $cookieToken = $_COOKIE['login_token'] ?? null;
    $token = $bearerToken ?? $cookieToken;

    error_log("Authorization header: " . $authHeader);
    error_log("Bearer token exists: " . ($bearerToken ? "YES" : "NO"));
    error_log("Cookie token exists: " . ($cookieToken ? "YES" : "NO"));

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
    // Nếu không có token thì kiểm tra PHP session
    if (
        $userId === null &&
        isset($_SESSION['logged_in']) &&
        $_SESSION['logged_in'] === true
    ) {
        $userId = $_SESSION['user_id'] ?? null;
    }
    // Nếu chưa đăng nhập
    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập'
        ]);
        exit;
    }
    // KIỂM TRA SẢN PHẨM
    $stmt = $conn->prepare("
        SELECT id, stock
        FROM products
        WHERE id = :product_id
        LIMIT 1
    ");
    $stmt->execute([
        ':product_id' => $productId
    ]);
    $product = $stmt->fetch();
    if (!$product) {
        echo json_encode([
            'success' => false,
            'message' => 'Sản phẩm không tồn tại'
        ]);
        exit;
    }
    // TÌM GIỎ HÀNG
    $stmt = $conn->prepare("
        SELECT id
        FROM carts
        WHERE user_id = :user_id
        LIMIT 1
    ");
    $stmt->execute([
        ':user_id' => $userId
    ]);
    $cart = $stmt->fetch();
    // Nếu chưa có giỏ hàng thì tạo mới
    if (!$cart) {
        $stmt = $conn->prepare("
            INSERT INTO carts(
                user_id,
                created_at,
                updated_at
            )
            VALUES (
                :user_id,
                NOW(),
                NOW()
            )
        ");
        $stmt->execute([
            ':user_id' => $userId
        ]);
        $cartId = $conn->lastInsertId();
    } else {
        $cartId = $cart['id'];
    }
    // KIỂM TRA SẢN PHẨM TRONG GIỎ
    $stmt = $conn->prepare("
        SELECT id, quantity
        FROM cart_items
        WHERE cart_id = :cart_id
        AND product_id = :product_id
        LIMIT 1
    ");
    $stmt->execute([
        ':cart_id' => $cartId,
        ':product_id' => $productId
    ]);
    $cartItem = $stmt->fetch();
    // NẾU ĐÃ CÓ SẢN PHẨM
    if ($cartItem) {
        $newQuantity = $cartItem['quantity'] + $quantity;
        // Kiểm tra tồn kho
        if ($newQuantity > $product['stock']) {
            echo json_encode([
                'success' => false,
                'message' => 'Số lượng sản phẩm vượt quá tồn kho'
            ]);
            exit;
        }
        $stmt = $conn->prepare("
            UPDATE cart_items
            SET quantity = :quantity
            WHERE id = :id
        ");
        $stmt->execute([
            ':quantity' => $newQuantity,
            ':id' => $cartItem['id']
        ]);
    } else {
        // NẾU CHƯA CÓ SẢN PHẨM
        if ($quantity > $product['stock']) {
            echo json_encode([
                'success' => false,
                'message' => 'Số lượng sản phẩm vượt quá tồn kho'
            ]);
            exit;
        }
        $stmt = $conn->prepare("
            INSERT INTO cart_items(
                cart_id,
                product_id,
                quantity
            )
            VALUES(
                :cart_id,
                :product_id,
                :quantity
            )
        ");
        $stmt->execute([
            ':cart_id' => $cartId,
            ':product_id' => $productId,
            ':quantity' => $quantity
        ]);
    }
    // CẬP NHẬT THỜI GIAN GIỎ HÀNG
    $stmt = $conn->prepare("
        UPDATE carts
        SET updated_at = NOW()
        WHERE id = :cart_id
    ");
    $stmt->execute([
        ':cart_id' => $cartId
    ]);
    // RESPONSE
    echo json_encode([
        'success' => true,
        'message' => 'Đã thêm sản phẩm vào giỏ hàng',
        'cart_id' => $cartId,
        'product_id' => $productId,
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