<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';

try {

    $db = new Database();
    $conn = $db->connect();

    echo "<h1>Kết nối MySQL thành công!</h1>";

    // Lấy danh sách bảng
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    echo "<h2>Danh sách bảng:</h2>";

    if (count($tables) > 0) {

        echo "<ul>";

        foreach ($tables as $table) {
            echo "<li>" . htmlspecialchars($table) . "</li>";
        }

        echo "</ul>";

    } else {
        echo "<p>Database chưa có bảng.</p>";
    }


    // Test bảng products
    echo "<h2>Dữ liệu sản phẩm:</h2>";

    $products = $conn->query("
        SELECT id, name, price, stock
        FROM products
        LIMIT 5
    ")->fetchAll();

    if (count($products) > 0) {

        echo "<table border='1' cellpadding='10'>";

        echo "
            <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Tồn kho</th>
            </tr>
        ";

        foreach ($products as $product) {

            echo "<tr>";

            echo "<td>" . htmlspecialchars($product['id']) . "</td>";
            echo "<td>" . htmlspecialchars($product['name']) . "</td>";
            echo "<td>" . htmlspecialchars($product['price']) . "</td>";
            echo "<td>" . htmlspecialchars($product['stock']) . "</td>";

            echo "</tr>";
        }

        echo "</table>";

    } else {

        echo "<p>Bảng products tồn tại nhưng chưa có dữ liệu.</p>";
    }


} catch (Exception $e) {

    echo "<h1>Kết nối thất bại!</h1>";

    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}