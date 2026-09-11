<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCTS UPDATE API
| POST /api/admin/products/update.php
| Cập nhật thông tin sản phẩm. Hỗ trợ multipart/form-data để đổi ảnh.
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

    $id          = (int) ($_POST['id']          ?? 0);
    $name        = trim($_POST['name']        ?? '');
    $category_id = (int) ($_POST['category_id'] ?? 0);
    $price       = (float) ($_POST['price']   ?? 0);
    $stock       = (int) ($_POST['stock']     ?? 0);
    $description = trim($_POST['description'] ?? '');

    // --- Validate ---
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID sản phẩm không hợp lệ']);
        exit;
    }

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

    // --- Kiểm tra sản phẩm tồn tại ---
    $checkStmt = $conn->prepare("SELECT id FROM products WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        exit;
    }

    // --- Kiểm tra category tồn tại ---
    $catStmt = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
    $catStmt->execute([$category_id]);
    if (!$catStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Danh mục không tồn tại']);
        exit;
    }

    // --- Xử lý upload ảnh mới (nhiều ảnh) ---
    $uploadedImages = [];

    // Upload vào backend/assets/products/ (dùng __DIR__ để luôn đúng khi deploy)
    $uploadDir = realpath(__DIR__ . '/../../../') . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (isset($_FILES['new_images']) && is_array($_FILES['new_images']['name'])) {
        $fileCount = count($_FILES['new_images']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['new_images']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpPath = $_FILES['new_images']['tmp_name'][$i];
                $maxSize = 2 * 1024 * 1024;

                if ($_FILES['new_images']['size'][$i] > $maxSize) {
                    continue;
                }

                $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                $mime = mime_content_type($tmpPath);

                if (!in_array($mime, $allowedMimes)) {
                    continue;
                }

                $ext = match($mime) {
                    'image/jpeg' => 'jpg',
                    'image/png'  => 'png',
                    'image/webp' => 'webp',
                    'image/gif'  => 'gif',
                    default      => 'jpg',
                };

                // Tạo filename an toàn và duy nhất
                $newName  = 'product_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $destPath = $uploadDir . $newName;

                if (move_uploaded_file($tmpPath, $destPath)) {
                    // Lưu relative path vào DB — không chứa localhost hay domain
                    $uploadedImages[] = 'assets/products/' . $newName;
                }
            }
        }
    }

    // --- Transaction: cập nhật sản phẩm + ảnh ---
    $conn->beginTransaction();

    // Cập nhật sản phẩm
    $updateProduct = $conn->prepare("
        UPDATE products
        SET category_id = :category_id,
            name        = :name,
            price       = :price,
            stock       = :stock,
            description = :description
        WHERE id = :id
    ");
    $updateProduct->execute([
        ':category_id' => $category_id,
        ':name'        => $name,
        ':price'       => $price,
        ':stock'       => $stock,
        ':description' => $description,
        ':id'          => $id,
    ]);

    // Thêm các ảnh mới (nếu có)
    if (!empty($uploadedImages)) {
        // Kiểm tra xem đã có ảnh chính chưa
        $checkPrimary = $conn->prepare("SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1");
        $checkPrimary->execute([$id]);
        $hasPrimary = $checkPrimary->fetch() !== false;

        $insImg = $conn->prepare("
            INSERT INTO product_images (product_id, image_url, is_primary)
            VALUES (?, ?, ?)
        ");

        foreach ($uploadedImages as $index => $imgUrl) {
            $is_primary = 0;
            if (!$hasPrimary && $index === 0) {
                $is_primary = 1;
                $hasPrimary = true;
            }
            $insImg->execute([$id, $imgUrl, $is_primary]);
        }
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật sản phẩm thành công',
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
