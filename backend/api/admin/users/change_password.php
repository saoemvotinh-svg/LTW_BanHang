<?php
// backend/api/admin/users/change_password.php


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
    // Kiểm tra user có tồn tại không và lấy role
    $stmt = $conn->prepare("SELECT id, role FROM users WHERE id = :id LIMIT 1");
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

    // Kiểm tra quyền: Admin không được đổi pass của admin khác (chỉ đổi của chính mình hoặc khách hàng)
    if ($user['role'] === 'admin' && (int)$user['id'] !== (int)$adminUserId) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Bạn không có quyền đổi mật khẩu của Admin khác'
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
