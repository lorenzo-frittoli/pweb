<?php
require_once "dbcreds.php";
header("Content-Type: application/json");

$conn = get_db_or_exit();
$sql = "
    SELECT 
        u.username,
        MAX(s.score) AS high_score
    FROM users u
    JOIN scores s ON u.id = s.user_id
    GROUP BY u.id, u.username
    ORDER BY high_score DESC
    LIMIT 10
";

$result = $conn->query($sql);
if (!$result) {
    exit(json_encode(["success" => false]));
}

echo json_encode([
    "success"     => true,
    "leaderboard" => $result->fetch_all(MYSQLI_ASSOC)
]);
