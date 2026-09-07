<?php

/*
|--------------------------------------------------------------------------
| ADMIN USERS LIST API
| GET /api/admin/users/list.php
| Hỗ trợ: search, filter role, pagination
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

    $search = trim($_GET['search'] ?? '');
    $role   = trim($_GET['role']   ?? '');
    $page   = max(1, (int) ($_GET['page']  ?? 1));
    $limit  = max(1, (int) ($_GET['limit'] ?? 15));
    $offset = ($page - 1) * $limit;

    // --- WHERE ---
    $whereClauses = ['1=1'];
    $params       = [];

    if ($search !== '') {
        $whereClauses[] = "(u.full_name LIKE :search OR u.email LIKE :search OR u.phone LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $validRoles = ['admin', 'customer'];
    if ($role !== '' && in_array($role, $validRoles)) {
        $whereClauses[] = "u.role = :role";
        $params[':role'] = $role;
    }

    $whereSQL = "WHERE " . implode(" AND ", $whereClauses);

    // --- Đếm tổng ---
    $countSQL  = "SELECT COUNT(*) AS total FROM users u $whereSQL";
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
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.role,
            u.created_at,
            COUNT(DISTINCT o.id) AS order_count
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        $whereSQL
        GROUP BY u.id, u.full_name, u.email, u.phone, u.role, u.created_at
        ORDER BY u.id DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmtData = $conn->prepare($dataSQL);
    foreach ($params as $k => $v) {
        $stmtData->bindValue($k, $v);
    }
    $stmtData->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmtData->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmtData->execute();
    $users = $stmtData->fetchAll();

    echo json_encode([
        'success'    => true,
        'pagination' => [
            'current_page'  => $page,
            'limit'         => $limit,
            'total_records' => $totalRecords,
            'total_pages'   => $totalPages,
        ],
        'data' => $users,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
