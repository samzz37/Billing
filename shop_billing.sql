-- Create Database
CREATE DATABASE IF NOT EXISTS shop_billing;
USE shop_billing;

-- Create Tables
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    gst_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_gstin VARCHAR(15),
    customer_phone VARCHAR(15),
    customer_email VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_type ENUM('percent', 'fixed') DEFAULT 'fixed',
    tax DECIMAL(10,2) DEFAULT 0,
    tax_type ENUM('percent', 'fixed') DEFAULT 'fixed',
    grand_total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS stock_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    change_type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('default_gst_rate', '18'),
('default_discount_type', 'fixed'),
('default_tax_type', 'percent'),
('shop_name', 'Shop Billing System'),
('shop_address', '123 Shop Street, City - 600001'),
('shop_contact', '+91 9876543210'),
('shop_email', 'shop@example.com'),
('shop_gstin', 'GSTIN123456789'),
('default_discount_percent', '5'),
('default_tax_percent', '10')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Insert Sample Products
INSERT INTO products (name, rate, stock, gst_rate) VALUES
('Notebook', 50.00, 100, 5.0),
('Pen', 10.00, 200, 12.0),
('Pencil', 5.00, 150, 12.0),
('Eraser', 3.00, 100, 18.0),
('Sharpener', 8.00, 80, 18.0),
('Stapler', 120.00, 30, 28.0),
('Paper Clip', 2.00, 500, 12.0),
('Highlighter', 25.00, 60, 18.0),
('Ruler', 15.00, 70, 12.0),
('Glue Stick', 20.00, 90, 18.0);

-- Create Indexes
CREATE INDEX idx_bills_date ON bills(bill_date);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_items_product_id ON bill_items(product_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_stock_log_product_id ON stock_log(product_id);
CREATE INDEX idx_stock_log_created_at ON stock_log(created_at);