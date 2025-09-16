<?php
$host = 'localhost';
$dbname = 'shop_billing';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Initialize default settings if not exists
$defaultSettings = [
    ['default_gst_rate', '18'],
    ['default_discount_type', 'fixed'],
    ['default_tax_type', 'percent'],
    ['shop_name', 'Shop Billing System'],
    ['shop_address', '123 Shop Street, City - 600001'],
    ['shop_contact', '+91 9876543210'],
    ['shop_email', 'shop@example.com'],
    ['shop_gstin', 'GSTIN123456789']
];

foreach ($defaultSettings as $setting) {
    $check = $pdo->prepare("SELECT COUNT(*) FROM settings WHERE setting_key = ?");
    $check->execute([$setting[0]]);
    if ($check->fetchColumn() == 0) {
        $insert = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)");
        $insert->execute([$setting[0], $setting[1]]);
    }
}
?>