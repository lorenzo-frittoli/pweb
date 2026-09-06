<?php
require_once "dbcreds.php";
session_start();
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit(json_encode(["success" => false]));
}

check_csrf_or_exit();

$_SESSION = [];
setcookie(session_name(), "", 1, "/");
setcookie("csrf_token", "", 1, "/");
session_destroy();

echo json_encode(["success" => true]);
