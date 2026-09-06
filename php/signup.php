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
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $conn->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hash);
    $stmt->execute();
} catch (mysqli_sql_exception) {
    exit(json_encode(["success" => false]));
}

session_regenerate_id(true);
$token = bin2hex(random_bytes(32));
$_SESSION["user_id"] = $stmt->insert_id;
$_SESSION["username"] = $username;
$_SESSION["csrf_token"] = $token;
set_csrf_cookie($token);

echo json_encode(["success" => true]);
