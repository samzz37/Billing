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
    
    // Generate bill image
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

// Generate bill as image
function generateBillImage($bill_details) {
    $bill = $bill_details[0];
    
    // Create image using GD library
    $width = 600;
    $height = 800;
    $image = imagecreate($width, $height);
    
    // Set colors
    $white = imagecolorallocate($image, 255, 255, 255);
    $black = imagecolorallocate($image, 0, 0, 0);
    $gray = imagecolorallocate($image, 100, 100, 100);
    
    // Fill background
    imagefill($image, 0, 0, $white);
    
    // Add header
    imagestring($image, 5, 20, 20, "TAX INVOICE", $black);
    imagestring($image, 3, 20, 50, "Bill No: " . $bill['bill_number'], $black);
    imagestring($image, 3, 20, 70, "Date: " . $bill['created_at'], $black);
    
    // Add customer details
    imagestring($image, 4, 20, 110, "Customer: " . $bill['customer_name'], $black);
    if (!empty($bill['customer_gstin'])) {
        imagestring($image, 3, 20, 130, "GSTIN: " . $bill['customer_gstin'], $black);
    }
    
    // Add line items
    $y = 180;
    imagestring($image, 4, 20, $y, "Items:", $black);
    $y += 30;
    
    foreach ($bill_details as $item) {
        $item_text = $item['product_name'] . " x " . $item['quantity'] . " - ₹" . $item['amount'];
        imagestring($image, 3, 30, $y, $item_text, $black);
        $y += 20;
    }
    
    // Add totals
    $y += 20;
    imagestring($image, 4, 20, $y, "Total: ₹" . $bill['total_amount'], $black);
    $y += 25;
    imagestring($image, 3, 20, $y, "Discount: ₹" . $bill['discount'], $black);
    $y += 25;
    imagestring($image, 3, 20, $y, "Tax: ₹" . $bill['tax'], $black);
    $y += 25;
    imagestring($image, 5, 20, $y, "Grand Total: ₹" . $bill['grand_total'], $black);
    
    // Save image
    $image_path = "../bills/" . $bill['bill_number'] . ".png";
    imagepng($image, $image_path);
    imagedestroy($image);
    
    return $image_path;
}

// Send bill via WhatsApp
function sendWhatsAppBill($phone, $image_path, $bill_number) {
    $api_key = "YOUR_WHATSAPP_API_KEY"; // Replace with actual API key
    $url = "https://api.whatsapp.com/send"; // Replace with actual API endpoint
    
    $message = "Thank you for your purchase! Here is your bill #$bill_number";
    
    // Using curl to send message (implementation depends on your WhatsApp API provider)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'apikey' => $api_key,
        'phone' => $phone,
        'message' => $message,
        'image' => new CURLFile($image_path)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    return $response;
}

// Send bill via email
function sendEmailBill($email, $image_path, $bill_number) {
    $subject = "Your Bill #$bill_number";
    $message = "<h2>Thank you for your purchase!</h2><p>Please find your bill attached.</p>";
    $headers = "From: shop@example.com\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"boundary\"\r\n";
    
    // Read image file
    $file = fopen($image_path, "rb");
    $data = fread($file, filesize($image_path));
    fclose($file);
    $encoded = chunk_split(base64_encode($data));
    
    // Create email body
    $body = "--boundary\r\n";
    $body .= "Content-Type: text/html; charset=\"ISO-8859-1\"\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $message . "\r\n\r\n";
    $body .= "--boundary\r\n";
    $body .= "Content-Type: image/png; name=\"bill_$bill_number.png\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment\r\n\r\n";
    $body .= $encoded . "\r\n\r\n";
    $body .= "--boundary--";
    
    // Send email
    return mail($email, $subject, $body, $headers);
}

// Archive stock history
function archiveStockHistory() {
    global $pdo;
    
    // Archive records older than 30 days
    $archive_date = date('Y-m-d', strtotime('-30 days'));
    
    $pdo->beginTransaction();
    
    try {
        // Copy to archive table
        $pdo->query("INSERT INTO stock_history_archive 
                    SELECT * FROM stock_history 
                    WHERE created_at < '$archive_date'");
        
        // Delete from main table
        $pdo->query("DELETE FROM stock_history 
                    WHERE created_at < '$archive_date'");
        
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        return false;
    }
}
?>