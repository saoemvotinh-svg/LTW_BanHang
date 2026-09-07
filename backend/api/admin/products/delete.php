<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCTS DELETE API
| POST /api/admin/products/delete.php
| Body JSON: { "id": 123 }
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

    $input = json_decode(file_get_contents('php://input'), true);
    $id    = (int) ($input['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID sản phẩm không hợp lệ']);
        exit;
    }

    // --- Kiểm tra sản phẩm tồn tại ---
    $checkStmt = $conn->prepare("SELECT id FROM products WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        exit;
    }

    // --- Kiểm tra sản phẩm có trong đơn hàng không ---
    // (Nếu có thì không xóa để giữ lịch sử đơn hàng)
    $orderCheck = $conn->prepare("
        SELECT COUNT(*) AS cnt FROM order_items WHERE product_id = ?
    ");
    $orderCheck->execute([$id]);
    $cnt = (int) $orderCheck->fetch()['cnt'];

    if ($cnt > 0) {
        echo json_encode([
            'success' => false,
            'message' => "Không thể xóa vì sản phẩm đã có trong $cnt đơn hàng. Hãy để tồn kho = 0 thay thế.",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // --- Xóa sản phẩm (cascade sẽ xóa product_images, reviews, cart_items) ---
    $deleteStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $deleteStmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Xóa sản phẩm thành công',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
