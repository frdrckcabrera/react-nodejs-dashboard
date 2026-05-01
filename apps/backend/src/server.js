import http from 'http';
import { serverConfig } from './config/database.js';
import { mysqlPool, verifyDatabaseConnection } from './database/mysqlPool.js';
import { DashboardController } from './controllers/dashboardController.js';
import { UploadController } from './controllers/uploadController.js';
import { Router } from './router.js';
import { DashboardService } from './services/dashboardService.js';
import { ExcelParserService } from './services/excelParserService.js';
import { TransactionImportService } from './services/transactionImportService.js';
import { TransactionRepository } from './repositories/transactionRepository.js';
import { sendJson } from './utils/httpResponse.js';

const transactionRepository = new TransactionRepository(mysqlPool);
const dashboardService = new DashboardService(transactionRepository);
const excelParserService = new ExcelParserService();
const transactionImportService = new TransactionImportService(excelParserService, transactionRepository);
const dashboardController = new DashboardController(dashboardService);
const uploadController = new UploadController(transactionImportService);
const router = new Router();

router.register('GET', '/api/dashboard', dashboardController.getOverview.bind(dashboardController));
router.register('POST', '/api/import', uploadController.importTransactions.bind(uploadController));

/**
 * Applies CORS headers required by the Vite development frontend.
 * @param {import('http').ServerResponse} response
 * @returns {void}
 */
function applyCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', serverConfig.corsOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handles one HTTP request with CORS, routing, and error translation.
 * @param {import('http').IncomingMessage} request
 * @param {import('http').ServerResponse} response
 * @returns {Promise<void>}
 */
async function handleRequest(request, response) {
  applyCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    await router.handle(request, response);
  } catch (error) {
    sendJson(response, 500, { message: error.message || 'Unexpected server error.' });
  }
}

/**
 * Verifies dependencies and starts the HTTP API server.
 * @returns {Promise<void>}
 */
async function startServer() {
  await verifyDatabaseConnection();

  http.createServer(handleRequest).listen(serverConfig.port, () => {
    console.log(`Expenses dashboard API listening on http://localhost:${serverConfig.port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start the API server:', error);
  process.exit(1);
});
