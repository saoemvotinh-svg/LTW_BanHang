<?php

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORIES CREATE API
| POST /api/admin/categories/create.php
| Body JSON: { "name": "...", "description": "..." }
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
    $name        = trim($input['name']        ?? '');
    $description = trim($input['description'] ?? '');

    if (empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập tên danh mục']);
        exit;
    }

    if (mb_strlen($name) > 150) {
        echo json_encode(['success' => false, 'message' => 'Tên danh mục quá dài (tối đa 150 ký tự)']);
        exit;
    }

    // Kiểm tra tên danh mục đã tồn tại chưa
    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
    $checkStmt->execute([$name]);
    if ($checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Danh mục này đã tồn tại']);
        exit;
    }

    $insertStmt = $conn->prepare("
        INSERT INTO categories (name, description)
        VALUES (:name, :description)
    ");
    $insertStmt->execute([
        ':name'        => $name,
        ':description' => $description,
    ]);

    $newId = (int) $conn->lastInsertId();

    echo json_encode([
        'success'     => true,
        'message'     => 'Thêm danh mục thành công',
        'category_id' => $newId,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
