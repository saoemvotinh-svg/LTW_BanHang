<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->connect();
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID sản phẩm không hợp lệ']);
        exit;
    }
    $stmtProd = $conn->prepare("
        SELECT p.*, c.name AS category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = :id LIMIT 1
    ");
    $stmtProd->execute([':id' => $id]);
    $product = $stmtProd->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        exit;
    }
    $stmtImg = $conn->prepare("SELECT image_url, is_primary FROM product_images WHERE product_id = :id ORDER BY is_primary DESC");
    $stmtImg->execute([':id' => $id]);
    $images = $stmtImg->fetchAll(PDO::FETCH_ASSOC);
    $stmtRev = $conn->prepare("
        SELECT r.rating, r.comment, r.created_at, u.full_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = :id 
        ORDER BY r.created_at DESC
    ");
    $stmtRev->execute([':id' => $id]);
    $reviews = $stmtRev->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'product' => $product,
            'images' => $images,
            'reviews' => $reviews
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>