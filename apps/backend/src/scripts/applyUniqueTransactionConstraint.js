import { mysqlPool } from '../database/mysqlPool.js';

/**
 * Applies the unique transaction identity constraint to an existing database.
 * @returns {Promise<void>}
 */
async function applyUniqueTransactionConstraint() {
  await deleteDuplicateTransactions();

  if (await hasUniqueTransactionIdentityIndex()) {
    console.log('Unique transaction identity constraint already exists.');
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

  console.log('Unique transaction identity constraint applied.');
}

/**
 * Checks whether the unique transaction identity index already exists.
 * @returns {Promise<boolean>}
 */
async function hasUniqueTransactionIdentityIndex() {
  const [rows] = await mysqlPool.query(
    `SELECT COUNT(*) AS indexCount
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'transactions'
       AND index_name = 'uq_transactions_import_identity'`
  );

  return Number(rows[0].indexCount) > 0;
}

/**
 * Deletes duplicate rows while preserving the earliest imported copy.
 * @returns {Promise<void>}
 */
async function deleteDuplicateTransactions() {
  const [result] = await mysqlPool.query(`
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

  console.log(`Removed ${result.affectedRows} duplicate transaction rows.`);
}

applyUniqueTransactionConstraint()
  .then(async () => {
    await mysqlPool.end();
  })
  .catch(async (error) => {
    console.error('Unable to apply unique transaction constraint:', error);
    await mysqlPool.end();
    process.exit(1);
  });
