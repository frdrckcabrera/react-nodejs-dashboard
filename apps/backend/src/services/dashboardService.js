export class DashboardService {
  /**
   * Creates the dashboard service with its read-only transaction dependency.
   * @param {import('../repositories/transactionRepository.js').TransactionRepository} transactionRepository
   */
  constructor(transactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  /**
   * Loads every aggregate required by the dashboard page.
   * @returns {Promise<object>}
   */
  async getDashboardOverview() {
    const [summary, expensesByCategory, monthlyCashFlow, recentTransactions] = await Promise.all([
      this.transactionRepository.getFinancialSummary(),
      this.transactionRepository.getExpensesByCategory(),
      this.transactionRepository.getMonthlyCashFlow(),
      this.transactionRepository.findRecentTransactions(12)
    ]);

    return {
      summary,
      expensesByCategory,
      monthlyCashFlow,
      recentTransactions
    };
  }
}
