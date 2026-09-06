<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

define("DBHOST", "127.0.0.1");
define("DBUSER", "root");
define("DBPASS", "");
define("DBNAME", "frittoli_720014");

function get_db_or_exit(): mysqli {
    try {
        return new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
    } catch (mysqli_sql_exception) {
        exit(json_encode(["success" => false]));
    }
}

function check_csrf_or_exit(): void {
    $header = $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";
    $session = $_SESSION["csrf_token"] ?? "";
    if (empty($session) || !hash_equals($session, $header)) {
        exit(json_encode(["success" => false]));
    }
}

function set_csrf_cookie(string $token): void {
    $isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off");
    setcookie("csrf_token", $token, [
        "expires"  => 0,
        "path"     => "/",
        "secure"   => $isHttps,
        "httponly" => false,
        "samesite" => "Lax"
    ]);
}
