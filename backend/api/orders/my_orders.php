<?php
require_once __DIR__ . '/../../config/database.php';
session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
try {
    $db = new Database();
    $conn = $db->connect();
    $userId = null;
    // Lấy Bearer token từ Authorization
    $bearerToken = null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }
    // Lấy token từ cookie
    $cookieToken = $_COOKIE['login_token'] ?? null;
    // Ưu tiên Bearer token
    $tokenToCheck = $bearerToken ?? $cookieToken;
    if (!empty($tokenToCheck)) {
        $stmt = $conn->prepare("
            SELECT user_id, expires_at
            FROM sessions
            WHERE session_token = :token
            AND expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([
            ':token' => $tokenToCheck
        ]);
        $session = $stmt->fetch();
        if ($session) {
            $userId = $session['user_id'];
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
            o.id AS order_id,
            o.customer_name,
            o.phone,
            o.address,
            o.total_amount,
            o.status,
            o.created_at,
            oi.id AS order_item_id,
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            p.name AS product_name,
            pi.image_url
        FROM orders o
        INNER JOIN order_items oi
            ON o.id = oi.order_id
        INNER JOIN products p
            ON oi.product_id = p.id
        LEFT JOIN (
            SELECT
                product_id,
                MAX(image_url) AS image_url
            FROM product_images
            WHERE is_primary = 1
            GROUP BY product_id
        ) pi
            ON p.id = pi.product_id
        WHERE o.user_id = :user_id
        ORDER BY o.created_at DESC, o.id DESC
    ");
    $stmt->execute([
        ':user_id' => $userId
    ]);
    $rows = $stmt->fetchAll();
    if (!$rows) {
        echo json_encode([
            'success' => true,
            'message' => 'Bạn chưa có đơn hàng nào',
            'orders' => []
        ]);
        exit;
    }
    $orders = [];
    foreach ($rows as $row) {
        $orderId = $row['order_id'];
        if (!isset($orders[$orderId])) {
            $orders[$orderId] = [
                'order_id' => $row['order_id'],
                'customer_name' => $row['customer_name'],
                'phone' => $row['phone'],
                'address' => $row['address'],
                'total_amount' => $row['total_amount'],
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'items' => []
            ];
        }
        $orders[$orderId]['items'][] = [
            'order_item_id' => $row['order_item_id'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'image_url' => $row['image_url'],
            'quantity' => $row['quantity'],
            'unit_price' => $row['unit_price'],
            'subtotal' => $row['subtotal']
        ];
    }
    echo json_encode([
        'success' => true,
        'orders' => array_values($orders)
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}