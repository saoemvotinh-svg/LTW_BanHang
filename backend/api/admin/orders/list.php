<?php

/*
|--------------------------------------------------------------------------
| ADMIN ORDERS LIST API
| GET /api/admin/orders/list.php
| Hỗ trợ: search, filter status, pagination
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

    $search    = trim($_GET['search'] ?? '');
    $status    = trim($_GET['status'] ?? '');
    $date_from = trim($_GET['date_from'] ?? '');
    $date_to   = trim($_GET['date_to']   ?? '');
    $page      = max(1, (int) ($_GET['page']  ?? 1));
    $limit     = max(1, (int) ($_GET['limit'] ?? 15));
    $offset    = ($page - 1) * $limit;

    // --- WHERE ---
    $whereClauses = ['1=1'];
    $params       = [];

    if ($search !== '') {
        $whereClauses[] = "(o.customer_name LIKE :search OR o.phone LIKE :search OR o.id LIKE :search_id)";
        $params[':search']    = '%' . $search . '%';
        $params[':search_id'] = '%' . $search . '%';
    }

    $validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if ($status !== '' && in_array($status, $validStatuses)) {
        $whereClauses[] = "o.status = :status";
        $params[':status'] = $status;
    }

    if ($date_from !== '') {
        $whereClauses[] = "DATE(o.created_at) >= :date_from";
        $params[':date_from'] = $date_from;
    }

    if ($date_to !== '') {
        $whereClauses[] = "DATE(o.created_at) <= :date_to";
        $params[':date_to'] = $date_to;
    }

    $whereSQL = "WHERE " . implode(" AND ", $whereClauses);

    // --- Đếm tổng ---
    $countSQL  = "SELECT COUNT(*) AS total FROM orders o $whereSQL";
    $stmtCount = $conn->prepare($countSQL);
    foreach ($params as $k => $v) {
        $stmtCount->bindValue($k, $v);
    }
    $stmtCount->execute();
    $totalRecords = (int) $stmtCount->fetch()['total'];
    $totalPages   = $totalRecords > 0 ? (int) ceil($totalRecords / $limit) : 1;

    // --- Lấy dữ liệu ---
    $dataSQL = "
        SELECT
            o.id,
            o.customer_name,
            o.phone,
            o.address,
            o.total_amount,
            o.status,
            o.created_at,
            u.email AS user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        $whereSQL
        ORDER BY o.created_at DESC, o.id DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmtData = $conn->prepare($dataSQL);
    foreach ($params as $k => $v) {
        $stmtData->bindValue($k, $v);
    }
    $stmtData->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmtData->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmtData->execute();
    $orders = $stmtData->fetchAll();

    // --- Thống kê theo trạng thái (cho summary cards) ---
    $summaryStmt = $conn->query("
        SELECT status, COUNT(*) AS count
        FROM orders
        GROUP BY status
    ");
    $summaryRows = $summaryStmt->fetchAll();
    $summary = [];
    foreach ($summaryRows as $row) {
        $summary[$row['status']] = (int) $row['count'];
    }

    echo json_encode([
        'success'    => true,
        'summary'    => $summary,
        'pagination' => [
            'current_page'  => $page,
            'limit'         => $limit,
            'total_records' => $totalRecords,
            'total_pages'   => $totalPages,
        ],
        'data' => $orders,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
