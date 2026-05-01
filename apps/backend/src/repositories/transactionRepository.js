export class TransactionRepository {
  /**
   * Creates a repository that owns every transaction persistence query.
   * @param {import('mysql2/promise').Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Inserts multiple normalized transactions in a single database operation.
   * @param {Array<object>} transactions
   * @returns {Promise<number>}
   */
  async bulkInsertTransactions(transactions) {
    if (transactions.length === 0) {
      return 0;
    }

    const values = transactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.amount,
      transaction.source
    ]);

    const [result] = await this.pool.query(
      `INSERT INTO transactions
        (transaction_date, description, category, transaction_type, amount, source)
       VALUES ?`,
      [values]
    );

    return result.affectedRows;
  }

  /**
   * Reads the most recent transactions for dashboard tables and auditability.
   * @param {number} limit
   * @returns {Promise<Array<object>>}
   */
  async findRecentTransactions(limit = 10) {
    const [rows] = await this.pool.query(
      `SELECT
        id,
        DATE_FORMAT(transaction_date, '%Y-%m-%d') AS date,
        description,
        category,
        transaction_type AS type,
        amount,
        source
       FROM transactions
       ORDER BY transaction_date DESC, id DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(this.toDashboardTransaction);
  }

  /**
   * Aggregates income and expenses into one high-level summary row.
   * @returns {Promise<object>}
   */
  async getFinancialSummary() {
    const [rows] = await this.pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COUNT(*) AS transactionCount
       FROM transactions`
    );

    const summary = rows[0];
    return {
      totalIncome: Number(summary.totalIncome),
      totalExpenses: Number(summary.totalExpenses),
      netSavings: Number(summary.totalIncome) - Number(summary.totalExpenses),
      transactionCount: Number(summary.transactionCount)
    };
  }

  /**
   * Groups expenses by category for pie and bar chart visualizations.
   * @returns {Promise<Array<object>>}
   */
  async getExpensesByCategory() {
    const [rows] = await this.pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS amount
       FROM transactions
       WHERE transaction_type = 'expense'
       GROUP BY category
       ORDER BY amount DESC`
    );

    return rows.map((row) => ({
      category: row.category,
      amount: Number(row.amount)
    }));
  }

  /**
   * Groups income and expenses by month for trend chart visualizations.
   * @returns {Promise<Array<object>>}
   */
  async getMonthlyCashFlow() {
    const [rows] = await this.pool.query(
      `SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
       FROM transactions
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month`
    );

    return rows.map((row) => ({
      month: row.month,
      income: Number(row.income),
      expenses: Number(row.expenses),
      savings: Number(row.income) - Number(row.expenses)
    }));
  }

  /**
   * Converts raw MySQL values into API-friendly transaction objects.
   * @param {object} row
   * @returns {object}
   */
  toDashboardTransaction(row) {
    return {
      id: row.id,
      date: row.date,
      description: row.description,
      category: row.category,
      type: row.type,
      amount: Number(row.amount),
      source: row.source
    };
  }
}
