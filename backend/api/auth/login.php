<?php

/*
|--------------------------------------------------------------------------
| IMPORT FILE
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';


/*
|--------------------------------------------------------------------------
| CHỈ CHO PHÉP POST
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

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


/*
|--------------------------------------------------------------------------
| NHẬN JSON TỪ JAVASCRIPT
|--------------------------------------------------------------------------
*/

$input = json_decode(
    file_get_contents('php://input'),
    true
);


$username = trim($input['username'] ?? '');

$password = $input['password'] ?? '';


/*
|--------------------------------------------------------------------------
| KIỂM TRA DỮ LIỆU
|--------------------------------------------------------------------------
*/

if (empty($username) || empty($password)) {

    echo json_encode([
        'success' => false,
        'message' => 'Vui lòng nhập đầy đủ thông tin'
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | KẾT NỐI DATABASE
    |--------------------------------------------------------------------------
    */

    $db = new Database();

    $conn = $db->connect();


    /*
    |--------------------------------------------------------------------------
    | TÌM USER
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT *
        FROM users
        WHERE email = :email
        OR phone = :phone
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $username,
        ':phone' => $username
    ]);

    $user = $stmt->fetch();


    /*
    |--------------------------------------------------------------------------
    | KIỂM TRA TÀI KHOẢN
    |--------------------------------------------------------------------------
    */

    if (!$user) {

        echo json_encode([
            'success' => false,
            'message' => 'Tài khoản không tồn tại'
        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | KIỂM TRA MẬT KHẨU
    |--------------------------------------------------------------------------
    */

    if (!password_verify($password, $user['password'])) {

        echo json_encode([
            'success' => false,
            'message' => 'Mật khẩu không đúng'
        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | CHỐNG SESSION FIXATION
    |--------------------------------------------------------------------------
    */

    session_regenerate_id(true);


    /*
    |--------------------------------------------------------------------------
    | LƯU SESSION PHP
    |--------------------------------------------------------------------------
    */

    $_SESSION['user_id'] = $user['id'];

    $_SESSION['full_name'] = $user['full_name'];

    $_SESSION['email'] = $user['email'];

    $_SESSION['role'] = $user['role'];

    $_SESSION['logged_in'] = true;


    /*
    |--------------------------------------------------------------------------
    | TẠO TOKEN COOKIE
    |--------------------------------------------------------------------------
    */

    $sessionToken = bin2hex(random_bytes(32));


    /*
    |--------------------------------------------------------------------------
    | HẾT HẠN SAU 7 NGÀY
    |--------------------------------------------------------------------------
    */

    $expiresAt = date(
        'Y-m-d H:i:s',
        time() + (60 * 60 * 24 * 7)
    );


    /*
    |--------------------------------------------------------------------------
    | XÓA SESSION CŨ
    |--------------------------------------------------------------------------
    */

    $delete = $conn->prepare("
        DELETE FROM sessions
        WHERE user_id = :user_id
    ");

    $delete->execute([

        ':user_id' => $user['id']

    ]);


    /*
    |--------------------------------------------------------------------------
    | LƯU SESSION VÀO DATABASE
    |--------------------------------------------------------------------------
    */

    $insert = $conn->prepare("
        INSERT INTO sessions (
            user_id,
            session_token,
            expires_at,
            created_at,
            last_activity
        )

        VALUES (
            :user_id,
            :session_token,
            :expires_at,
            NOW(),
            NOW()
        )
    ");


    $insert->execute([

        ':user_id' => $user['id'],

        ':session_token' => $sessionToken,

        ':expires_at' => $expiresAt

    ]);


    /*
    |--------------------------------------------------------------------------
    | LƯU TOKEN VÀO COOKIE
    |--------------------------------------------------------------------------
    */

    setcookie(

        'login_token',

        $sessionToken,

        [

            'expires' => time() + (60 * 60 * 24 * 7),

            'path' => '/',

            'httponly' => true,

            'secure' => false,

            'samesite' => 'Lax'

        ]

    );


    /*
    |--------------------------------------------------------------------------
    | TRẢ KẾT QUẢ CHO JAVASCRIPT
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        'success' => true,

        'message' => 'Đăng nhập thành công',

        'token' => $sessionToken,

        'user' => [

            'id' => $user['id'],

            'full_name' => $user['full_name'],

            'email' => $user['email'],

            'role' => $user['role']

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