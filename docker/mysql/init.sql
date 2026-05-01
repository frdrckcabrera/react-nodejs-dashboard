CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL,
  transaction_type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  source VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_transactions_date (transaction_date),
  INDEX idx_transactions_type (transaction_type),
  INDEX idx_transactions_category (category),
  UNIQUE KEY uq_transactions_import_identity (
    transaction_date,
    description,
    category,
    transaction_type,
    amount,
    source
  )
);
