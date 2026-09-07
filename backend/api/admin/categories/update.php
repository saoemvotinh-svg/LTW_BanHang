<?php

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORIES UPDATE API
| POST /api/admin/categories/update.php
| Body JSON: { "id": 1, "name": "...", "description": "..." }
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

    $input       = json_decode(file_get_contents('php://input'), true);
    $id          = (int) ($input['id']          ?? 0);
    $name        = trim($input['name']        ?? '');
    $description = trim($input['description'] ?? '');

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID danh mục không hợp lệ']);
        exit;
    }

    if (empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập tên danh mục']);
        exit;
    }

    // Kiểm tra danh mục tồn tại
    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy danh mục']);
        exit;
    }

    // Kiểm tra trùng tên (ngoại trừ chính nó)
    $dupStmt = $conn->prepare("SELECT id FROM categories WHERE name = ? AND id != ? LIMIT 1");
    $dupStmt->execute([$name, $id]);
    if ($dupStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Tên danh mục đã tồn tại']);
        exit;
    }

    $updateStmt = $conn->prepare("
        UPDATE categories
        SET name = :name, description = :description
        WHERE id = :id
    ");
    $updateStmt->execute([
        ':name'        => $name,
        ':description' => $description,
        ':id'          => $id,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật danh mục thành công',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
