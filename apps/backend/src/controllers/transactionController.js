import { sendJson } from '../utils/httpResponse.js';

export class TransactionController {
  /**
   * Creates the transaction controller with its reset use case dependency.
   * @param {import('../services/transactionResetService.js').TransactionResetService} transactionResetService
   */
  constructor(transactionResetService) {
    this.transactionResetService = transactionResetService;
  }

  /**
   * Handles requests to clear all stored transactions.
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<void>}
   */
  async deleteTransactions(request, response) {
    const result = await this.transactionResetService.clearImportedTransactions();
    sendJson(response, 200, result);
  }
}
