<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCTS LIST API
| GET /api/admin/products/list.php
| Hỗ trợ: search, filter category, filter stock, sort, pagination
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

    // --- Tham số từ query string ---
    $search      = trim($_GET['search']      ?? '');
    $category_id = isset($_GET['category_id']) && $_GET['category_id'] !== '' && $_GET['category_id'] !== 'all'
                   ? (int) $_GET['category_id']
                   : null;
    $stock_filter = trim($_GET['stock'] ?? ''); // 'in_stock' | 'out_stock'
    $sort         = trim($_GET['sort']   ?? '');  // 'price_asc' | 'price_desc' | 'newest'
    $page         = max(1, (int) ($_GET['page']  ?? 1));
    $limit        = max(1, (int) ($_GET['limit'] ?? 15));
    $offset       = ($page - 1) * $limit;

    // --- Xây dựng WHERE ---
    $whereClauses = ['1=1'];
    $params       = [];

    if ($search !== '') {
        $whereClauses[] = "(p.name LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if ($category_id !== null) {
        $whereClauses[] = "p.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }

    if ($stock_filter === 'in_stock') {
        $whereClauses[] = "p.stock > 0";
    } elseif ($stock_filter === 'out_stock') {
        $whereClauses[] = "p.stock = 0";
    }

    $whereSQL = "WHERE " . implode(" AND ", $whereClauses);

    // --- Đếm tổng ---
    $countSQL = "SELECT COUNT(*) AS total FROM products p $whereSQL";
    $stmtCount = $conn->prepare($countSQL);
    foreach ($params as $k => $v) {
        $stmtCount->bindValue($k, $v);
    }
    $stmtCount->execute();
    $totalRecords = (int) $stmtCount->fetch()['total'];
    $totalPages   = $totalRecords > 0 ? (int) ceil($totalRecords / $limit) : 1;

    // --- ORDER BY ---
    $orderSQL = match($sort) {
        'price_asc'  => "ORDER BY p.price ASC",
        'price_desc' => "ORDER BY p.price DESC",
        default      => "ORDER BY p.id DESC",
    };

    // --- Lấy dữ liệu ---
    $dataSQL = "
        SELECT
            p.id,
            p.name,
            p.price,
            p.stock,
            p.description,
            p.created_at,
            p.category_id,
            c.name    AS category_name,
            COALESCE(pi.image_url, '') AS image,
            COALESCE(SUM(oi.quantity), 0) AS total_sold
        FROM products p
        LEFT JOIN categories c   ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        LEFT JOIN order_items oi ON p.id = oi.product_id
        $whereSQL
        GROUP BY p.id, p.name, p.price, p.stock, p.description, p.created_at,
                 p.category_id, c.name, pi.image_url
        $orderSQL
        LIMIT :limit OFFSET :offset
    ";

    $stmtData = $conn->prepare($dataSQL);
    foreach ($params as $k => $v) {
        $stmtData->bindValue($k, $v);
    }
    $stmtData->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmtData->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmtData->execute();
    $products = $stmtData->fetchAll();

    // --- Lấy danh sách categories cho filter ---
    $catStmt = $conn->query("SELECT id, name FROM categories ORDER BY name ASC");
    $categories = $catStmt->fetchAll();

    echo json_encode([
        'success'    => true,
        'categories' => $categories,
        'pagination' => [
            'current_page'  => $page,
            'limit'         => $limit,
            'total_records' => $totalRecords,
            'total_pages'   => $totalPages,
        ],
        'data' => $products,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
