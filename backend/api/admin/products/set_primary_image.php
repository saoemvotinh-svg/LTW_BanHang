<?php

/*
|--------------------------------------------------------------------------
| ADMIN SET PRIMARY IMAGE API
| POST /api/admin/products/set_primary_image.php
| Body JSON: { "product_id": 1, "image_id": 2 }
| Đặt 1 ảnh làm ảnh chính, các ảnh khác của sản phẩm đó về 0
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
    $product_id = (int) ($input['product_id'] ?? 0);
    $image_id = (int) ($input['image_id'] ?? 0);

    if ($product_id <= 0 || $image_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
        exit;
    }

    $conn->beginTransaction();

    // Reset tất cả về 0
    $resetStmt = $conn->prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = :pid");
    $resetStmt->execute([':pid' => $product_id]);

    // Set 1
    $setStmt = $conn->prepare("UPDATE product_images SET is_primary = 1 WHERE id = :id AND product_id = :pid");
    $setStmt->execute([':id' => $image_id, ':pid' => $product_id]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật ảnh chính thành công'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
