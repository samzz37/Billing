<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

header('Content-Type: text/html');

try {
    $stmt = $pdo->query("SELECT sh.*, p.name as product_name 
                        FROM stock_history sh 
                        LEFT JOIN products p ON sh.product_id = p.id 
                        ORDER BY sh.created_at DESC 
                        LIMIT 100");
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($history)) {
        echo "<tr><td colspan='6' class='text-center'>No stock history found</td></tr>";
    } else {
        foreach ($history as $record) {
            echo "<tr>
                    <td>" . date('Y-m-d H:i', strtotime($record['created_at'])) . "</td>
                    <td>" . htmlspecialchars($record['product_name'] ?? 'N/A') . "</td>
                    <td><span class='badge " . ($record['change_type'] == 'IN' ? 'bg-success' : 'bg-danger') . "'>" . $record['change_type'] . "</span></td>
                    <td>" . $record['quantity'] . "</td>
                    <td>" . $record['stock_after'] . "</td>
                    <td>" . htmlspecialchars($record['reference']) . "</td>
                  </tr>";
        }
    }
} catch (Exception $e) {
    echo "<tr><td colspan='6' class='text-center text-danger'>Error loading history: " . htmlspecialchars($e->getMessage()) . "</td></tr>";
}
?>