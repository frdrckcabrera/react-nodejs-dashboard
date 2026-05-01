import { getMultipartBoundary, parseUploadedFile } from '../utils/multipartParser.js';
import { readRequestBuffer, sendJson } from '../utils/httpResponse.js';

export class UploadController {
  /**
   * Creates the upload controller with an import use case dependency.
   * @param {import('../services/transactionImportService.js').TransactionImportService} transactionImportService
   */
  constructor(transactionImportService) {
    this.transactionImportService = transactionImportService;
  }

  /**
   * Handles XLSX upload requests and returns an import summary.
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<void>}
   */
  async importTransactions(request, response) {
    try {
      const boundary = getMultipartBoundary(request.headers['content-type']);
      const bodyBuffer = await readRequestBuffer(request);
      const uploadedFile = parseUploadedFile(bodyBuffer, boundary);

      if (!uploadedFile.filename.toLowerCase().endsWith('.xlsx')) {
        sendJson(response, 400, { message: 'Only .xlsx files are supported.' });
        return;
      }

      const result = await this.transactionImportService.importTransactionsFromXlsx(uploadedFile.content);
      sendJson(response, 201, result);
    } catch (error) {
      sendJson(response, 400, { message: error.message || 'Unable to import the workbook.' });
    }
  }
}
