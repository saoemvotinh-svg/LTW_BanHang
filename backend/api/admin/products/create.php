<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCTS CREATE API
| POST /api/admin/products/create.php
| Tạo sản phẩm mới. Hỗ trợ multipart/form-data để upload ảnh.
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ POST']);
    exit;
}

[$conn] = requireAdmin();

try {

    // --- Nhận dữ liệu từ form-data (vì có upload ảnh) ---
    $name        = trim($_POST['name']        ?? '');
    $category_id = (int) ($_POST['category_id'] ?? 0);
    $price       = (float) ($_POST['price']   ?? 0);
    $stock       = (int) ($_POST['stock']     ?? 0);
    $description = trim($_POST['description'] ?? '');


    // --- Validate ---
    if (empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập tên sản phẩm']);
        exit;
    }

    if ($category_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng chọn danh mục']);
        exit;
    }

    if ($price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Giá phải lớn hơn 0']);
        exit;
    }

    if ($stock < 0) {
        echo json_encode(['success' => false, 'message' => 'Số lượng tồn kho không hợp lệ']);
        exit;
    }

    // --- Kiểm tra category tồn tại ---
    $catStmt = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
    $catStmt->execute([$category_id]);
    if (!$catStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Danh mục không tồn tại']);
        exit;
    }


    // --- Xử lý upload ảnh (nhiều ảnh) ---
    $uploadedImages = [];

    // Upload vào backend/assets/products/ (dùng __DIR__ để luôn đúng khi deploy)
    $uploadDir = realpath(__DIR__ . '/../../../') . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $fileCount = count($_FILES['images']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpPath = $_FILES['images']['tmp_name'][$i];
                $maxSize = 2 * 1024 * 1024; // 2MB

                if ($_FILES['images']['size'][$i] > $maxSize) {
                    continue; // Skip large files
                }

                $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                $mime = mime_content_type($tmpPath);

                if (!in_array($mime, $allowedMimes)) {
                    continue; // Skip invalid formats
                }

                $ext = match($mime) {
                    'image/jpeg' => 'jpg',
                    'image/png'  => 'png',
                    'image/webp' => 'webp',
                    'image/gif'  => 'gif',
                    default      => 'jpg',
                };

                // Tạo filename an toàn và duy nhất (không dùng original filename)
                $newName  = 'product_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $destPath = $uploadDir . $newName;

                if (move_uploaded_file($tmpPath, $destPath)) {
                    // Lưu relative path vào DB — không chứa localhost hay domain
                    $uploadedImages[] = 'assets/products/' . $newName;
                }
            }
        }
    }

    // --- Transaction: tạo sản phẩm + ảnh ---
    $conn->beginTransaction();

    // Tạo sản phẩm
    $insertProduct = $conn->prepare("
        INSERT INTO products (category_id, name, price, stock, description, created_at)
        VALUES (:category_id, :name, :price, :stock, :description, NOW())
    ");
    $insertProduct->execute([
        ':category_id' => $category_id,
        ':name'        => $name,
        ':price'       => $price,
        ':stock'       => $stock,
        ':description' => $description,
    ]);

    $productId = (int) $conn->lastInsertId();

    // Lưu mảng ảnh vào database
    if (!empty($uploadedImages)) {
        $insertImage = $conn->prepare("
            INSERT INTO product_images (product_id, image_url, is_primary)
            VALUES (:product_id, :image_url, :is_primary)
        ");
        foreach ($uploadedImages as $index => $imgUrl) {
            $is_primary = ($index === 0) ? 1 : 0; // Ảnh đầu tiên là ảnh chính
            $insertImage->execute([
                ':product_id' => $productId,
                ':image_url'  => $imgUrl,
                ':is_primary' => $is_primary
            ]);
        }
    }

    $conn->commit();

    echo json_encode([
        'success'    => true,
        'message'    => 'Thêm sản phẩm thành công',
        'product_id' => $productId,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
