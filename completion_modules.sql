-- Royal Market Place: additional data layer for advanced workflows.
-- Import AFTER schema.sql, marketplace_modules.sql, operations_upgrade.sql,
-- and advanced_modules.sql. These tables are foundations, not live provider integrations.

CREATE TABLE IF NOT EXISTS payment_attempts (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id BIGINT UNSIGNED NOT NULL,
 provider VARCHAR(50) NOT NULL, merchant_reference VARCHAR(120) NOT NULL UNIQUE,
 provider_reference VARCHAR(190) NULL, amount DECIMAL(14,2) NOT NULL,
 currency CHAR(3) NOT NULL DEFAULT 'PKR', status ENUM('created','pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'created',
 request_hash CHAR(64) NULL, response_summary JSON NULL, verified_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE, INDEX(status,created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courier_services (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, provider_key VARCHAR(60) NOT NULL UNIQUE,
 display_name VARCHAR(120) NOT NULL, enabled TINYINT(1) NOT NULL DEFAULT 0,
 config_secret_ref VARCHAR(190) NULL, sandbox_mode TINYINT(1) NOT NULL DEFAULT 1,
 last_health_check DATETIME NULL, health_status VARCHAR(30) NOT NULL DEFAULT 'not_configured'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courier_tracking_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, shipment_id BIGINT UNSIGNED NOT NULL,
 provider_event_id VARCHAR(190) NULL, event_code VARCHAR(80), event_text VARCHAR(500),
 event_at DATETIME NULL, raw_payload JSON NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_courier_event(shipment_id,provider_event_id),
 FOREIGN KEY(shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seller_profiles (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, seller_id BIGINT UNSIGNED NOT NULL UNIQUE,
 legal_name VARCHAR(180), business_phone VARCHAR(30), business_address TEXT,
 tax_number VARCHAR(80), identity_reference VARCHAR(120), verification_status ENUM('not_submitted','pending','verified','rejected') DEFAULT 'not_submitted',
 verification_notes TEXT, submitted_at DATETIME NULL, reviewed_at DATETIME NULL,
 FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seller_commissions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, seller_id BIGINT UNSIGNED NOT NULL,
 order_id BIGINT UNSIGNED NOT NULL, gross_amount DECIMAL(14,2) NOT NULL,
 commission_rate DECIMAL(6,3) NOT NULL, commission_amount DECIMAL(14,2) NOT NULL,
 seller_net_amount DECIMAL(14,2) NOT NULL, status ENUM('pending','approved','paid','reversed') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(seller_id) REFERENCES sellers(id), FOREIGN KEY(order_id) REFERENCES orders(id),
 UNIQUE KEY uq_seller_order(seller_id,order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accounting_journals (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, journal_number VARCHAR(60) NOT NULL UNIQUE,
 source_type VARCHAR(50) NOT NULL, source_id BIGINT UNSIGNED NULL, memo VARCHAR(500),
 journal_date DATE NOT NULL, status ENUM('draft','posted','reversed') DEFAULT 'draft',
 created_by BIGINT UNSIGNED NULL, posted_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL, INDEX(journal_date,status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accounting_journal_lines (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, journal_id BIGINT UNSIGNED NOT NULL,
 account_id BIGINT UNSIGNED NOT NULL, debit DECIMAL(14,2) NOT NULL DEFAULT 0,
 credit DECIMAL(14,2) NOT NULL DEFAULT 0, line_memo VARCHAR(500),
 FOREIGN KEY(journal_id) REFERENCES accounting_journals(id) ON DELETE CASCADE,
 FOREIGN KEY(account_id) REFERENCES ledger_accounts(id), INDEX(account_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tax_rules (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, rule_name VARCHAR(120) NOT NULL,
 tax_type ENUM('inclusive','exclusive') NOT NULL DEFAULT 'exclusive', rate_percent DECIMAL(7,4) NOT NULL,
 applies_to ENUM('products','shipping','both') NOT NULL DEFAULT 'products',
 is_active TINYINT(1) NOT NULL DEFAULT 1, starts_on DATE NULL, ends_on DATE NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_queue (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, channel ENUM('email','sms','whatsapp','in_app') NOT NULL,
 recipient VARCHAR(190) NOT NULL, template_key VARCHAR(80) NULL, payload JSON NULL,
 status ENUM('queued','processing','sent','failed','cancelled') NOT NULL DEFAULT 'queued',
 attempts TINYINT UNSIGNED NOT NULL DEFAULT 0, available_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_error TEXT NULL, sent_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX(status,available_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS backup_runs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, backup_type ENUM('database','files','full') NOT NULL,
 storage_target VARCHAR(40) NOT NULL DEFAULT 'local', file_path VARCHAR(1000) NOT NULL,
 checksum_sha256 CHAR(64) NULL, size_bytes BIGINT UNSIGNED DEFAULT 0,
 status ENUM('started','completed','failed','verified') NOT NULL DEFAULT 'started',
 started_at DATETIME NOT NULL, completed_at DATETIME NULL, error_text TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS import_export_jobs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, job_type ENUM('product_import','product_export','customer_export','order_export') NOT NULL,
 file_name VARCHAR(255), status ENUM('queued','processing','completed','failed') DEFAULT 'queued',
 total_rows INT UNSIGNED DEFAULT 0, success_rows INT UNSIGNED DEFAULT 0, failed_rows INT UNSIGNED DEFAULT 0,
 report_json JSON NULL, created_by BIGINT UNSIGNED NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 completed_at DATETIME NULL, FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_agent_runs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, provider VARCHAR(50) NOT NULL,
 agent_name VARCHAR(100) NOT NULL, task_type VARCHAR(80) NOT NULL,
 input_hash CHAR(64) NULL, status ENUM('pending','needs_approval','completed','failed','rejected') DEFAULT 'pending',
 output_summary TEXT NULL, approved_by BIGINT UNSIGNED NULL, usage_units INT UNSIGNED DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME NULL,
 FOREIGN KEY(approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS security_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL,
 event_type VARCHAR(80) NOT NULL, severity ENUM('info','warning','critical') DEFAULT 'info',
 ip_address VARCHAR(45), user_agent VARCHAR(500), details JSON NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
 INDEX(event_type,created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_devices (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 device_label VARCHAR(160), token_id BIGINT UNSIGNED NULL, last_seen_at DATETIME NULL,
 revoked_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seo_metadata (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, entity_type VARCHAR(40) NOT NULL,
 entity_id BIGINT UNSIGNED NOT NULL, meta_title VARCHAR(180), meta_description VARCHAR(320),
 canonical_url VARCHAR(1000), og_image_url VARCHAR(1000), robots VARCHAR(80) DEFAULT 'index,follow',
 UNIQUE KEY uq_seo_entity(entity_type,entity_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_library (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, file_name VARCHAR(255) NOT NULL,
 storage_path VARCHAR(1000) NOT NULL, mime_type VARCHAR(120), file_size BIGINT UNSIGNED DEFAULT 0,
 alt_text VARCHAR(255), uploaded_by BIGINT UNSIGNED NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS store_domains (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, domain_name VARCHAR(255) NOT NULL UNIQUE,
 is_primary TINYINT(1) DEFAULT 0, ssl_verified TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
