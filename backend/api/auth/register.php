<?php

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");

header("Access-Control-Allow-Credentials: true");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json; charset=UTF-8");


/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;

}


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
| NHẬN JSON
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


/*
|--------------------------------------------------------------------------
| KIỂM TRA ĐỘ DÀI PASSWORD
|--------------------------------------------------------------------------
*/

if (strlen($password) < 6) {

    echo json_encode([

        'success' => false,

        'message' => 'Mật khẩu phải có ít nhất 6 ký tự'

    ]);

    exit;

}


try {

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    $db = new Database();

    $conn = $db->connect();


    /*
    |--------------------------------------------------------------------------
    | KIỂM TRA USER ĐÃ TỒN TẠI
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("

        SELECT id

        FROM users

        WHERE email = :email

        LIMIT 1

    ");


    $stmt->execute([

        ':email' => $username

    ]);


    $user = $stmt->fetch();


    if ($user) {

        echo json_encode([

            'success' => false,

            'message' => 'Tài khoản đã tồn tại'

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    $hashedPassword = password_hash(

        $password,

        PASSWORD_DEFAULT

    );


    /*
    |--------------------------------------------------------------------------
    | TẠO USER
    |--------------------------------------------------------------------------
    */

    $insert = $conn->prepare("

        INSERT INTO users (

            email,

            password,

            role,

            created_at

        )

        VALUES (

            :email,

            :password,

            'customer',

            NOW()

        )

    ");


    $insert->execute([

        ':email' => $username,

        ':password' => $hashedPassword

    ]);


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        'success' => true,

        'message' => 'Đăng ký thành công'

    ]);


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        'success' => false,

        'message' => 'Lỗi máy chủ',

        'error' => $e->getMessage()

    ]);

}