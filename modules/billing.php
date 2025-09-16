<?php
require_once '../config/database.php';
require_once '../includes/functions.php';
require_once '../includes/header.php';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check if we're already in a transaction
        $inTransaction = $pdo->inTransaction();
        
        if (!$inTransaction) {
            $pdo->beginTransaction();
        }
        
        // Generate bill number
        $bill_number = generateBillNumber();
        $customer_name = $_POST['customer_name'] ?? '';
        $customer_gstin = $_POST['customer_gstin'] ?? '';
        $customer_phone = $_POST['customer_phone'] ?? '';
        $customer_email = $_POST['customer_email'] ?? '';
        $payment_method = $_POST['payment_method'] ?? 'Cash';
        
        // Get default settings with fallback values
        $discount_type = $_POST['discount_type'] ?? (getSetting('default_discount_type') ?: 'fixed');
        $tax_type = $_POST['tax_type'] ?? (getSetting('default_tax_type') ?: 'fixed');
        
        // Get discount and tax values
        $discount = $_POST['discount'] ?? 0;
        if ($discount_type == 'percent' && empty($_POST['discount'])) {
            $discount = getSetting('default_discount_percent') ?: 0;
        }
        
        $tax = $_POST['tax'] ?? 0;
        if ($tax_type == 'percent' && empty($_POST['tax'])) {
            $tax = getSetting('default_tax_percent') ?: 0;
        }
        
        // Calculate totals
        $total_amount = 0;
        $items = [];
        $out_of_stock_items = [];
        
        if (isset($_POST['product_id'])) {
            foreach ($_POST['product_id'] as $index => $product_id) {
                if (empty($product_id)) continue;
                
                $quantity = (int)$_POST['quantity'][$index];
                $rate = (float)$_POST['rate'][$index];
                $gst_rate = (float)$_POST['gst_rate'][$index];
                $amount = $quantity * $rate;
                
                // Check stock availability
                $current_stock = getProductStock($product_id);
                if ($current_stock < $quantity) {
                    $product_name = $pdo->prepare("SELECT name FROM products WHERE id = ?");
                    $product_name->execute([$product_id]);
                    $product_name = $product_name->fetchColumn();
                    
                    $out_of_stock_items[] = [
                        'name' => $product_name,
                        'requested' => $quantity,
                        'available' => $current_stock
                    ];
                    continue;
                }
                
                $items[] = [
                    'product_id' => $product_id,
                    'quantity' => $quantity,
                    'rate' => $rate,
                    'gst_rate' => $gst_rate,
                    'amount' => $amount
                ];
                
                $total_amount += $amount;
            }
        }
        
        // Check if any items are out of stock
        if (!empty($out_of_stock_items)) {
            $error = "Some items are out of stock:<br>";
            foreach ($out_of_stock_items as $item) {
                $error .= "- {$item['name']}: Requested {$item['requested']}, Available {$item['available']}<br>";
            }
            $error .= "Please adjust quantities or remove out-of-stock items.";
            throw new Exception($error);
        }
        
        // Check if any items were added
        if (empty($items)) {
            throw new Exception("No items added to the bill. Please add at least one item.");
        }
        
        // Calculate discount and tax
        $discount_amount = ($discount_type == 'percent') ? ($total_amount * (float)$discount / 100) : (float)$discount;
        $tax_amount = ($tax_type == 'percent') ? (($total_amount - $discount_amount) * (float)$tax / 100) : (float)$tax;
        $grand_total = $total_amount - $discount_amount + $tax_amount;
        
        // Insert bill
        $stmt = $pdo->prepare("INSERT INTO bills (bill_number, customer_name, customer_gstin, customer_phone, customer_email, total_amount, discount, discount_type, tax, tax_type, grand_total, payment_method) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$bill_number, $customer_name, $customer_gstin, $customer_phone, $customer_email, $total_amount, $discount, $discount_type, $tax, $tax_type, $grand_total, $payment_method]);
        $bill_id = $pdo->lastInsertId();
        
        // Insert bill items and update stock
        foreach ($items as $item) {
            $stmt = $pdo->prepare("INSERT INTO bill_items (bill_id, product_id, quantity, rate, gst_rate, amount) 
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$bill_id, $item['product_id'], $item['quantity'], $item['rate'], $item['gst_rate'], $item['amount']]);
            
            // Update stock and log history
            updateProductStock($item['product_id'], $item['quantity']);
            logStockChange($item['product_id'], 'OUT', $item['quantity'], "Bill: $bill_number");
        }
        
        // Archive stock history (records older than 30 days)
        archiveStockHistory(30);
        
        if (!$inTransaction) {
            $pdo->commit();
        }
        
        // Generate and send bill
        $bill_sent = generateAndSendBill($bill_id);
        
        if ($bill_sent) {
            $_SESSION['success_message'] = "Bill generated and sent to customer successfully!";
        } else {
            $_SESSION['warning_message'] = "Bill generated but could not be sent to customer.";
        }
        
        echo '<script>window.location.href = "print_bill.php?bill_id=' . $bill_id . '";</script>';
        exit();
        
    } catch (Exception $e) {
        // Only roll back if a transaction is active and we started it
        if ($pdo->inTransaction() && !$inTransaction) {
            $pdo->rollBack();
        }
        $error = $e->getMessage();
    }
}

