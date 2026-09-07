<?php

/*
|--------------------------------------------------------------------------
| ADMIN CATEGORIES LIST API
| GET /api/admin/categories/list.php
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

    // Lấy danh mục kèm số sản phẩm
    $stmt = $conn->query("
        SELECT
            c.id,
            c.name,
            c.description,
            COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id, c.name, c.description
        ORDER BY c.id DESC
    ");

    $categories = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => $categories,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
