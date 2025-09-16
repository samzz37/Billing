<?php
require_once '../config/database.php';
require_once '../includes/functions.php';

if (!isset($_GET['bill_id'])) {
    die("Bill ID not specified");
}

$bill_id = $_GET['bill_id'];
$stmt = $pdo->prepare("SELECT b.*, bi.product_id, bi.quantity, bi.rate, bi.gst_rate, bi.amount, p.name as product_name 
                      FROM bills b 
                      JOIN bill_items bi ON b.id = bi.bill_id 
                      JOIN products p ON bi.product_id = p.id 
                      WHERE b.id = ?");
$stmt->execute([$bill_id]);
$bill_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($bill_items)) {
    die("Bill not found");
}

$bill = $bill_items[0];
$greeting = getGreeting();

// Calculate discount and tax amounts
$discount_amount = ($bill['discount_type'] == 'percent') ? ($bill['total_amount'] * $bill['discount'] / 100) : $bill['discount'];
$tax_amount = ($bill['tax_type'] == 'percent') ? (($bill['total_amount'] - $discount_amount) * $bill['tax'] / 100) : $bill['tax'];

// Get shop details
$shop_name = getSetting('shop_name');
$shop_address = getSetting('shop_address');
$shop_contact = getSetting('shop_contact');
$shop_email = getSetting('shop_email');
$shop_gstin = getSetting('shop_gstin');

// Prepare WhatsApp message
$whatsapp_message = rawurlencode("🛍️ *BILL RECEIPT* 🛍️\n\n");
$whatsapp_message .= rawurlencode("Shop: $shop_name\n");
$whatsapp_message .= rawurlencode("Address: $shop_address\n");
$whatsapp_message .= rawurlencode("Contact: $shop_contact\n");
$whatsapp_message .= rawurlencode("GSTIN: $shop_gstin\n\n");
$whatsapp_message .= rawurlencode("Bill No: {$bill['bill_number']}\n");
$whatsapp_message .= rawurlencode("Date: " . date('d/m/Y H:i:s', strtotime($bill['bill_date'])) . "\n");
$whatsapp_message .= rawurlencode("Customer: " . ($bill['customer_name'] ?: 'Walk-in Customer') . "\n");

if ($bill['customer_gstin']) {
    $whatsapp_message .= rawurlencode("Customer GSTIN: {$bill['customer_gstin']}\n");
}

$whatsapp_message .= rawurlencode("Payment Method: {$bill['payment_method']}\n\n");
$whatsapp_message .= rawurlencode("--------------------------------\n");
$whatsapp_message .= rawurlencode("ITEMS PURCHASED:\n");
$whatsapp_message .= rawurlencode("--------------------------------\n");

foreach ($bill_items as $index => $item) {
    $whatsapp_message .= rawurlencode(($index + 1) . ". {$item['product_name']}\n");
    $whatsapp_message .= rawurlencode("   Qty: {$item['quantity']} × ₹" . number_format($item['rate'], 2) . "\n");
    $whatsapp_message .= rawurlencode("   GST: " . number_format($item['gst_rate'], 2) . "%\n");
    $whatsapp_message .= rawurlencode("   Amount: ₹" . number_format($item['amount'], 2) . "\n\n");
}

$whatsapp_message .= rawurlencode("--------------------------------\n");
$whatsapp_message .= rawurlencode("Total Amount: ₹" . number_format($bill['total_amount'], 2) . "\n");

if ($bill['discount_type'] == 'percent') {
    $whatsapp_message .= rawurlencode("Discount: {$bill['discount']}% (₹" . number_format($discount_amount, 2) . ")\n");
} else {
    $whatsapp_message .= rawurlencode("Discount: ₹" . number_format($discount_amount, 2) . "\n");
}

if ($bill['tax_type'] == 'percent') {
    $whatsapp_message .= rawurlencode("Tax: {$bill['tax']}% (₹" . number_format($tax_amount, 2) . ")\n");
} else {
    $whatsapp_message .= rawurlencode("Tax: ₹" . number_format($tax_amount, 2) . "\n");
}

$whatsapp_message .= rawurlencode("Grand Total: ₹" . number_format($bill['grand_total'], 2) . "\n");
$whatsapp_message .= rawurlencode("--------------------------------\n");
$whatsapp_message .= rawurlencode("$greeting\n");
$whatsapp_message .= rawurlencode("Thank you for your business! Please visit again.\n");
$whatsapp_message .= rawurlencode("Terms: Goods sold are not returnable unless defective");

