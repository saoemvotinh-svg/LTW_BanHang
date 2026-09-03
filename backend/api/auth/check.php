<?php
/*
|--------------------------------------------------------------------------
| IMPORT FILE
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../../config/config.php';

require_once __DIR__ . '/../../config/database.php';

/*
|--------------------------------------------------------------------------
| CHỈ CHO PHÉP GET
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Phương thức không được hỗ trợ'
    ]);

    exit;

}

/*
|--------------------------------------------------------------------------
| SESSION
|--------------------------------------------------------------------------
*/

session_name(SESSION_NAME);

if (session_status() === PHP_SESSION_NONE) {

    session_start();

}


try {

    /*
    |--------------------------------------------------------------------------
    | KIỂM TRA SESSION PHP
    |--------------------------------------------------------------------------
    */

    $sessionLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;


    /*
    |--------------------------------------------------------------------------
    | XÁC ĐỊNH TOKEN — ƯU TIÊN: Header → Cookie → Session
    |--------------------------------------------------------------------------
    */

    // 1. Lấy từ Authorization: Bearer <token>
    $bearerToken = null;

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }

    // 2. Fallback: cookie login_token
    $cookieToken = $_COOKIE['login_token'] ?? null;

    // Token cuối cùng sẽ dùng để query DB
    $tokenToCheck = $bearerToken ?? $cookieToken;


    /*
    |--------------------------------------------------------------------------
    | NẾU KHÔNG CÓ TOKEN VÀ KHÔNG CÓ SESSION → CHƯA ĐĂNG NHẬP
    |--------------------------------------------------------------------------
    */

    if (empty($tokenToCheck) && !$sessionLoggedIn) {

        echo json_encode([
            'success'   => false,
            'logged_in' => false,
            'message'   => 'Chưa đăng nhập'
        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | KẾT NỐI DATABASE
    |--------------------------------------------------------------------------
    */

    $db = new Database();

    $conn = $db->connect();


    /*
    |--------------------------------------------------------------------------
    | XÁC THỰC QUA TOKEN (Bearer hoặc Cookie)
    |--------------------------------------------------------------------------
    */

    if (!empty($tokenToCheck)) {

        $stmt = $conn->prepare("
            SELECT
                s.user_id,
                s.expires_at,
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.address,
                u.role
            FROM sessions s
            INNER JOIN users u ON u.id = s.user_id
            WHERE s.session_token = :token
            AND s.expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([
            ':token' => $tokenToCheck
        ]);

        $row = $stmt->fetch();


        if (!$row) {

            // Token hết hạn hoặc không tồn tại
            echo json_encode([
                'success'   => false,
                'logged_in' => false,
                'message'   => 'Phiên đăng nhập đã hết hạn'
            ]);

            exit;

        }


        /*
        |--------------------------------------------------------------------------
        | CẬP NHẬT last_activity
        |--------------------------------------------------------------------------
        */

        $update = $conn->prepare("
            UPDATE sessions
            SET last_activity = NOW()
            WHERE session_token = :token
        ");

        $update->execute([
            ':token' => $cookieToken
        ]);


        /*
        |--------------------------------------------------------------------------
        | ĐỒNG BỘ SESSION PHP
        |--------------------------------------------------------------------------
        */

        $_SESSION['user_id']   = $row['id'];
        $_SESSION['full_name'] = $row['full_name'];
        $_SESSION['email']     = $row['email'];
        $_SESSION['role']      = $row['role'];
        $_SESSION['logged_in'] = true;


        echo json_encode([

            'success'   => true,

            'logged_in' => true,

            'user' => [
                'id'        => $row['id'],
                'full_name' => $row['full_name'],
                'email'     => $row['email'],
                'phone'     => $row['phone'],
                'address'   => $row['address'],
                'role'      => $row['role']
            ]

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | NẾU CHỈ CÓ SESSION PHP → LẤY THÔNG TIN USER
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            full_name,
            email,
            phone,
            address,
            role
        FROM users
        WHERE id = :id
        LIMIT 1
    ");

    $stmt->execute([
        ':id' => $_SESSION['user_id']
    ]);

    $user = $stmt->fetch();


    if (!$user) {

        // User không còn tồn tại → clear session

        session_destroy();

        echo json_encode([
            'success'   => false,
            'logged_in' => false,
            'message'   => 'Tài khoản không tồn tại'
        ]);

        exit;

    }


    echo json_encode([

        'success'   => true,

        'logged_in' => true,

        'user' => [
            'id'        => $user['id'],
            'full_name' => $user['full_name'],
            'email'     => $user['email'],
            'phone'     => $user['phone'],
            'address'   => $user['address'],
            'role'      => $user['role']
        ]

    ]);


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        'success' => false,

        'message' => 'Lỗi máy chủ',

        // Khi debug có thể dùng:
         'error' => $e->getMessage()

    ]);

}
