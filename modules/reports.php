<?php
require_once '../config/database.php';
require_once '../includes/functions.php';
require_once '../includes/header.php';

// Get date filters
$start_date = $_GET['start_date'] ?? date('Y-m-01');
$end_date = $_GET['end_date'] ?? date('Y-m-d');

// Get sales summary
$stmt = $pdo->prepare("SELECT 
                        COUNT(*) as total_bills,
                        SUM(total_amount) as total_sales,
                        SUM(discount) as total_discount,
                        SUM(tax) as total_tax,
                        SUM(grand_total) as grand_total
                      FROM bills 
                      WHERE DATE(bill_date) BETWEEN ? AND ?");
$stmt->execute([$start_date, $end_date]);
$summary = $stmt->fetch(PDO::FETCH_ASSOC);

// Get top selling products
$stmt = $pdo->prepare("SELECT 
                        p.name,
                        SUM(bi.quantity) as total_quantity,
                        SUM(bi.amount) as total_amount
                      FROM bill_items bi
                      JOIN products p ON bi.product_id = p.id
                      JOIN bills b ON bi.bill_id = b.id
                      WHERE DATE(b.bill_date) BETWEEN ? AND ?
                      GROUP BY p.id
                      ORDER BY total_quantity DESC
                      LIMIT 10");
$stmt->execute([$start_date, $end_date]);
$top_products = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get shop details for print
$shop_name = getSetting('shop_name');
$shop_address = getSetting('shop_address');
$shop_contact = getSetting('shop_contact');
?>

<div class="row">
    <div class="col-md-12">
        <h2 class="mb-4"><i class="fas fa-chart-bar me-2"></i>Sales Reports</h2>
        
        <div class="card mb-4">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Filter</h5>
                <button class="btn btn-primary no-print" onclick="window.print()">
                    <i class="fas fa-print me-1"></i> Print Report
                </button>
            </div>
            <div class="card-body">
                <form method="get" class="row g-3">
                    <div class="col-md-4">
                        <label for="start_date" class="form-label">Start Date</label>
                        <input type="date" class="form-control" id="start_date" name="start_date" value="<?php echo $start_date; ?>">
                    </div>
                    <div class="col-md-4">
                        <label for="end_date" class="form-label">End Date</label>
                        <input type="date" class="form-control" id="end_date" name="end_date" value="<?php echo $end_date; ?>">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">&nbsp;</label>
                        <div>
                            <button type="submit" class="btn btn-primary">Generate Report</button>
                            <a href="reports.php" class="btn btn-secondary">Reset</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Print Header (Only visible when printing) -->
        <div class="print-header" style="display: none;">
            <div class="text-center">
                <h2><?php echo $shop_name; ?></h2>
                <p><?php echo $shop_address; ?></p>
                <p>Contact: <?php echo $shop_contact; ?></p>
                <h3>Sales Report: <?php echo date('d/m/Y', strtotime($start_date)); ?> to <?php echo date('d/m/Y', strtotime($end_date)); ?></h3>
                <p>Generated on: <?php echo date('d/m/Y H:i:s'); ?></p>
            </div>
            <hr>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-white bg-primary mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Total Bills</h5>
                        <p class="card-text display-6"><?php echo $summary['total_bills'] ?? 0; ?></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-success mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Total Sales</h5>
                        <p class="card-text display-6">₹<?php echo number_format($summary['total_sales'] ?? 0, 2); ?></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-info mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Total Discount</h5>
                        <p class="card-text display-6">₹<?php echo number_format($summary['total_discount'] ?? 0, 2); ?></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-dark mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Grand Total</h5>
                        <p class="card-text display-6">₹<?php echo number_format($summary['grand_total'] ?? 0, 2); ?></p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Top Selling Products</h5>
                    </div>
                    <div class="card-body">
                        <?php if (count($top_products) > 0): ?>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity Sold</th>
                                            <th>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($top_products as $product): ?>
                                        <tr>
                                            <td><?php echo $product['name']; ?></td>
                                            <td><?php echo $product['total_quantity']; ?></td>
                                            <td>₹<?php echo number_format($product['total_amount'], 2); ?></td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php else: ?>
                            <div class="alert alert-info">No sales data found for the selected period.</div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Stock Status</h5>
                    </div>
                    <div class="card-body">
                        <?php
                        $low_stock = $pdo->query("SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= 10")->fetch(PDO::FETCH_ASSOC);
                        $out_of_stock = $pdo->query("SELECT COUNT(*) as count FROM products WHERE stock = 0")->fetch(PDO::FETCH_ASSOC);
                        $in_stock = $pdo->query("SELECT COUNT(*) as count FROM products WHERE stock > 10")->fetch(PDO::FETCH_ASSOC);
                        ?>
                        
                        <div class="mb-3">
                            <span class="badge bg-success">In Stock: <?php echo $in_stock['count']; ?></span>
                            <span class="badge bg-warning">Low Stock: <?php echo $low_stock['count']; ?></span>
                            <span class="badge bg-danger">Out of Stock: <?php echo $out_of_stock['count']; ?></span>
                        </div>
                        
                        <div class="list-group">
                            <a href="stock_management.php" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                View Stock Management
                                <i class="fas fa-arrow-right"></i>
                            </a>
                            <a href="sales_history.php" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                View Sales History
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@media print {
    .no-print {
        display: none !important;
    }
    
    .print-header {
        display: block !important;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 15px;
    }
    
    body {
        font-size: 12px;
        background: white !important;
        color: black !important;
    }
    
    .container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    
    .card {
        border: 1px solid #000 !important;
        box-shadow: none !important;
        page-break-inside: avoid;
    }
    
    .card-header {
        background-color: #f8f9fa !important;
        color: #000 !important;
        border-bottom: 1px solid #000 !important;
    }
    
    .table th {
        background-color: #f8f9fa !important;
        color: #000 !important;
        border: 1px solid #000 !important;
    }
    
    .table td {
        border: 1px solid #000 !important;
    }
    
    .btn, .navbar, footer {
        display: none !important;
    }
    
    .badge {
        border: 1px solid #000 !important;
        color: #000 !important;
        background: white !important;
    }
    
    .bg-primary, .bg-success, .bg-info, .bg-dark {
        background-color: #f8f9fa !important;
        color: #000 !important;
        border: 1px solid #000 !important;
    }
    
    .text-white {
        color: #000 !important;
    }
    
    .alert {
        border: 1px solid #000 !important;
        background: white !important;
        color: #000 !important;
    }
    
    .list-group-item {
        border: 1px solid #000 !important;
        background: white !important;
        color: #000 !important;
    }
}

@media screen {
    .print-header {
        display: none;
    }
}
</style>

<?php require_once '../includes/footer.php'; ?>