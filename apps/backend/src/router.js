import { sendJson } from './utils/httpResponse.js';

export class Router {
  /**
   * Creates a minimal route registry for the Node HTTP server.
   */
  constructor() {
    this.routes = new Map();
  }

  /**
   * Registers a method and path pair with its request handler.
   * @param {string} method
   * @param {string} path
   * @param {Function} handler
   * @returns {void}
   */
  register(method, path, handler) {
    this.routes.set(`${method.toUpperCase()} ${path}`, handler);
  }

  /**
   * Finds and executes the matching handler for an incoming request.
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @returns {Promise<void>}
   */
  async handle(request, response) {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`);
    const routeKey = `${request.method} ${requestUrl.pathname}`;
    const handler = this.routes.get(routeKey);

    if (!handler) {
      sendJson(response, 404, { message: 'Route not found.' });
      return;
    }

    await handler(request, response);
  }
}
