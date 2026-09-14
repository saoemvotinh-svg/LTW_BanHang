<?php

require_once __DIR__ . '/../../config/database.php';

session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ POST']);
    exit;
}

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
    $tokenToCheck = $bearerToken ?? $cookieToken;

    if (!empty($tokenToCheck)) {
        $stmt = $conn->prepare("
            SELECT user_id, expires_at 
            FROM sessions 
            WHERE session_token = :token 
            AND expires_at > NOW() 
            LIMIT 1
        ");
        $stmt->execute([':token' => $tokenToCheck]);
        $session = $stmt->fetch();
        if ($session) {
            $userId = $session['user_id'];
        }
    }

    if ($userId === null && isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        $userId = $_SESSION['user_id'] ?? null;
    }

    if ($userId === null) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $orderId = (int)($input['order_id'] ?? 0);

    if ($orderId <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ']);
        exit;
    }

    // Kiểm tra đơn hàng thuộc về user này không và lấy trạng thái
    $checkStmt = $conn->prepare("SELECT id, status FROM orders WHERE id = :id AND user_id = :user_id LIMIT 1");
    $checkStmt->execute([
        ':id' => $orderId,
        ':user_id' => $userId
    ]);
    $order = $checkStmt->fetch();

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn']);
        exit;
    }

    // Trạng thái cho phép hủy: pending, processing
    $allowedStatusesToCancel = ['pending', 'processing'];
    if (!in_array($order['status'], $allowedStatusesToCancel)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Không thể hủy đơn hàng vì trạng thái hiện tại là: ' . $order['status']
        ]);
        exit;
    }

    // Cập nhật trạng thái thành cancelled
    $updateStmt = $conn->prepare("UPDATE orders SET status = 'cancelled' WHERE id = :id");
    $updateStmt->execute([':id' => $orderId]);

    // Phục hồi số lượng (stock)
    $itemsStmt = $conn->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :order_id");
    $itemsStmt->execute([':order_id' => $orderId]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    $restoreStmt = $conn->prepare("UPDATE products SET stock = stock + :quantity WHERE id = :product_id");
    foreach ($orderItems as $item) {
        $restoreStmt->execute([
            ':quantity' => $item['quantity'],
            ':product_id' => $item['product_id']
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Hủy đơn hàng thành công'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
