<?php

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD API
| GET /api/admin/dashboard.php
| Trả thống kê tổng quan: stats, top sản phẩm, đơn hàng mới, danh mục
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ GET']);
    exit;
}

[$conn] = requireAdmin();

try {

    // --- 1. Tổng số sản phẩm ---
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM products");
    $totalProducts = (int) $stmt->fetch()['total'];

    // --- 2. Tổng số đơn hàng ---
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM orders");
    $totalOrders = (int) $stmt->fetch()['total'];

    // --- 3. Tổng người dùng (role = customer) ---
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    $totalUsers = (int) $stmt->fetch()['total'];

    // --- 4. Tổng doanh thu (chỉ tính đơn đã giao) ---
    $stmt = $conn->query("
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE status = 'completed'
    ");
    $totalRevenue = (float) $stmt->fetch()['total'];

    // --- 5. Top 5 sản phẩm bán chạy ---
    $stmt = $conn->query("
        SELECT
            p.id,
            p.name,
            COALESCE(SUM(oi.quantity), 0) AS total_sold,
            COALESCE(pi.image_url, '') AS image
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        GROUP BY p.id, p.name, pi.image_url
        ORDER BY total_sold DESC
        LIMIT 5
    ");
    $topProducts = $stmt->fetchAll();

    // --- 6. Đơn hàng mới nhất (10 đơn) ---
    $stmt = $conn->query("
        SELECT
            o.id,
            o.customer_name,
            o.total_amount,
            o.status,
            o.created_at
        FROM orders o
        ORDER BY o.created_at DESC, o.id DESC
        LIMIT 10
    ");
    $recentOrders = $stmt->fetchAll();

    // --- 7. Thống kê đơn hàng theo trạng thái ---
    $stmt = $conn->query("
        SELECT status, COUNT(*) AS count
        FROM orders
        GROUP BY status
    ");
    $ordersByStatus = $stmt->fetchAll();

    // Chuyển thành dạng key => count để JS dễ đọc
    $orderStatusMap = [];
    foreach ($ordersByStatus as $row) {
        $orderStatusMap[$row['status']] = (int) $row['count'];
    }

    // --- 8. Thống kê sản phẩm theo danh mục ---
    $stmt = $conn->query("
        SELECT
            c.id,
            c.name,
            COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
    ");
    $categoryStats = $stmt->fetchAll();

    // --- 9. Doanh thu theo period (week / month / year) ---
    $period = $_GET['period'] ?? 'week';
    $chartData = [];

    if ($period === 'month') {
        // Tạo sẵn mảng 12 tháng gần nhất (để tránh bị khuyết tháng trên chart)
        for ($i = 11; $i >= 0; $i--) {
            $ts = strtotime("first day of -$i month");
            $sortKey = date('Ym', $ts);
            $chartData[$sortKey] = [
                'date' => date('m/Y', $ts),
                'sort_key' => $sortKey,
                'order_count' => 0,
                'revenue' => 0
            ];
        }

        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y%m') AS sort_key,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE status = 'completed'
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y%m')
        ");
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            if (isset($chartData[$r['sort_key']])) {
                $chartData[$r['sort_key']]['order_count'] = $r['order_count'];
                $chartData[$r['sort_key']]['revenue'] = $r['revenue'];
            }
        }
    } elseif ($period === 'year') {
        // Tạo sẵn mảng 5 năm gần nhất
        $currentYear = (int)date('Y');
        for ($i = 4; $i >= 0; $i--) {
            $y = (string)($currentYear - $i);
            $chartData[$y] = [
                'date' => $y,
                'sort_key' => $y,
                'order_count' => 0,
                'revenue' => 0
            ];
        }

        $stmt = $conn->query("
            SELECT
                YEAR(created_at) AS sort_key,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE status = 'completed'
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 YEAR)
            GROUP BY YEAR(created_at)
        ");
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            if (isset($chartData[$r['sort_key']])) {
                $chartData[$r['sort_key']]['order_count'] = $r['order_count'];
                $chartData[$r['sort_key']]['revenue'] = $r['revenue'];
            }
        }
    } else {
        // Mặc định: Tạo sẵn mảng 8 tuần gần nhất
        for ($i = 7; $i >= 0; $i--) {
            $ts = strtotime("-$i week");
            $w = date('W', $ts);
            $y = date('o', $ts);
            $sortKey = $y . $w;
            $chartData[$sortKey] = [
                'date' => "T$w/$y",
                'sort_key' => $sortKey,
                'order_count' => 0,
                'revenue' => 0
            ];
        }

        $stmt = $conn->query("
            SELECT
                YEARWEEK(created_at, 1) AS sort_key,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE status = 'completed'
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 WEEK)
            GROUP BY YEARWEEK(created_at, 1)
        ");
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            if (isset($chartData[$r['sort_key']])) {
                $chartData[$r['sort_key']]['order_count'] = $r['order_count'];
                $chartData[$r['sort_key']]['revenue'] = $r['revenue'];
            }
        }
    }

    // Chuyển chartData (associative array) thành mảng tuần tự
    $revenueChart = array_values($chartData);



    echo json_encode([
        'success' => true,
        'data'    => [
            'stats' => [
                'total_products' => $totalProducts,
                'total_orders'   => $totalOrders,
                'total_users'    => $totalUsers,
                'total_revenue'  => $totalRevenue,
            ],
            'top_products'    => $topProducts,
            'recent_orders'   => $recentOrders,
            'order_by_status' => $orderStatusMap,
            'category_stats'  => $categoryStats,
            'revenue_chart'   => $revenueChart,
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
