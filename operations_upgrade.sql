-- Import schema.sql, then marketplace_modules.sql, then this file ONCE.
USE royal_market_place;
ALTER TABLE categories ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_category_parent(parent_id), ADD CONSTRAINT fk_category_parent FOREIGN KEY(parent_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE users MODIFY role ENUM('customer','staff','seller','admin','owner') NOT NULL DEFAULT 'customer';
CREATE TABLE IF NOT EXISTS pos_sales (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 sale_number VARCHAR(50) NOT NULL UNIQUE,
 staff_user_id BIGINT UNSIGNED NOT NULL,
 customer_name VARCHAR(120) NOT NULL DEFAULT 'Walk-in Customer',
 total DECIMAL(12,2) NOT NULL,
 payment_method ENUM('cash','card','bank','wallet') NOT NULL DEFAULT 'cash',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(staff_user_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS pos_sale_items (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 sale_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NULL,
 product_name VARCHAR(180) NOT NULL,
 unit_price DECIMAL(12,2) NOT NULL,
 quantity INT NOT NULL,
 line_total DECIMAL(12,2) NOT NULL,
 FOREIGN KEY(sale_id) REFERENCES pos_sales(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS cash_sessions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 staff_user_id BIGINT UNSIGNED NOT NULL,
 opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
 closing_cash DECIMAL(12,2) NULL,
 opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 closed_at DATETIME NULL,
 status ENUM('open','closed') NOT NULL DEFAULT 'open',
 FOREIGN KEY(staff_user_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ledger_accounts (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 account_code VARCHAR(30) NOT NULL UNIQUE,
 account_name VARCHAR(120) NOT NULL,
 account_type ENUM('asset','liability','equity','income','expense') NOT NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ledger_entries (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 entry_date DATE NOT NULL,
 reference_type VARCHAR(40) NOT NULL,
 reference_id BIGINT UNSIGNED NULL,
 description VARCHAR(500),
 debit_account_id BIGINT UNSIGNED NOT NULL,
 credit_account_id BIGINT UNSIGNED NOT NULL,
 amount DECIMAL(14,2) NOT NULL,
 created_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(debit_account_id) REFERENCES ledger_accounts(id),
 FOREIGN KEY(credit_account_id) REFERENCES ledger_accounts(id),
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
 INDEX idx_ledger_date(entry_date)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS product_import_jobs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NULL,
 file_name VARCHAR(255),
 status ENUM('queued','processing','completed','failed') DEFAULT 'queued',
 rows_total INT DEFAULT 0,
 rows_success INT DEFAULT 0,
 error_report LONGTEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS integration_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 provider VARCHAR(60) NOT NULL,
 event_id VARCHAR(190) NOT NULL,
 event_type VARCHAR(120),
 signature_valid TINYINT(1) NOT NULL DEFAULT 0,
 payload JSON NULL,
 processed_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_provider_event(provider,event_id)
) ENGINE=InnoDB;
INSERT IGNORE INTO ledger_accounts(account_code,account_name,account_type) VALUES
('1000','Cash','asset'),('1100','Bank','asset'),('2000','Payables','liability'),('3000','Owner Equity','equity'),('4000','Sales Revenue','income'),('5000','Operating Expenses','expense'),('5100','Cost of Goods Sold','expense');
CREATE TABLE IF NOT EXISTS auth_attempts (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(190) NOT NULL,
 ip_address VARCHAR(45) NOT NULL,
 success TINYINT(1) NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_auth_attempt(email,ip_address,success,created_at)
) ENGINE=InnoDB;
