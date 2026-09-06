<?php
require_once "dbcreds.php";
session_start();
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit(json_encode(["success" => false]));
}

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {
    exit(json_encode(["success" => false]));
}

$conn = get_db_or_exit();
$stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user["password_hash"])) {
    exit(json_encode(["success" => false]));
}

session_regenerate_id(true);
$token = bin2hex(random_bytes(32));
$_SESSION["user_id"] = $user["id"];
$_SESSION["username"] = $username;
$_SESSION["csrf_token"] = $token;
set_csrf_cookie($token);

echo json_encode(["success" => true]);
