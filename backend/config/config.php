<?php

// =====================================================
// APPLICATION
// =====================================================

define('APP_NAME', 'Web Bán Hàng');


// =====================================================
// MYSQL SERVER - XAMPP
// =====================================================

define('MYSQL_HOST', 'localhost');

define('MYSQL_PORT', '3306');

define('MYSQL_DATABASE', 'ecommerce');

define('MYSQL_USERNAME', 'root');

define('MYSQL_PASSWORD', '');


// =====================================================
// SESSION
// =====================================================

define('SESSION_NAME', 'ECOMMERCE_SESSION');


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");

header("Access-Control-Allow-Credentials: true");

header("Access-Control-Allow-Methods: GET, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type, Authorization");

header("Content-Type: application/json; charset=UTF-8");


/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(204);

    exit;

}
