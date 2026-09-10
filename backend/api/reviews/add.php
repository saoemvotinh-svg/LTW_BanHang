<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }

    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng đăng nhập để đánh giá']);
        exit;
    }
    $stmtAuth = $conn->prepare("SELECT user_id FROM sessions WHERE session_token = :token AND expires_at > NOW() LIMIT 1");
    $stmtAuth->execute([':token' => $token]);
    $session = $stmtAuth->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        echo json_encode(['success' => false, 'message' => 'Phiên đăng nhập đã hết hạn']);
        exit;
    }

    $user_id = $session['user_id'];
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = (int)($input['product_id'] ?? 0);
    $comment = trim($input['comment'] ?? '');
    $rating = 5; 

    if ($product_id <= 0 || empty($comment)) {
        echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES (:pid, :uid, :rating, :comment, NOW())");
    $stmt->execute([
        ':pid' => $product_id,
        ':uid' => $user_id,
        ':rating' => $rating,
        ':comment' => $comment
    ]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Cảm ơn bạn đã đánh giá!'], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>