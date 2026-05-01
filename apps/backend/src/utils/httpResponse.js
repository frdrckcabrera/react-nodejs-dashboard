/**
 * Sends a JSON response with common headers and status handling.
 * @param {import('http').ServerResponse} response
 * @param {number} statusCode
 * @param {object} payload
 * @returns {void}
 */
export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

/**
 * Reads a request stream into a single buffer for upload parsing.
 * @param {import('http').IncomingMessage} request
 * @returns {Promise<Buffer>}
 */
export function readRequestBuffer(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}
