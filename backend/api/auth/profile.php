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
| SESSION
|--------------------------------------------------------------------------
*/

session_name(SESSION_NAME);

if (session_status() === PHP_SESSION_NONE) {

    session_start();

}


/*
|--------------------------------------------------------------------------
| XÁC THỰC — KIỂM TRA ĐĂNG NHẬP QUA SESSION HOẶC COOKIE
|--------------------------------------------------------------------------
*/

$userId = null;

try {

    $db   = new Database();
    $conn = $db->connect();

    /*
    |--------------------------------------------------------------------------
    | XÁC ĐỊNH TOKEN — Header → Cookie → Session
    |--------------------------------------------------------------------------
    */

    // 1. Bearer token từ Authorization header
    $bearerToken = null;

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $bearerToken = $matches[1];
    }

    // 2. Fallback: cookie login_token
    $cookieToken = $_COOKIE['login_token'] ?? null;

    $tokenToCheck = $bearerToken ?? $cookieToken;


    /*
    |--------------------------------------------------------------------------
    | XÁC THỰC TOKEN QUA DATABASE
    |--------------------------------------------------------------------------
    */

    if (!empty($tokenToCheck)) {

        $stmt = $conn->prepare("
            SELECT s.user_id, s.expires_at
            FROM sessions s
            WHERE s.session_token = :token
            AND s.expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([':token' => $tokenToCheck]);

        $session = $stmt->fetch();

        if ($session) {
            $userId = $session['user_id'];
        }

    }

    // Fallback: dùng session PHP
    if ($userId === null && isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        $userId = $_SESSION['user_id'] ?? null;
    }

    // Chưa đăng nhập
    if ($userId === null) {

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Vui lòng đăng nhập'
        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | GET — LẤY THÔNG TIN PROFILE
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $stmt = $conn->prepare("
            SELECT
                id,
                full_name,
                email,
                phone,
                address,
                role,
                created_at
            FROM users
            WHERE id = :id
            LIMIT 1
        ");

        $stmt->execute([':id' => $userId]);

        $user = $stmt->fetch();

        if (!$user) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản'
            ]);

            exit;

        }

        echo json_encode([

            'success' => true,

            'user' => [
                'id'         => $user['id'],
                'full_name'  => $user['full_name'],
                'email'      => $user['email'],
                'phone'      => $user['phone'],
                'address'    => $user['address'],
                'role'       => $user['role'],
                'created_at' => $user['created_at']
            ]

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | POST — CẬP NHẬT THÔNG TIN PROFILE
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        $fullName = trim($input['full_name'] ?? '');
        $phone    = trim($input['phone']     ?? '');
        $address  = trim($input['address']   ?? '');


        /*
        |--------------------------------------------------------------------------
        | KIỂM TRA DỮ LIỆU
        |--------------------------------------------------------------------------
        */

        if (empty($fullName)) {

            echo json_encode([
                'success' => false,
                'message' => 'Vui lòng nhập họ và tên'
            ]);

            exit;

        }


        /*
        |--------------------------------------------------------------------------
        | CẬP NHẬT DATABASE
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE users
            SET
                full_name = :full_name,
                phone     = :phone,
                address   = :address
            WHERE id = :id
        ");

        $stmt->execute([
            ':full_name' => $fullName,
            ':phone'     => $phone,
            ':address'   => $address,
            ':id'        => $userId
        ]);


        /*
        |--------------------------------------------------------------------------
        | CẬP NHẬT SESSION PHP
        |--------------------------------------------------------------------------
        */

        $_SESSION['full_name'] = $fullName;


        echo json_encode([

            'success' => true,

            'message' => 'Cập nhật thông tin thành công',

            'user' => [
                'id'        => $userId,
                'full_name' => $fullName,
                'phone'     => $phone,
                'address'   => $address
            ]

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | METHOD KHÔNG HỢP LỆ
    |--------------------------------------------------------------------------
    */

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Phương thức không được hỗ trợ'
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
