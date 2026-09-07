<?php

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORIES DELETE API
| POST /api/admin/categories/delete.php
| Body JSON: { "id": 1 }
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
        echo json_encode(['success' => false, 'message' => 'ID danh mục không hợp lệ']);
        exit;
    }

    // Kiểm tra tồn tại
    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy danh mục']);
        exit;
    }

    // Kiểm tra có sản phẩm trong danh mục không
    $prodCheck = $conn->prepare("SELECT COUNT(*) AS cnt FROM products WHERE category_id = ?");
    $prodCheck->execute([$id]);
    $cnt = (int) $prodCheck->fetch()['cnt'];

    if ($cnt > 0) {
        echo json_encode([
            'success' => false,
            'message' => "Không thể xóa vì danh mục có $cnt sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $deleteStmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $deleteStmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Xóa danh mục thành công',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
