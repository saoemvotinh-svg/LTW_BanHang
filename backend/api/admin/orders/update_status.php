<?php

/*
|--------------------------------------------------------------------------
| ADMIN ORDERS UPDATE STATUS API
| POST /api/admin/orders/update_status.php
| Body JSON: { "id": 123, "status": "confirmed" }
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ POST']);
    exit;
}

[$conn] = requireAdmin();

try {

    $input  = json_decode(file_get_contents('php://input'), true);
    $id     = (int) ($input['id']     ?? 0);
    $status = trim($input['status'] ?? '');

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID đơn hàng không hợp lệ']);
        exit;
    }

    $validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Trạng thái không hợp lệ']);
        exit;
    }

    $frontendToDb = [
        'confirmed' => 'processing',
        'shipping'  => 'shipped',
        'completed' => 'delivered',
        'pending'   => 'pending',
        'cancelled' => 'cancelled'
    ];
    $dbStatusToUpdate = $frontendToDb[$status];

    // Kiểm tra đơn hàng tồn tại
    $checkStmt = $conn->prepare("SELECT id, status FROM orders WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $order = $checkStmt->fetch();

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng']);
        exit;
    }

    $dbToFrontend = [
        'processing' => 'confirmed',
        'shipped'    => 'shipping',
        'delivered'  => 'completed',
    ];
    $mappedCurrentStatus = $dbToFrontend[$order['status']] ?? $order['status'];

    // Không cho phép thay đổi đơn đã hủy thành trạng thái khác
    if ($mappedCurrentStatus === 'cancelled' && $status !== 'cancelled') {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể thay đổi trạng thái đơn hàng đã hủy'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $updateStmt = $conn->prepare("
        UPDATE orders
        SET status = :status
        WHERE id = :id
    ");
    $updateStmt->execute([
        ':status' => $dbStatusToUpdate,
        ':id'     => $id,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật trạng thái đơn hàng thành công',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
