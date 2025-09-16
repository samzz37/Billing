<?php
require_once '../config/database.php';
require_once '../includes/functions.php';
require_once '../includes/header.php';

// Get date filters
$start_date = $_GET['start_date'] ?? date('Y-m-01');
$end_date = $_GET['end_date'] ?? date('Y-m-d');

// Get sales history
$stmt = $pdo->prepare("SELECT b.*, COUNT(bi.id) as items_count 
                      FROM bills b 
                      LEFT JOIN bill_items bi ON b.id = bi.bill_id 
                      WHERE DATE(b.bill_date) BETWEEN ? AND ?
                      GROUP BY b.id 
                      ORDER BY b.bill_date DESC");
$stmt->execute([$start_date, $end_date]);
$bills = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="row">
    <div class="col-md-12">
        <h2 class="mb-4"><i class="fas fa-history me-2"></i>Sales History</h2>
        
        <div class="card mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">Filter</h5>
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
                            <button type="submit" class="btn btn-primary">Filter</button>
                            <a href="sales_history.php" class="btn btn-secondary">Reset</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0">Sales Records</h5>
            </div>
            <div class="card-body">
                <?php if (count($bills) > 0): ?>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Bill Number</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total Amount</th>
                                    <th>Discount</th>
                                    <th>Tax</th>
                                    <th>Grand Total</th>
                                    <th>Payment Method</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($bills as $bill): ?>
                                <tr>
                                    <td><?php echo $bill['bill_number']; ?></td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($bill['bill_date'])); ?></td>
                                    <td><?php echo $bill['customer_name'] ?: 'Walk-in Customer'; ?></td>
                                    <td><?php echo $bill['items_count']; ?></td>
                                    <td>₹<?php echo number_format($bill['total_amount'], 2); ?></td>
                                    <td>₹<?php echo number_format($bill['discount'], 2); ?></td>
                                    <td>₹<?php echo number_format($bill['tax'], 2); ?></td>
                                    <td>₹<?php echo number_format($bill['grand_total'], 2); ?></td>
                                    <td><?php echo $bill['payment_method']; ?></td>
                                    <td>
                                        <a href="print_bill.php?bill_id=<?php echo $bill['id']; ?>" target="_blank" class="btn btn-sm btn-info">
                                            <i class="fas fa-print"></i>
                                        </a>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="alert alert-info">No sales records found for the selected period.</div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>