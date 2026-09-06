<?php
// backend/api/products/get_all.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->connect();
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $catStmt = $conn->prepare("SELECT id, name, description FROM categories ORDER BY id ASC");
    $catStmt->execute();
    $allCategories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

    $category_id = isset($_GET['category_id']) && $_GET['category_id'] !== '' && $_GET['category_id'] !== 'all' 
                   ? (int)$_GET['category_id'] 
                   : null;
    $sort   = isset($_GET['sort']) ? trim($_GET['sort']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    $page   = isset($_GET['page']) && (int)$_GET['page'] > 0 ? (int)$_GET['page'] : 1;
    $limit  = isset($_GET['limit']) && (int)$_GET['limit'] > 0 ? (int)$_GET['limit'] : 8;
    $offset = ($page - 1) * $limit;

    $whereSql = " WHERE 1=1";
    $params = [];

    if ($category_id !== null && $category_id > 0) {
        $whereSql .= " AND p.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }

    if ($search !== '') {
        $whereSql .= " AND (p.name COLLATE utf8mb4_unicode_ci LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $countSql = "SELECT COUNT(*) AS total FROM products p" . $whereSql;
    $stmtCount = $conn->prepare($countSql);
    foreach ($params as $key => $val) {
        $stmtCount->bindValue($key, $val);
    }
    $stmtCount->execute();
    $totalRecords = (int)$stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPages   = $totalRecords > 0 ? (int)ceil($totalRecords / $limit) : 1;


    $dataSql = "
        SELECT p.id, p.category_id, p.name, p.price, p.stock, p.description, p.created_at,
               c.name AS category_name,
               COALESCE(pi.image_url, '') AS image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        " . $whereSql;

    if ($sort === 'price_asc') {
        $dataSql .= " ORDER BY p.price ASC";
    } elseif ($sort === 'price_desc') {
        $dataSql .= " ORDER BY p.price DESC";
    } else {
        $dataSql .= " ORDER BY p.id DESC";
    }

    $dataSql .= " LIMIT :limit OFFSET :offset";

    $stmtData = $conn->prepare($dataSql);
    foreach ($params as $key => $val) {
        $stmtData->bindValue($key, $val);
    }
    $stmtData->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmtData->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmtData->execute();

    $products = $stmtData->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "success"    => true,
        "categories" => $allCategories, 
        "pagination" => [
            "current_page" => $page,
            "limit"        => $limit,
            "total_records"=> $totalRecords,
            "total_pages"  => $totalPages
        ],
        "data"       => $products      
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi server: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}