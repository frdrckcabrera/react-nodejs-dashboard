import { mysqlPool } from '../database/mysqlPool.js';

/**
 * Creates the transactions table when running outside Docker initialization.
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  await mysqlPool.query(`
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
    )
  `);

  await ensureTransactionIdentityIndex();
}

/**
 * Adds the unique import identity index for existing databases.
 * @returns {Promise<void>}
 */
async function ensureTransactionIdentityIndex() {
  await deleteDuplicateTransactions();

  const [rows] = await mysqlPool.query(
    `SELECT COUNT(*) AS indexCount
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'transactions'
       AND index_name = 'uq_transactions_import_identity'`
  );

  if (Number(rows[0].indexCount) > 0) {
    return;
  }

  await mysqlPool.query(`
    ALTER TABLE transactions
      ADD UNIQUE KEY uq_transactions_import_identity (
        transaction_date,
        description,
        category,
        transaction_type,
        amount,
        source
      )
  `);
}

/**
 * Removes duplicate transaction rows before applying the unique index.
 * @returns {Promise<void>}
 */
async function deleteDuplicateTransactions() {
  await mysqlPool.query(`
    DELETE duplicate_transaction
    FROM transactions duplicate_transaction
    INNER JOIN transactions original_transaction
      ON duplicate_transaction.transaction_date = original_transaction.transaction_date
      AND duplicate_transaction.description = original_transaction.description
      AND duplicate_transaction.category = original_transaction.category
      AND duplicate_transaction.transaction_type = original_transaction.transaction_type
      AND duplicate_transaction.amount = original_transaction.amount
      AND duplicate_transaction.source <=> original_transaction.source
      AND duplicate_transaction.id > original_transaction.id
  `);
}

initializeDatabase()
  .then(async () => {
    console.log('Database schema is ready.');
    await mysqlPool.end();
  })
  .catch(async (error) => {
    console.error('Database initialization failed:', error);
    await mysqlPool.end();
    process.exit(1);
  });
