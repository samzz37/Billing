<?php
require_once '../config/database.php';
require_once '../includes/functions.php';
require_once '../includes/header.php';

$message = '';
$message_type = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        foreach ($_POST as $key => $value) {
            if (strpos($key, 'setting_') === 0) {
                $setting_key = substr($key, 8);
                updateSetting($setting_key, $value);
            }
        }
        $message = 'Settings updated successfully!';
        $message_type = 'success';
    } catch (Exception $e) {
        $message = 'Error updating settings: ' . $e->getMessage();
        $message_type = 'danger';
    }
}

// Get all settings
$settings = $pdo->query("SELECT * FROM settings ORDER BY setting_key")->fetchAll(PDO::FETCH_ASSOC);
$settings_map = [];
foreach ($settings as $setting) {
    $settings_map[$setting['setting_key']] = $setting['setting_value'];
}
?>

<div class="row">
    <div class="col-md-12">
        <h2 class="mb-4"><i class="fas fa-cog me-2"></i>System Settings</h2>
        
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $message_type; ?>"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <form method="post">
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">GST, Tax & Discount Settings</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="setting_default_gst_rate" class="form-label">Default GST Rate (%)</label>
                            <input type="number" class="form-control" id="setting_default_gst_rate" 
                                   name="setting_default_gst_rate" value="<?php echo $settings_map['default_gst_rate']; ?>" 
                                   step="0.01" min="0" max="100" required>
                        </div>
                        <div class="col-md-4">
                            <label for="setting_default_discount_percent" class="form-label">Default Discount (%)</label>
                            <input type="number" class="form-control" id="setting_default_discount_percent" 
                                   name="setting_default_discount_percent" value="<?php echo $settings_map['default_discount_percent']; ?>" 
                                   step="0.01" min="0" max="100" required>
                        </div>
                        <div class="col-md-4">
                            <label for="setting_default_tax_percent" class="form-label">Default Tax (%)</label>
                            <input type="number" class="form-control" id="setting_default_tax_percent" 
                                   name="setting_default_tax_percent" value="<?php echo $settings_map['default_tax_percent']; ?>" 
                                   step="0.01" min="0" max="100" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="setting_default_discount_type" class="form-label">Default Discount Type</label>
                            <select class="form-select" id="setting_default_discount_type" name="setting_default_discount_type">
                                <option value="percent" <?php echo $settings_map['default_discount_type'] == 'percent' ? 'selected' : ''; ?>>Percentage</option>
                                <option value="fixed" <?php echo $settings_map['default_discount_type'] == 'fixed' ? 'selected' : ''; ?>>Fixed Amount</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="setting_default_tax_type" class="form-label">Default Tax Type</label>
                            <select class="form-select" id="setting_default_tax_type" name="setting_default_tax_type">
                                <option value="percent" <?php echo $settings_map['default_tax_type'] == 'percent' ? 'selected' : ''; ?>>Percentage</option>
                                <option value="fixed" <?php echo $settings_map['default_tax_type'] == 'fixed' ? 'selected' : ''; ?>>Fixed Amount</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="setting_shop_gstin" class="form-label">Shop GSTIN</label>
                            <input type="text" class="form-control" id="setting_shop_gstin" 
                                   name="setting_shop_gstin" value="<?php echo $settings_map['shop_gstin']; ?>" 
                                   pattern="[A-Z0-9]{15}" title="15 character GSTIN format">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">Shop Information</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="setting_shop_name" class="form-label">Shop Name</label>
                            <input type="text" class="form-control" id="setting_shop_name" 
                                   name="setting_shop_name" value="<?php echo $settings_map['shop_name']; ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label for="setting_shop_contact" class="form-label">Contact Number</label>
                            <input type="text" class="form-control" id="setting_shop_contact" 
                                   name="setting_shop_contact" value="<?php echo $settings_map['shop_contact']; ?>" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="setting_shop_email" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="setting_shop_email" 
                                   name="setting_shop_email" value="<?php echo $settings_map['shop_email']; ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label for="setting_shop_address" class="form-label">Shop Address</label>
                            <textarea class="form-control" id="setting_shop_address" 
                                      name="setting_shop_address" rows="2" required><?php echo $settings_map['shop_address']; ?></textarea>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center">
                <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-save me-1"></i>Save Settings</button>
            </div>
        </form>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>