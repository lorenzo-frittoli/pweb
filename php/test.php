<?php
// test.php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "pweb_test";

// Attempt to connect to the database
$conn = new mysqli($host, $user, $pass, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("<h2 style='color: red;'>Connection Failed!</h2><p>" . $conn->connect_error . "</p>");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PWEB Environment Test</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
        .success { color: green; border: 2px solid green; display: inline-block; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="success">
        <h2>🎉 Environment Test Successful!</h2>
        <p>PHP is running properly.</p>
        <p>Successfully connected to the MariaDB database: <strong><?php echo $dbname; ?></strong></p>
        <p>PHP Version: <strong><?php echo phpversion(); ?></strong></p>
    </div>
</body>
</html>
