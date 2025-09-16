<?php
require_once 'config/database.php';
require_once 'includes/functions.php';
require_once 'includes/header.php';

// Get today's sales summary
$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT 
                        COUNT(*) as total_bills,
                        SUM(grand_total) as total_sales
                      FROM bills 
                      WHERE DATE(bill_date) = ?");
$stmt->execute([$today]);
$today_summary = $stmt->fetch(PDO::FETCH_ASSOC);

// Get low stock products
$low_stock_products = $pdo->query("SELECT name, stock FROM products WHERE stock > 0 AND stock <= 10 ORDER BY stock ASC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

// Get recent bills
$recent_bills = $pdo->query("SELECT bill_number, customer_name, grand_total, bill_date FROM bills ORDER BY bill_date DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="row">
    <div class="col-md-12">
        <div class="p-5 mb-4 bg-light rounded-3">
            <div class="container-fluid py-5">
                <h1 class="display-5 fw-bold">Shop Billing System</h1>
                <p class="col-md-8 fs-4">Efficiently manage your shop billing, inventory, and sales reports with our comprehensive solution.</p>
                <a href="modules/billing.php" class="btn btn-primary btn-lg">Create New Bill</a>
            </div>
        </div>
    </div>
</div>

<div class="row align-items-md-stretch mb-4">
    <div class="col-md-6">
        <div class="h-100 p-5 text-white bg-primary rounded-3">
            <h2>Today's Sales</h2>
            <p>Total Bills: <strong><?php echo $today_summary['total_bills'] ?? 0; ?></strong></p>
            <p>Total Sales: <strong>₹<?php echo number_format($today_summary['total_sales'] ?? 0, 2); ?></strong></p>
            <a href="modules/reports.php" class="btn btn-outline-light">View Reports</a>
        </div>
    </div>
    <div class="col-md-6">
        <div class="h-100 p-5 bg-light border rounded-3">
            <h2>Quick Actions</h2>
            <div class="d-grid gap-2">
                <a href="modules/billing.php" class="btn btn-outline-primary"><i class="fas fa-receipt me-1"></i> Create Bill</a>
                <a href="modules/stock_management.php" class="btn btn-outline-success"><i class="fas fa-boxes me-1"></i> Manage Stock</a>
                <a href="modules/sales_history.php" class="btn btn-outline-info"><i class="fas fa-history me-1"></i> Sales History</a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="card mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">Low Stock Alert</h5>
            </div>
            <div class="card-body">
                <?php if (count($low_stock_products) > 0): ?>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($low_stock_products as $product): ?>
                                <tr>
                                    <td><?php echo $product['name']; ?></td>
                                    <td><?php echo $product['stock']; ?></td>
                                    <td><span class="badge bg-warning">Low Stock</span></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <a href="modules/stock_management.php" class="btn btn-sm btn-warning">Manage Stock</a>
                <?php else: ?>
                    <div class="alert alert-success">All products have sufficient stock.</div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0">Recent Bills</h5>
            </div>
            <div class="card-body">
                <?php if (count($recent_bills) > 0): ?>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recent_bills as $bill): ?>
                                <tr>
                                    <td><?php echo $bill['bill_number']; ?></td>
                                    <td><?php echo $bill['customer_name'] ?: 'Walk-in'; ?></td>
                                    <td>₹<?php echo number_format($bill['grand_total'], 2); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <a href="modules/sales_history.php" class="btn btn-sm btn-info">View All</a>
                <?php else: ?>
                    <div class="alert alert-info">No bills created today.</div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>