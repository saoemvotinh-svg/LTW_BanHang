<?php

/*
|--------------------------------------------------------------------------
| ADMIN AUTH CHECK HELPER
| Include file này vào đầu mỗi admin API để kiểm tra quyền admin
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../../config/database.php';

// Bắt đầu session
session_name(SESSION_NAME);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Lấy user_id của admin đang đăng nhập.
 * Kiểm tra qua Bearer token → Cookie → Session PHP.
 * Trả về user_id nếu hợp lệ và là admin, ngược lại trả về null.
 */
function getAdminUserId(PDO $conn): ?int
{
    // 1. Lấy token từ Authorization: Bearer <token>
    $bearerToken = null;
    $authHeader  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }

    // 2. Fallback: cookie login_token
    $cookieToken  = $_COOKIE['login_token'] ?? null;
    $tokenToCheck = $bearerToken ?? $cookieToken;

    // Kiểm tra qua token trong database
    if (!empty($tokenToCheck)) {
        $stmt = $conn->prepare("
            SELECT s.user_id, u.role
            FROM sessions s
            INNER JOIN users u ON u.id = s.user_id
            WHERE s.session_token = :token
              AND s.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $tokenToCheck]);
        $row = $stmt->fetch();

        if ($row && $row['role'] === 'admin') {
            return (int) $row['user_id'];
        }
        return null;
    }

    // Fallback: session PHP
    if (
        isset($_SESSION['logged_in']) &&
        $_SESSION['logged_in'] === true &&
        isset($_SESSION['role']) &&
        $_SESSION['role'] === 'admin'
    ) {
        return (int) $_SESSION['user_id'];
    }

    return null;
}

/**
 * Kết nối DB, kiểm tra quyền admin.
 * Nếu không hợp lệ → trả JSON 401 và exit.
 * Nếu hợp lệ → trả về [$conn, $adminUserId]
 */
function requireAdmin(): array
{
    try {
        $db   = new Database();
        $conn = $db->connect();

        $adminUserId = getAdminUserId($conn);

        if ($adminUserId === null) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Bạn cần đăng nhập với tài khoản admin'
            ]);
            exit;
        }

        return [$conn, $adminUserId];

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi máy chủ',
            'error'   => $e->getMessage()
        ]);
        exit;
    }
}
