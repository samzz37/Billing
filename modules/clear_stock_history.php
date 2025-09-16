<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');

try {
    $clear_date = $_POST['clearDate'] ?? null;
    $archive_data = isset($_POST['archiveData']) && $_POST['archiveData'] == 'true';
    
    if (!$clear_date) {
        throw new Exception("Please select a date");
    }
    
    if ($archive_data) {
        // Archive the data first
        $stmt = $pdo->prepare("INSERT INTO stock_history_archive 
                              (product_id, change_type, quantity, stock_after, reference, created_at)
                              SELECT product_id, change_type, quantity, stock_after, reference, created_at
                              FROM stock_history 
                              WHERE created_at < ?");
        $stmt->execute([$clear_date]);
    }
    
    // Delete the records
    $stmt = $pdo->prepare("DELETE FROM stock_history WHERE created_at < ?");
    $stmt->execute([$clear_date]);
    $deleted_count = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'message' => "Cleared $deleted_count records from stock history"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>