// Prepare WhatsApp URL - if customer has phone, prefill their number
$whatsapp_url = "https://wa.me/?text=$whatsapp_message";
if (!empty($bill['customer_phone'])) {
    $clean_phone = preg_replace('/[^0-9]/', '', $bill['customer_phone']);
    $whatsapp_url = "https://wa.me/$clean_phone?text=$whatsapp_message";
}

// Prepare email content
$email_subject = rawurlencode("Your Bill Receipt - {$bill['bill_number']} - $shop_name");
$email_body = rawurlencode("Dear Valued Customer,\n\nThank you for your purchase at $shop_name.\n\nPlease find your bill details below:\n\n");

// Add bill details to email body
$email_body .= $whatsapp_message;
$email_body = str_replace("%0A", "%0D%0A", $email_body); // Ensure proper line breaks in email

// Prepare email URL
$email_url = "";
if (!empty($bill['customer_email'])) {
    $email_url = "mailto:{$bill['customer_email']}?subject=$email_subject&body=$email_body";
} else {
    $email_url = "mailto:?subject=$email_subject&body=$email_body";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill <?php echo $bill['bill_number']; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @media print {
            .no-print {
                display: none;
            }
            body {
                font-size: 14px;
            }
            .container {
                width: 100%;
                max-width: 100%;
            }
        }
        .bill-header {
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .bill-footer {
            border-top: 2px solid #000;
            padding-top: 15px;
            margin-top: 30px;
        }
        .gst-details {
            font-size: 12px;
        }
        .whatsapp-btn {
            background-color: #25D366;
            border-color: #25D366;
            color: white;
        }
        .whatsapp-btn:hover {
            background-color: #128C7E;
            border-color: #128C7E;
            color: white;
        }
        .email-btn {
            background-color: #EA4335;
            border-color: #EA4335;
            color: white;
        }
        .email-btn:hover {
            background-color: #D14836;
            border-color: #D14836;
            color: white;
        }
        .auto-send-alert {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <div class="row no-print mb-3">
            <div class="col-12">
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary" onclick="window.print()">
                        <i class="fas fa-print me-1"></i>Print
                    </button>
                    <a href="billing.php" class="btn btn-success">
                        <i class="fas fa-plus me-1"></i>New Bill
                    </a>
                    <a href="<?php echo $whatsapp_url; ?>" class="btn whatsapp-btn" target="_blank" id="whatsappShare">
                        <i class="fab fa-whatsapp me-1"></i>
                        <?php echo !empty($bill['customer_phone']) ? 'Send WhatsApp' : 'Share via WhatsApp'; ?>
                    </a>
                    <a href="<?php echo $email_url; ?>" class="btn email-btn" id="emailShare">
                        <i class="fas fa-envelope me-1"></i>
                        <?php echo !empty($bill['customer_email']) ? 'Send Email' : 'Share via Email'; ?>
                    </a>
                    <button onclick="goBack()" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Back
                    </button>
                </div>
                
                <!-- Auto-send notification -->
                <div class="alert alert-info auto-send-alert mt-3" id="autoSendAlert">
                    <i class="fas fa-info-circle me-2"></i>
                    <span id="autoSendMessage"></span>
                </div>
            </div>
        </div>
        
        <div class="bill-header text-center">
            <h1><?php echo $shop_name; ?></h1>
            <p><?php echo $shop_address; ?></p>
            <p>Phone: <?php echo $shop_contact; ?> | Email: <?php echo $shop_email; ?></p>
            <p>GSTIN: <?php echo $shop_gstin; ?></p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <p><strong>Bill Number:</strong> <?php echo $bill['bill_number']; ?></p>
                <p><strong>Bill Date:</strong> <?php echo date('d/m/Y H:i:s', strtotime($bill['bill_date'])); ?></p>
            </div>
            <div class="col-md-6">
                <p><strong>Customer Name:</strong> <?php echo $bill['customer_name'] ?: 'Walk-in Customer'; ?></p>
                <?php if ($bill['customer_gstin']): ?>
                    <p><strong>Customer GSTIN:</strong> <?php echo $bill['customer_gstin']; ?></p>
                <?php endif; ?>
                <?php if ($bill['customer_phone']): ?>
                    <p><strong>Phone:</strong> <?php echo $bill['customer_phone']; ?></p>
                <?php endif; ?>
                <?php if ($bill['customer_email']): ?>
                    <p><strong>Email:</strong> <?php echo $bill['customer_email']; ?></p>
                <?php endif; ?>
                <p><strong>Payment Method:</strong> <?php echo $bill['payment_method']; ?></p>
            </div>
        </div>
        
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Rate</th>
                    <th>GST %</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($bill_items as $index => $item): ?>
                <tr>
                    <td><?php echo $index + 1; ?></td>
                    <td><?php echo $item['product_name']; ?></td>
                    <td>₹<?php echo number_format($item['rate'], 2); ?></td>
                    <td><?php echo number_format($item['gst_rate'], 2); ?>%</td>
                    <td><?php echo $item['quantity']; ?></td>
                    <td>₹<?php echo number_format($item['amount'], 2); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" class="text-end"><strong>Total Amount:</strong></td>
                    <td><strong>₹<?php echo number_format($bill['total_amount'], 2); ?></strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-end">
                        <strong>Discount: 
                        <?php if ($bill['discount_type'] == 'percent'): ?>
                            (<?php echo number_format($bill['discount'], 2); ?>%)
                        <?php endif; ?>
                        </strong>
                    </td>
                    <td><strong>₹<?php echo number_format($discount_amount, 2); ?></strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-end">
                        <strong>Tax: 
                        <?php if ($bill['tax_type'] == 'percent'): ?>
                            (<?php echo number_format($bill['tax'], 2); ?>%)
                        <?php endif; ?>
                        </strong>
                    </td>
                    <td><strong>₹<?php echo number_format($tax_amount, 2); ?></strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-end"><strong>Grand Total:</strong></td>
                    <td><strong>₹<?php echo number_format($bill['grand_total'], 2); ?></strong></td>
                </tr>
            </tfoot>
        </table>
        
        <div class="bill-footer text-center">
            <p class="fw-bold"><?php echo $greeting; ?></p>
            <p>Thank you for your business! Please visit again.</p>
            <p>Terms: Goods sold are not returnable unless defective</p>
        </div>
    </div>
    
    <script>
        function goBack() {
            // Check if we came from another page in this site
            if (document.referrer && document.referrer.indexOf(window.location.hostname) !== -1) {
                window.history.back();
            } else {
                // If came from external site, go to billing page
                window.location.href = 'billing.php';
            }
        }
        
        // Prevent form resubmission on refresh/back
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }
        
        // WhatsApp share functionality
        document.getElementById('whatsappShare').addEventListener('click', function(e) {
            // For mobile devices, open in same tab
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                // Allow the default link behavior for mobile
                return true;
            } else {
                // For desktop, open in new tab
                e.preventDefault();
                window.open(this.href, '_blank');
            }
        });
        
        // Email share functionality
        document.getElementById('emailShare').addEventListener('click', function(e) {
            // For mobile devices, open in same tab
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                // Allow the default link behavior for mobile
                return true;
            } else {
                // For desktop, open in new tab
                e.preventDefault();
                window.open(this.href, '_blank');
            }
        });
        
        // Auto-send functionality
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const autoSend = urlParams.get('auto_send');
            const customerPhone = "<?php echo $bill['customer_phone']; ?>";
            const customerEmail = "<?php echo $bill['customer_email']; ?>";
            
            if (autoSend === 'whatsapp' && customerPhone) {
                // Auto-send WhatsApp
                document.getElementById('autoSendMessage').textContent = 
                    'Bill automatically sent to customer via WhatsApp.';
                document.getElementById('autoSendAlert').style.display = 'block';
                
                // Open WhatsApp after a short delay
                setTimeout(() => {
                    window.open(document.getElementById('whatsappShare').href, '_blank');
                }, 1000);
            }
            else if (autoSend === 'email' && customerEmail) {
                // Auto-send Email
                document.getElementById('autoSendMessage').textContent = 
                    'Bill automatically sent to customer via Email.';
                document.getElementById('autoSendAlert').style.display = 'block';
                
                // Open email after a short delay
                setTimeout(() => {
                    window.open(document.getElementById('emailShare').href, '_blank');
                }, 1000);
            }
        });
    </script>
</body>
</html>