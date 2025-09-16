<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Billing System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .navbar-nav .nav-link.active {
            font-weight: bold;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 0.25rem;
        }
    </style>
</head>
<body>
    <?php
    // Determine base path for navigation
    $current_dir = basename(dirname($_SERVER['PHP_SELF']));
    $base_path = ($current_dir === 'modules') ? '../' : '';
    ?>
    
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="<?php echo $base_path; ?>index.php">
                <i class="fas fa-cash-register me-2"></i>சிவபாரதி டிரேடர்ஸ்
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'index.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>index.php">
                            <i class="fas fa-home me-1"></i> Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'billing.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>modules/billing.php">
                            <i class="fas fa-receipt me-1"></i> Billing
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'sales_history.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>modules/sales_history.php">
                            <i class="fas fa-history me-1"></i> Sales History
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'stock_management.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>modules/stock_management.php">
                            <i class="fas fa-boxes me-1"></i> Stock Management
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'reports.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>modules/reports.php">
                            <i class="fas fa-chart-bar me-1"></i> Reports
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'settings.php' ? 'active' : ''; ?>" href="<?php echo $base_path; ?>modules/settings.php">
                            <i class="fas fa-cog me-1"></i> Settings
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container mt-4">
        <!-- Back Button - Only show on module pages, not on index.php -->
        <?php 
        $current_page = basename($_SERVER['PHP_SELF']);
        if ($current_page !== 'index.php'): 
        ?>
        <div class="mb-3">
            <button onclick="goBack()" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Back
            </button>
        </div>
        <?php endif; ?>