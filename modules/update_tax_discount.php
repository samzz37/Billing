<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $bill_id = $_POST['bill_id'];
        $discount = $_POST['discount'];
        $discount_type = $_POST['discount_type'];
        $tax = $_POST['tax'];
        $tax_type = $_POST['tax_type'];
        
        // Get bill items total
        $stmt = $pdo->prepare("SELECT SUM(amount) as total FROM bill_items WHERE bill_id = ?");
        $stmt->execute([$bill_id]);
        $total_amount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Calculate discount
        $discount_amount = ($discount_type == 'percent') ? ($total_amount * $discount / 100) : $discount;
        
        // Calculate tax
        $tax_amount = ($tax_type == 'percent') ? (($total_amount - $discount_amount) * $tax / 100) : $tax;
        
        // Calculate grand total
        $grand_total = $total_amount - $discount_amount + $tax_amount;
        
        // Update bill
        $stmt = $pdo->prepare("UPDATE bills SET discount = ?, discount_type = ?, tax = ?, tax_type = ?, grand_total = ? WHERE id = ?");
        $stmt->execute([$discount, $discount_type, $tax, $tax_type, $grand_total, $bill_id]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Tax and discount updated successfully',
            'discount_amount' => $discount_amount,
            'tax_amount' => $tax_amount,
            'grand_total' => $grand_total
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error updating tax and discount: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>