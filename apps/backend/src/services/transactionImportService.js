export class TransactionImportService {
  /**
   * Creates the import service with parser and repository dependencies.
   * @param {import('./excelParserService.js').ExcelParserService} excelParserService
   * @param {import('../repositories/transactionRepository.js').TransactionRepository} transactionRepository
   */
  constructor(excelParserService, transactionRepository) {
    this.excelParserService = excelParserService;
    this.transactionRepository = transactionRepository;
  }

  /**
   * Parses an uploaded XLSX file and persists the imported transactions.
   * @param {Buffer} fileBuffer
   * @returns {Promise<object>}
   */
  async importTransactionsFromXlsx(fileBuffer) {
    const transactions = this.excelParserService.parseTransactionsFromWorkbook(fileBuffer);
    const importedCount = await this.transactionRepository.bulkInsertTransactions(transactions);

    return {
      importedCount,
      skippedCount: transactions.length - importedCount
    };
  }
}
