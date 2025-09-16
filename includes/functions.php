<?php
function generateBillNumber() {
    return 'BILL-' . date('Ymd') . '-' . rand(1000, 9999);
}

function getProductStock($product_id) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
    $stmt->execute([$product_id]);
    return $stmt->fetchColumn();
}

function updateProductStock($product_id, $quantity) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
    return $stmt->execute([$quantity, $product_id]);
}

function logStockChange($product_id, $change_type, $quantity, $reference) {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO stock_log (product_id, change_type, quantity, reference) VALUES (?, ?, ?, ?)");
    return $stmt->execute([$product_id, $change_type, $quantity, $reference]);
}

function getGreeting() {
    $hour = date('H');
    if ($hour < 12) {
        return "Good Morning! Thank you for your purchase.";
    } elseif ($hour < 17) {
        return "Good Afternoon! We appreciate your business.";
    } else {
        return "Good Evening! Thanks for shopping with us.";
    }
}

function getSetting($key) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['setting_value'] : null;
}

function updateSetting($key, $value) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
    return $stmt->execute([$value, $key]);
}

function calculateGST($amount, $gst_rate) {
    return ($amount * $gst_rate) / 100;
}

function formatCurrency($amount) {
    return '₹' . number_format($amount, 2);
}
?>

<?php
// functions.php - Add this function

/**
 * Archive stock history records older than specified days
 * @param int $days_old Records older than this many days will be archived
 * @return bool True on success, false on failure
 */
function archiveStockHistory($days_old = 30) {
    global $pdo;
    
    try {
        $archive_date = date('Y-m-d', strtotime("-$days_old days"));
        
        // Check if archive table exists, create if not
        $table_exists = $pdo->query("SHOW TABLES LIKE 'stock_history_archive'")->rowCount() > 0;
        
        if (!$table_exists) {
            $pdo->exec("CREATE TABLE stock_history_archive (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT,
                change_type ENUM('IN', 'OUT'),
                quantity INT,
                stock_after INT,
                reference VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
        }
        
        // Copy records to archive table
        $stmt = $pdo->prepare("INSERT INTO stock_history_archive 
                              (product_id, change_type, quantity, stock_after, reference, created_at)
                              SELECT product_id, change_type, quantity, stock_after, reference, created_at
                              FROM stock_history 
                              WHERE created_at < ?");
        $stmt->execute([$archive_date]);
        
        // Delete archived records from main table
        $stmt = $pdo->prepare("DELETE FROM stock_history WHERE created_at < ?");
        $stmt->execute([$archive_date]);
        
        return true;
    } catch (Exception $e) {
        error_log("Archive stock history error: " . $e->getMessage());
        return false;
    }
}
?>
<?php
// Generate and send bill to customer
function generateAndSendBill($bill_id) {
    global $pdo;
    
    // Get bill details
    $stmt = $pdo->prepare("SELECT b.*, bi.product_id, bi.quantity, bi.rate, bi.gst_rate, bi.amount, p.name as product_name 
                          FROM bills b 
                          JOIN bill_items bi ON b.id = bi.bill_id 
                          JOIN products p ON bi.product_id = p.id 
                          WHERE b.id = ?");
    $stmt->execute([$bill_id]);
    $bill_details = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($bill_details)) return false;
    
    $bill = $bill_details[0];
    $customer_phone = $bill['customer_phone'];
    $customer_email = $bill['customer_email'];
    
    // Generate bill image (you'll need to implement this)
    $bill_image = generateBillImage($bill_details);
    
    // Send via WhatsApp if phone number exists
    if (!empty($customer_phone)) {
        sendWhatsAppBill($customer_phone, $bill_image, $bill['bill_number']);
    }
    
    // Send via email if email exists
    if (!empty($customer_email)) {
        sendEmailBill($customer_email, $bill_image, $bill['bill_number']);
    }
    
    return true;
}

// Generate bill as image (basic implementation)
function generateBillImage($bill_details) {
    $bill = $bill_details[0];
    
    // Create a simple HTML bill for now
    $html = "<html><body>
        <h2>TAX INVOICE</h2>
        <p>Bill No: " . $bill['bill_number'] . "</p>
        <p>Date: " . $bill['created_at'] . "</p>
        <p>Customer: " . $bill['customer_name'] . "</p>
        <p>GSTIN: " . ($bill['customer_gstin'] ?? 'N/A') . "</p>
        <hr>
        <h3>Items:</h3>
        <table>
            <tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>";
    
    foreach ($bill_details as $item) {
        $html .= "<tr>
                    <td>" . $item['product_name'] . "</td>
                    <td>" . $item['quantity'] . "</td>
                    <td>" . $item['rate'] . "</td>
                    <td>" . $item['amount'] . "</td>
                  </tr>";
    }
    
    $html .= "</table>
        <hr>
        <p>Total: ₹" . $bill['total_amount'] . "</p>
        <p>Discount: ₹" . $bill['discount'] . "</p>
        <p>Tax: ₹" . $bill['tax'] . "</p>
        <h3>Grand Total: ₹" . $bill['grand_total'] . "</h3>
        </body></html>";
    
    // Save HTML to file (in a real implementation, you would convert to PDF/Image)
    $file_path = "../bills/" . $bill['bill_number'] . ".html";
    file_put_contents($file_path, $html);
    
    return $file_path;
}

// Placeholder for WhatsApp sending function
function sendWhatsAppBill($phone, $bill_path, $bill_number) {
    // Implementation depends on your WhatsApp API provider
    error_log("WhatsApp bill sent to $phone for bill #$bill_number");
    return true;
}

// Placeholder for email sending function
function sendEmailBill($email, $bill_path, $bill_number) {
    $subject = "Your Bill #$bill_number";
    $message = "Thank you for your purchase! Please find your bill attached.";
    $headers = "From: shop@example.com";
    
    // In a real implementation, you would attach the bill file
    mail($email, $subject, $message, $headers);
    error_log("Email bill sent to $email for bill #$bill_number");
    
    return true;
}
?>