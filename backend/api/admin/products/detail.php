<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT DETAIL API
| GET /api/admin/products/detail.php?id=123
| Lấy thông tin chi tiết sản phẩm và danh sách tất cả hình ảnh
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
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID sản phẩm không hợp lệ']);
        exit;
    }

    // --- 1. Lấy thông tin sản phẩm ---
    $stmtProd = $conn->prepare("
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = :id
        LIMIT 1
    ");
    $stmtProd->execute([':id' => $id]);
    $product = $stmtProd->fetch();

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        exit;
    }

    // --- 2. Lấy thông tin hình ảnh ---
    $stmtImg = $conn->prepare("
        SELECT id, image_url, is_primary 
        FROM product_images 
        WHERE product_id = :id
        ORDER BY is_primary DESC, id ASC
    ");
    $stmtImg->execute([':id' => $id]);
    $images = $stmtImg->fetchAll();

    // Map lại để trả về primary_image và total_images
    $primary_image = null;
    foreach ($images as &$img) {
        $img['is_primary'] = (bool)$img['is_primary'];
        if ($img['is_primary'] && !$primary_image) {
            $primary_image = $img;
        }
    }

    // Chuẩn bị response
    $product['images'] = $images;
    $product['primary_image'] = $primary_image;
    $product['total_images'] = count($images);

    echo json_encode([
        'success' => true,
        'data'    => $product
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
