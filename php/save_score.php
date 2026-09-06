<?php
require_once "dbcreds.php";
session_start();
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST" || empty($_SESSION["user_id"])) {
    exit(json_encode(["success" => false]));
}

check_csrf_or_exit();

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data["score"]) || !is_numeric($data["score"])) {
    exit(json_encode(["success" => false]));
}

$conn = get_db_or_exit();
try {
    $stmt = $conn->prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)");
    $score = (int) $data["score"];
    $stmt->bind_param("ii", $_SESSION["user_id"], $score);
    $stmt->execute();
} catch (mysqli_sql_exception) {
    exit(json_encode(["success" => false]));
}

echo json_encode(["success" => true]);
