<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');


if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
if ($cartItemId <= 0) {
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
    $bearerToken = null;

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (empty($authHeader)) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = getallheaders();

        $authHeader =
            $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }

    $cookieToken = $_COOKIE['login_token'] ?? null;
    $token = $bearerToken ?: $cookieToken;

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

    if (
        $userId === null &&
        isset($_SESSION['logged_in']) &&
        $_SESSION['logged_in'] === true
    ) {
        $userId = $_SESSION['user_id'] ?? null;
    }
    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập'
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT
            ci.id,
            ci.cart_id
        FROM cart_items ci
        INNER JOIN carts c
            ON ci.cart_id = c.id
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
    // xóa sản phẩm
    $stmt = $conn->prepare("
        DELETE FROM cart_items
        WHERE id = :id
    ");
    $stmt->execute([
        ':id' => $cartItemId
    ]);
    // cập nhật thời gian
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
        'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
        'cart_item_id' => $cartItemId
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error' => $e->getMessage()
    ]);
}