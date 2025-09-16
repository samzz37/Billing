<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $product_id = $_POST['product_id'];
        $gst_rate = $_POST['gst_rate'];
        
        $stmt = $pdo->prepare("UPDATE products SET gst_rate = ? WHERE id = ?");
        $stmt->execute([$gst_rate, $product_id]);
        
        echo json_encode(['success' => true, 'message' => 'GST rate updated successfully']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error updating GST rate: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>