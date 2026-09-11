<?php

/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT DELETE IMAGE API
| POST /api/admin/products/delete_image.php
| Body JSON: { "image_id": 123 }
| Xóa file vật lý và record trong DB. Nếu là ảnh chính, random 1 ảnh khác làm chính.
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ hỗ trợ POST']);
    exit;
}

[$conn] = requireAdmin();

/**
 * Tính physical path của file ảnh từ image_url lưu trong DB.
 * Hỗ trợ cả path cũ (../assets/images/products/) và path mới (assets/products/).
 */
function resolveImagePath(string $imageUrl): string {
    // Path mới: "assets/products/filename.jpg"
    if (strpos($imageUrl, 'assets/products/') === 0) {
        $filename = basename($imageUrl);
        return realpath(__DIR__ . '/../../../') . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR . $filename;
    }

    // Path cũ: "../assets/images/products/filename.jpg" (backward compatibility)
    if (strpos($imageUrl, '../assets/') !== false || strpos($imageUrl, 'assets/images/') !== false) {
        $filename = basename($imageUrl);
        // Tìm trong backend/assets/products/
        $newPath = realpath(__DIR__ . '/../../../') . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR . $filename;
        if (file_exists($newPath)) {
            return $newPath;
        }
        // Thử path cũ ở frontend/assets/images/products/
        $oldPath = realpath(__DIR__ . '/../../../../frontend/assets/images/products/') . DIRECTORY_SEPARATOR . $filename;
        return $oldPath;
    }

    return '';
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $image_id = (int) ($input['image_id'] ?? 0);

    if ($image_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID ảnh không hợp lệ']);
        exit;
    }

    // --- 1. Lấy thông tin ảnh ---
    $stmtImg = $conn->prepare("SELECT product_id, image_url, is_primary FROM product_images WHERE id = :id LIMIT 1");
    $stmtImg->execute([':id' => $image_id]);
    $image = $stmtImg->fetch();

    if (!$image) {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy ảnh']);
        exit;
    }

    $product_id = $image['product_id'];
    $is_primary = $image['is_primary'];
    $image_url  = $image['image_url'];

    // --- 2. Xóa record trong DB ---
    $conn->beginTransaction();
    $delStmt = $conn->prepare("DELETE FROM product_images WHERE id = :id");
    $delStmt->execute([':id' => $image_id]);

    // --- 3. Nếu là ảnh chính, tìm ảnh khác thay thế ---
    if ($is_primary == 1) {
        $nextImgStmt = $conn->prepare("SELECT id FROM product_images WHERE product_id = :pid ORDER BY id ASC LIMIT 1");
        $nextImgStmt->execute([':pid' => $product_id]);
        $nextImg = $nextImgStmt->fetch();

        if ($nextImg) {
            $updStmt = $conn->prepare("UPDATE product_images SET is_primary = 1 WHERE id = :nid");
            $updStmt->execute([':nid' => $nextImg['id']]);
        }
    }
    $conn->commit();

    // --- 4. Xóa file vật lý SAU KHI DB thành công ---
    if (!empty($image_url)) {
        $physicalPath = resolveImagePath($image_url);
        if ($physicalPath && file_exists($physicalPath)) {
            unlink($physicalPath);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Xóa ảnh thành công'
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
