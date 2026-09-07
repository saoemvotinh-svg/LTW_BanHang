<?php

/*
|--------------------------------------------------------------------------
| ADMIN USERS DETAIL API
| GET /api/admin/users/detail.php?id=123
| Trả thông tin user + thống kê đơn hàng + đánh giá
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ GET']);
    exit;
}

[$conn] = requireAdmin();

try {

    $id = (int) ($_GET['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID người dùng không hợp lệ']);
        exit;
    }

    // --- Thông tin cơ bản ---
    $userStmt = $conn->prepare("
        SELECT id, full_name, email, phone, address, role, created_at
        FROM users
        WHERE id = :id
        LIMIT 1
    ");
    $userStmt->execute([':id' => $id]);
    $user = $userStmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy người dùng']);
        exit;
    }

    // --- Thống kê đơn hàng ---
    $orderStmt = $conn->prepare("
        SELECT
            COUNT(*) AS order_count,
            COALESCE(SUM(total_amount), 0) AS total_spent
        FROM orders
        WHERE user_id = :id
    ");
    $orderStmt->execute([':id' => $id]);
    $orderStats = $orderStmt->fetch();

    // --- Thống kê đánh giá ---
    $reviewStmt = $conn->prepare("
        SELECT
            COUNT(*) AS review_count,
            COALESCE(AVG(rating), 0) AS avg_rating
        FROM reviews
        WHERE user_id = :id
    ");
    $reviewStmt->execute([':id' => $id]);
    $reviewStats = $reviewStmt->fetch();

    // --- 5 đơn hàng gần nhất ---
    $recentOrdersStmt = $conn->prepare("
        SELECT id, total_amount, status, created_at
        FROM orders
        WHERE user_id = :id
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $recentOrdersStmt->execute([':id' => $id]);
    $recentOrders = $recentOrdersStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => [
            'user'          => $user,
            'order_count'   => (int)   $orderStats['order_count'],
            'total_spent'   => (float) $orderStats['total_spent'],
            'review_count'  => (int)   $reviewStats['review_count'],
            'avg_rating'    => round((float) $reviewStats['avg_rating'], 1),
            'recent_orders' => $recentOrders,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
