<?php

/*
|--------------------------------------------------------------------------
| PRODUCTS DETAIL API
| GET /api/products/detail.php?id=123
|--------------------------------------------------------------------------
*/

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ GET']);
    exit;
}

try {

    $id = (int) ($_GET['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID sản phẩm không hợp lệ']);
        exit;
    }

    $db   = new Database();
    $conn = $db->connect();

    // Lấy thông tin sản phẩm
    $productStmt = $conn->prepare("
        SELECT
            p.id,
            p.name,
            p.price,
            p.stock,
            p.description,
            p.created_at,
            p.category_id,
            c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = :id
        LIMIT 1
    ");
    $productStmt->execute([':id' => $id]);
    $product = $productStmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        exit;
    }

    // Lấy tất cả ảnh của sản phẩm
    $imagesStmt = $conn->prepare("
        SELECT id, image_url, is_primary
        FROM product_images
        WHERE product_id = :product_id
        ORDER BY is_primary DESC, id ASC
    ");
    $imagesStmt->execute([':product_id' => $id]);
    $images = $imagesStmt->fetchAll();

    // Lấy đánh giá
    $reviewsStmt = $conn->prepare("
        SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.full_name AS reviewer_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = :product_id
        ORDER BY r.created_at DESC
        LIMIT 10
    ");
    $reviewsStmt->execute([':product_id' => $id]);
    $reviews = $reviewsStmt->fetchAll();

    // Rating trung bình
    $ratingStmt = $conn->prepare("
        SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
        FROM reviews WHERE product_id = ?
    ");
    $ratingStmt->execute([$id]);
    $ratingData = $ratingStmt->fetch();

    echo json_encode([
        'success' => true,
        'data'    => [
            'product'       => $product,
            'images'        => $images,
            'reviews'       => $reviews,
            'avg_rating'    => round((float) $ratingData['avg_rating'], 1),
            'total_reviews' => (int) $ratingData['total_reviews'],
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
