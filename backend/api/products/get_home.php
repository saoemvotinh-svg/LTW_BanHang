<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->connect();

    // 1. LẤY 4 SẢN PHẨM MỚI NHẤT
    $sqlLatest = "
        SELECT p.id, p.name, p.price, p.stock, p.created_at,
               c.name AS category_name,
               COALESCE(pi.image_url, '') AS image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 4
    ";
    $stmtLatest = $conn->prepare($sqlLatest);
    $stmtLatest->execute();
    $latestProducts = $stmtLatest->fetchAll(PDO::FETCH_ASSOC);

    // 2. LẤY 4 SẢN PHẨM BÁN CHẠY NHẤT (NỔI BẬT)
    // Tính tổng số lượng bán từ bảng order_items
    $sqlBestSeller = "
        SELECT p.id, p.name, p.price, p.stock,
               c.name AS category_name,
               COALESCE(pi.image_url, '') AS image,
               COALESCE(SUM(oi.quantity), 0) AS total_sold
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id, p.name, p.price, p.stock, c.name, pi.image_url
        ORDER BY total_sold DESC, p.id DESC
        LIMIT 4
    ";
    $stmtBest = $conn->prepare($sqlBestSeller);
    $stmtBest->execute();
    $bestSellers = $stmtBest->fetchAll(PDO::FETCH_ASSOC);

    // Trả cả 2 danh mục về cho Frontend
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => [
            "latest" => $latestProducts,
            "best_sellers" => $bestSellers
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi server: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}