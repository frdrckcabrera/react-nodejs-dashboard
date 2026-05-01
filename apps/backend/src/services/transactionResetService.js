export class TransactionResetService {
  /**
   * Creates the reset service with its transaction persistence dependency.
   * @param {import('../repositories/transactionRepository.js').TransactionRepository} transactionRepository
   */
  constructor(transactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  /**
   * Removes every imported transaction and returns the number of cleared rows.
   * @returns {Promise<object>}
   */
  async clearImportedTransactions() {
    const deletedCount = await this.transactionRepository.deleteAllTransactions();

    return { deletedCount };
  }
}
