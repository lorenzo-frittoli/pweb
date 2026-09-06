<?php
require_once "dbcreds.php";
session_start();
header("Content-Type: application/json");

if (empty($_SESSION["user_id"])) {
    exit(json_encode(["success" => false, "logged_in" => false]));
}

$conn = get_db_or_exit();
$stmt = $conn->prepare("
    SELECT 
        COALESCE(MAX(score), 0) AS high_score,
        COUNT(id) AS games_played,
        COALESCE(ROUND(AVG(score), 1), 0) AS avg_score
    FROM scores 
    WHERE user_id = ?
");
$stmt->bind_param("i", $_SESSION["user_id"]);
$stmt->execute();
$stats = $stmt->get_result()->fetch_assoc();

echo json_encode([
    "success"   => true,
    "logged_in" => true,
    "username"  => $_SESSION["username"] ?? "",
    "stats"     => $stats
]);
