<?php
require_once '../config/database.php';
require_once '../includes/functions.php';
require_once '../includes/header.php';

// Handle stock update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_stock'])) {
    $product_id = $_POST['product_id'];
    $new_stock = $_POST['new_stock'];
    
    $stmt = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
    if ($stmt->execute([$new_stock, $product_id])) {
        $success = "Stock updated successfully!";
    } else {
        $error = "Failed to update stock.";
    }
}

// Handle add product
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_product'])) {
    $name = $_POST['name'];
    $rate = $_POST['rate'];
    $stock = $_POST['stock'];
    $gst_rate = $_POST['gst_rate'] ?? getSetting('default_gst_rate');
    
    $stmt = $pdo->prepare("INSERT INTO products (name, rate, stock, gst_rate) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $rate, $stock, $gst_rate])) {
        $success = "Product added successfully!";
    } else {
        $error = "Failed to add product.";
    }
}

// Get all products
$products = $pdo->query("SELECT * FROM products ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
$default_gst_rate = getSetting('default_gst_rate');
?>

<div class="row">
    <div class="col-md-12">
        <h2 class="mb-4"><i class="fas fa-boxes me-2"></i>Stock Management</h2>
        
        <?php if (isset($success)): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <div class="row">
            <div class="col-md-5">
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Add New Product</h5>
                    </div>
                    <div class="card-body">
                        <form method="post">
                            <div class="mb-3">
                                <label for="name" class="form-label">Product Name</label>
                                <input type="text" class="form-control" id="name" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="rate" class="form-label">Rate (₹)</label>
                                <input type="number" class="form-control" id="rate" name="rate" step="0.01" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="gst_rate" class="form-label">GST Rate (%)</label>
                                <input type="number" class="form-control" id="gst_rate" name="gst_rate" step="0.01" min="0" max="100" value="<?php echo $default_gst_rate; ?>" required>
                            </div>
                            <div class="mb-3">
                                <label for="stock" class="form-label">Initial Stock</label>
                                <input type="number" class="form-control" id="stock" name="stock" min="0" required>
                            </div>
                            <button type="submit" name="add_product" class="btn btn-primary">Add Product</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-md-7">
                <div class="card">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Current Stock</h5>
                    </div>
                    <div class="card-body">
                        <?php if (count($products) > 0): ?>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Rate (₹)</th>
                                            <th>GST %</th>
                                            <th>Current Stock</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($products as $product): ?>
                                        <tr>
                                            <td><?php echo $product['name']; ?></td>
                                            <td>₹<?php echo number_format($product['rate'], 2); ?></td>
                                            <td><?php echo number_format($product['gst_rate'], 2); ?>%</td>
                                            <td>
                                                <form method="post" class="row g-2">
                                                    <div class="col-6">
                                                        <input type="number" class="form-control" name="new_stock" value="<?php echo $product['stock']; ?>" min="0" required>
                                                        <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                                                    </div>
                                                    <div class="col-6">
                                                        <button type="submit" name="update_stock" class="btn btn-sm btn-primary">Update</button>
                                                    </div>
                                                </form>
                                            </td>
                                            <td>
                                                <span class="badge bg-<?php echo $product['stock'] > 10 ? 'success' : ($product['stock'] > 0 ? 'warning' : 'danger'); ?>">
                                                    <?php echo $product['stock'] > 10 ? 'In Stock' : ($product['stock'] > 0 ? 'Low Stock' : 'Out of Stock'); ?>
                                                </span>
                                            </td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php else: ?>
                            <div class="alert alert-info">No products found. Add some products to get started.</div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>