import { sendJson } from '../utils/httpResponse.js';

export class DashboardController {
  /**
   * Creates the dashboard controller with a dashboard query service dependency.
   * @param {import('../services/dashboardService.js').DashboardService} dashboardService
   */
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  /**
   * Handles dashboard overview requests.
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<void>}
   */
  async getOverview(request, response) {
    const dashboardOverview = await this.dashboardService.getDashboardOverview();
    sendJson(response, 200, dashboardOverview);
  }
}
