<?php

/*
|--------------------------------------------------------------------------
| ADMIN ORDERS DETAIL API
| GET /api/admin/orders/detail.php?id=123
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
        echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ']);
        exit;
    }

    // --- Lấy thông tin đơn hàng ---
    $orderStmt = $conn->prepare("
        SELECT
            o.id,
            o.customer_name,
            o.phone,
            o.address,
            o.total_amount,
            o.status,
            o.created_at,
            u.email AS user_email,
            u.id    AS user_id
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = :id
        LIMIT 1
    ");
    $orderStmt->execute([':id' => $id]);
    $order = $orderStmt->fetch();
    
    if ($order) {
        $dbToFrontend = [
            'processing' => 'confirmed',
            'shipped'    => 'shipping',
            'delivered'  => 'completed',
        ];
        $order['status'] = $dbToFrontend[$order['status']] ?? $order['status'];
    }

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng']);
        exit;
    }

    // --- Lấy sản phẩm trong đơn ---
    $itemsStmt = $conn->prepare("
        SELECT
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            p.name AS product_name,
            COALESCE(pi.image_url, '') AS image
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE oi.order_id = :order_id
        ORDER BY oi.id ASC
    ");
    $itemsStmt->execute([':order_id' => $id]);
    $items = $itemsStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => [
            'order' => $order,
            'items' => $items,
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
