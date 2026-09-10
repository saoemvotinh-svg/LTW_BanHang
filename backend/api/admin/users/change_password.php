<?php
// backend/api/admin/users/change_password.php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../auth_check.php';

// Kiểm tra quyền admin
[$conn, $adminUserId] = requireAdmin();

// Đọc JSON body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$userId      = $data['user_id'] ?? null;
$newPassword = $data['new_password'] ?? '';

if (!$userId || empty($newPassword)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Vui lòng cung cấp ID người dùng và mật khẩu mới'
    ]);
    exit;
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Mật khẩu phải có ít nhất 6 ký tự'
    ]);
    exit;
}

try {
    // Kiểm tra user có tồn tại không
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy người dùng'
        ]);
        exit;
    }

    // Cập nhật mật khẩu
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $updateStmt = $conn->prepare("UPDATE users SET password = :password WHERE id = :id");
    $updateStmt->execute([
        ':password' => $hashedPassword,
        ':id'       => $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Đổi mật khẩu thành công'
    ]);

} catch (Exception $e) {
    error_log("Change password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi máy chủ',
        'error'   => $e->getMessage()
    ]);
}