// Get products for dropdown (only in-stock items)
$products = $pdo->query("SELECT * FROM products WHERE stock > 0 ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);

// Get default settings
$default_gst_rate = getSetting('default_gst_rate') ?: 18;
$default_discount_type = getSetting('default_discount_type') ?: 'fixed';
$default_tax_type = getSetting('default_tax_type') ?: 'fixed';
$default_discount_percent = getSetting('default_discount_percent') ?: 5;
$default_tax_percent = getSetting('default_tax_percent') ?: 10;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Bill - Shop Billing System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #4e73df;
            --secondary: #6f42c1;
            --success: #1cc88a;
            --light-bg: #f8f9fc;
        }
        
        body {
            background-color: var(--light-bg);
        }
        
        .card {
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
            border: 1px solid #e3e6f0;
        }
        
        .card-header {
            background-color: #f8f9fc;
            border-bottom: 1px solid #e3e6f0;
        }
        
        .btn-primary {
            background-color: var(--primary);
            border-color: var(--primary);
        }
        
        .btn-primary:hover {
            background-color: #3a5fc8;
            border-color: #3a5fc8;
        }
        
        .product-search {
            position: relative;
        }

        .product-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-top: none;
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
        }

        .suggestion-item:hover {
            background-color: #f0f8ff;
        }

        .suggestion-item:last-child {
            border-bottom: none;
        }
        
        .table th {
            font-weight: 600;
            color: #5a5c69;
        }
        
        #grandTotal {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .form-label {
            font-weight: 600;
            color: #5a5c69;
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-md-12">
                <h2 class="mb-4"><i class="fas fa-receipt me-2"></i>Create New Bill</h2>
                
                <?php if (isset($error)): ?>
                    <div class="alert alert-danger"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="post" id="billForm">
                    <div class="row mb-3">
                        <div class="col-md-2">
                            <label for="customer_name" class="form-label">Customer Name *</label>
                            <input type="text" class="form-control" id="customer_name" name="customer_name" placeholder="Enter name" required value="<?php echo isset($_POST['customer_name']) ? htmlspecialchars($_POST['customer_name']) : ''; ?>">
                        </div>
                        <div class="col-md-2">
                            <label for="customer_phone" class="form-label">Phone Number *</label>
                            <input type="tel" class="form-control" id="customer_phone" name="customer_phone" placeholder="Phone with WhatsApp" required value="<?php echo isset($_POST['customer_phone']) ? htmlspecialchars($_POST['customer_phone']) : ''; ?>">
                        </div>
                        <div class="col-md-2">
                            <label for="customer_email" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="customer_email" name="customer_email" placeholder="Email address" value="<?php echo isset($_POST['customer_email']) ? htmlspecialchars($_POST['customer_email']) : ''; ?>">
                        </div>
                        <div class="col-md-2">
                            <label for="customer_gstin" class="form-label">GSTIN (Optional)</label>
                            <input type="text" class="form-control" id="customer_gstin" name="customer_gstin" placeholder="GSTIN Number" pattern="[A-Z0-9]{15}" title="15 character GSTIN format" value="<?php echo isset($_POST['customer_gstin']) ? htmlspecialchars($_POST['customer_gstin']) : ''; ?>">
                        </div>
                        <div class="col-md-2">
                            <label for="bill_date" class="form-label">Bill Date</label>
                            <input type="text" class="form-control" value="<?php echo date('Y-m-d H:i:s'); ?>" readonly>
                        </div>
                        <div class="col-md-2">
                            <label for="payment_method" class="form-label">Payment Method</label>
                            <select class="form-select" id="payment_method" name="payment_method">
                                <option value="Cash" <?php echo (isset($_POST['payment_method']) && $_POST['payment_method'] == 'Cash') ? 'selected' : ''; ?>>Cash</option>
                                <option value="Card" <?php echo (isset($_POST['payment_method']) && $_POST['payment_method'] == 'Card') ? 'selected' : ''; ?>>Card</option>
                                <option value="UPI" <?php echo (isset($_POST['payment_method']) && $_POST['payment_method'] == 'UPI') ? 'selected' : ''; ?>>UPI</option>
                                <option value="Bank Transfer" <?php echo (isset($_POST['payment_method']) && $_POST['payment_method'] == 'Bank Transfer') ? 'selected' : ''; ?>>Bank Transfer</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Items</h5>
                            <div>
                                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="clearStockHistory" data-bs-toggle="modal" data-bs-target="#clearHistoryModal">
                                    <i class="fas fa-broom me-1"></i>Clear Stock History
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-info" id="viewStockHistory" data-bs-toggle="modal" data-bs-target="#stockHistoryModal">
                                    <i class="fas fa-history me-1"></i>View Stock History
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <table class="table" id="itemsTable">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Rate (₹)</th>
                                        <th>GST %</th>
                                        <th>Stock Available</th>
                                        <th>Quantity</th>
                                        <th>Amount (₹)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <input type="hidden" class="product-id" name="product_id[]" value="">
                                            <input type="text" class="form-control product-search" placeholder="Type product name" autocomplete="off">
                                            <div class="product-suggestions"></div>
                                        </td>
                                        <td>
                                            <input type="number" class="form-control rate" name="rate[]" step="0.01" readonly>
                                        </td>
                                        <td>
                                            <input type="number" class="form-control gst-rate" name="gst_rate[]" step="0.01" value="<?php echo $default_gst_rate; ?>" min="0" max="100">
                                        </td>
                                        <td>
                                            <input type="text" class="form-control stock-available" value="" readonly>
                                        </td>
                                        <td>
                                            <input type="number" class="form-control quantity" name="quantity[]" min="1" value="1" required>
                                        </td>
                                        <td>
                                            <input type="text" class="form-control amount" name="amount[]" readonly>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-danger remove-row"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button style="float: right;" type="button" class="btn btn-success" id="addRow"><i class="fas fa-plus me-1"></i>Add Item</button>
                        </div>
                    </div>
                    
                    <div class="row justify-content-end">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Bill Summary</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-2">
                                        <div class="col-6">
                                            <strong>Total Amount:</strong>
                                        </div>
                                        <div class="col-6 text-end">
                                            <span id="totalAmount">0.00</span>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-2">
                                        <div class="col-5">
                                            <label for="discount" class="form-label">Discount:</label>
                                        </div>
                                        <div class="col-4">
                                            <input type="number" class="form-control" id="discount" name="discount" value="<?php echo isset($_POST['discount']) ? $_POST['discount'] : (($default_discount_type == 'percent') ? $default_discount_percent : 0); ?>" step="0.01" min="0">
                                        </div>
                                        <div class="col-3">
                                            <select class="form-select" id="discount_type" name="discout_type">
                                                <option value="fixed" <?php echo (isset($_POST['discount_type']) && $_POST['discount_type'] == 'fixed') ? 'selected' : (($default_discount_type == 'fixed') ? 'selected' : ''); ?>>₹</option>
                                                <option value="percent" <?php echo (isset($_POST['discount_type']) && $_POST['discount_type'] == 'percent') ? 'selected' : (($default_discount_type == 'percent') ? 'selected' : ''); ?>>%</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-2">
                                        <div class="col-5">
                                            <label for="tax" class="form-label">Tax:</label>
                                        </div>
                                        <div class="col-4">
                                            <input type="number" class="form-control" id="tax" name="tax" value="<?php echo isset($_POST['tax']) ? $_POST['tax'] : (($default_tax_type == 'percent') ? $default_tax_percent : 0); ?>" step="0.01" min="0">
                                        </div>
                                        <div class="col-3">
                                            <select class="form-select" id="tax_type" name="tax_type">
                                                <option value="fixed" <?php echo (isset($_POST['tax_type']) && $_POST['tax_type'] == 'fixed') ? 'selected' : (($default_tax_type == 'fixed') ? 'selected' : ''); ?>>₹</option>
                                                <option value="percent" <?php echo (isset($_POST['tax_type']) && $_POST['tax_type'] == 'percent') ? 'selected' : (($default_tax_type == 'percent') ? 'selected' : ''); ?>>%</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-2">
                                        <div class="col-6">
                                            <strong>Discount Amount:</strong>
                                        </div>
                                        <div class="col-6 text-end">
                                            <span id="discountAmount">0.00</span>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-2">
                                        <div class="col-6">
                                            <strong>Tax Amount:</strong>
                                        </div>
                                        <div class="col-6 text-end">
                                            <span id="taxAmount">0.00</span>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-2">
                                        <div class="col-6">
                                            <strong>Grand Total:</strong>
                                        </div>
                                        <div class="col-6 text-end">
                                            <span id="grandTotal">0.00</span>
                                        </div>
                                    </div>
                                    
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="autoSendBill" name="autoSendBill" checked>
                                        <label class="form-check-label" for="autoSendBill">
                                            Automatically send bill to customer via WhatsApp & Email
                                        </label>
                                    </div>
                                    
                                    <div class="d-grid gap-2 mt-3">
                                        <button type="submit" class="btn btn-primary btn-lg">Generate Bill</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Stock History Modal -->
    <div class="modal fade" id="stockHistoryModal" tabindex="-1" aria-labelledby="stockHistoryModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="stockHistoryModalLabel">Stock History</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="stockHistoryTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Stock After</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Stock history will be loaded via AJAX -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Clear History Modal -->
    <div class="modal fade" id="clearHistoryModal" tabindex="-1" aria-labelledby="clearHistoryModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="clearHistoryModalLabel">Clear Stock History</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="clearDate" class="form-label">Clear history before:</label>
                        <input type="date" class="form-control" id="clearDate" name="clearDate">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="archiveData" name="archiveData" checked>
                        <label class="form-check-label" for="archiveData">
                            Archive data before clearing
                        </label>
                    </div>
                    <div class="alert alert-warning">
                        <strong>Warning:</strong> This action cannot be undone. Archived data will be moved to separate storage.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmClearHistory">Clear History</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Product data for search functionality
        const products = <?php echo json_encode($products); ?>;
        
        // Add new row
        document.getElementById('addRow').addEventListener('click', function() {
            const newRow = document.querySelector('#itemsTable tbody tr').cloneNode(true);
            newRow.querySelector('.product-id').value = '';
            newRow.querySelector('.product-search').value = '';
            newRow.querySelector('.rate').value = '';
            newRow.querySelector('.gst-rate').value = '<?php echo $default_gst_rate; ?>';
            newRow.querySelector('.stock-available').value = '';
            newRow.querySelector('.quantity').value = '1';
            newRow.querySelector('.amount').value = '';
            document.querySelector('#itemsTable tbody').appendChild(newRow);
            attachRowEvents(newRow);
            initProductSearch(newRow.querySelector('.product-search'), newRow.querySelector('.product-suggestions'));
        });
        
        // Initialize product search functionality
        function initProductSearch(inputElement, suggestionsElement) {
            inputElement.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                suggestionsElement.innerHTML = '';
                
                if (searchTerm.length < 1) {
                    suggestionsElement.style.display = 'none';
                    return;
                }
                
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm)
                );
                
                if (filteredProducts.length > 0) {
                    suggestionsElement.style.display = 'block';
                    
                    filteredProducts.sort((a, b) => {
                        const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
                        const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
                        
                        if (aStartsWith && !bStartsWith) return -1;
                        if (!aStartsWith && bStartsWith) return 1;
                        return a.name.localeCompare(b.name);
                    });
                    
                    filteredProducts.forEach(product => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        
                        const productName = product.name;
                        const matchIndex = productName.toLowerCase().indexOf(searchTerm);
                        
                        if (matchIndex !== -1) {
                            const beforeMatch = productName.substring(0, matchIndex);
                            const matchText = productName.substring(matchIndex, matchIndex + searchTerm.length);
                            const afterMatch = productName.substring(matchIndex + searchTerm.length);
                            
                            div.innerHTML = `${beforeMatch}<strong>${matchText}</strong>${afterMatch}`;
                        } else {
                            div.textContent = productName;
                        }
                        
                        div.dataset.id = product.id;
                        div.dataset.rate = product.rate;
                        div.dataset.gst = product.gst_rate || <?php echo $default_gst_rate; ?>;
                        div.dataset.stock = product.stock;
                        
                        div.addEventListener('click', function() {
                            const row = this.closest('tr');
                            row.querySelector('.product-id').value = this.dataset.id;
                            row.querySelector('.product-search').value = productName;
                            row.querySelector('.rate').value = this.dataset.rate;
                            row.querySelector('.gst-rate').value = this.dataset.gst;
                            row.querySelector('.stock-available').value = this.dataset.stock;
                            
                            const quantity = parseInt(row.querySelector('.quantity').value) || 0;
                            row.querySelector('.amount').value = (parseFloat(this.dataset.rate) * quantity).toFixed(2);
                            
                            suggestionsElement.style.display = 'none';
                            calculateTotal();
                        });
                        
                        suggestionsElement.appendChild(div);
                    });
                } else {
                    suggestionsElement.style.display = 'none';
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!inputElement.contains(e.target) && !suggestionsElement.contains(e.target)) {
                    suggestionsElement.style.display = 'none';
                }
            });
        }
        
        // Remove row
        function attachRowEvents(row) {
            row.querySelector('.remove-row').addEventListener('click', function() {
                if (document.querySelectorAll('#itemsTable tbody tr').length > 1) {
                    row.remove();
                    calculateTotal();
                }
            });
            
            row.querySelector('.quantity').addEventListener('input', function() {
                const productId = row.querySelector('.product-id').value;
                if (!productId) return;
                
                const product = products.find(p => p.id == productId);
                if (!product) return;
                
                if (parseInt(this.value) > parseInt(product.stock)) {
                    alert('Quantity exceeds available stock! Available: ' + product.stock);
                    this.value = product.stock;
                }
                
                const rate = parseFloat(row.querySelector('.rate').value) || 0;
                row.querySelector('.amount').value = (rate * this.value).toFixed(2);
                calculateTotal();
            });
            
            row.querySelector('.gst-rate').addEventListener('input', function() {
                const rate = parseFloat(row.querySelector('.rate').value) || 0;
                const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
                row.querySelector('.amount').value = (rate * quantity).toFixed(2);
                calculateTotal();
            });
        }
        
        // Initialize product search for existing rows
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
            attachRowEvents(row);
            initProductSearch(row.querySelector('.product-search'), row.querySelector('.product-suggestions'));
        });
        
        // Load stock history when modal is shown
        document.getElementById('stockHistoryModal').addEventListener('show.bs.modal', function() {
            fetch('get_stock_history.php')
                .then(response => response.text())
                .then(data => {
                    document.querySelector('#stockHistoryTable tbody').innerHTML = data;
                });
        });
        
        // Clear stock history
        document.getElementById('confirmClearHistory').addEventListener('click', function() {
            const clearDate = document.getElementById('clearDate').value;
            const archiveData = document.getElementById('archiveData').checked;
            
            fetch('clear_stock_history.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `clearDate=${clearDate}&archiveData=${archiveData}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Stock history cleared successfully!');
                    $('#clearHistoryModal').modal('hide');
                } else {
                    alert('Error: ' + data.message);
                }
            });
        });
        
        // Discount and tax changes
        document.getElementById('discount').addEventListener('input', calculateTotal);
        document.getElementById('tax').addEventListener('input', calculateTotal);
        document.getElementById('discount_type').addEventListener('change', calculateTotal);
        document.getElementById('tax_type').addEventListener('change', calculateTotal);
        
        // Calculate totals
        function calculateTotal() {
            let total = 0;
            document.querySelectorAll('.amount').forEach(input => {
                total += parseFloat(input.value) || 0;
            });
            
            const discount = parseFloat(document.getElementById('discount').value) || 0;
            const discountType = document.getElementById('discount_type').value;
            const tax = parseFloat(document.getElementById('tax').value) || 0;
            const taxType = document.getElementById('tax_type').value;
            
            const discountAmount = discountType === 'percent' ? (total * discount / 100) : discount;
            const taxableAmount = total - discountAmount;
            const taxAmount = taxType === 'percent' ? (taxableAmount * tax / 100) : tax;
            const grandTotal = taxableAmount + taxAmount;
            
            document.getElementById('totalAmount').textContent = total.toFixed(2);
            document.getElementById('discountAmount').textContent = discountAmount.toFixed(2);
            document.getElementById('taxAmount').textContent = taxAmount.toFixed(2);
            document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
        }
        
        // Initial calculation
        calculateTotal();
    });
    </script>
</body>
</html>