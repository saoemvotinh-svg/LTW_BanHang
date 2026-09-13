<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');


if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
try {
    $db = new Database();
    $conn = $db->connect();
    $userId = null;
    // LẤY BEARER TOKEN
    $bearerToken = null;
    // Thử lấy Authorization từ nhiều nguồn
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? '';
    }

    // Tách token Bearer
    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        $bearerToken = trim($matches[1]);
    }
    // Nếu không có Bearer thì lấy cookie
    $cookieToken = $_COOKIE['login_token'] ?? null;
    $token = $bearerToken ?: $cookieToken;
    
    error_log("AUTH HEADER: " . $authHeader);
    error_log("TOKEN: " . ($token ?? 'NULL'));

    // KIỂM TRA SESSION TOKEN
    if (!empty($token)) {
        $stmt = $conn->prepare("
            SELECT user_id, session_token, expires_at
            FROM sessions
            WHERE session_token = :token
            AND expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([
            ':token' => $token
        ]);
        $session = $stmt->fetch();
        error_log("SESSION RESULT: " . print_r($session, true));
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
    // CHƯA ĐĂNG NHẬP
    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập'
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
    // Nếu chưa có giỏ hàng
    if (!$cart) {
        echo json_encode([
            'success' => true,
            'cart_id' => null,
            'items' => []
        ]);
        exit;
    }
    $cartId = (int)$cart['id'];

    // LẤY SẢN PHẨM TRONG GIỎ
    $stmt = $conn->prepare("
        SELECT
            ci.id,
            ci.cart_id,
            ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.stock,
            p.description,
            p.category_id,
            c.name AS category_name,
            pi.image_url
        FROM cart_items ci
        INNER JOIN products p
            ON ci.product_id = p.id

        LEFT JOIN categories c
            ON p.category_id = c.id

        LEFT JOIN product_images pi
            ON p.id = pi.product_id
            AND pi.is_primary = 1

        WHERE ci.cart_id = :cart_id
        ORDER BY ci.id DESC
    ");
    $stmt->execute([
        ':cart_id' => $cartId
    ]);
    $items = $stmt->fetchAll();

    // RESPONSE
    echo json_encode([
        'success' => true,
        'cart_id' => $cartId,
        'items' => $items
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error' => $e->getMessage()
    ]);

}