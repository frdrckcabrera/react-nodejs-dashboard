/**
 * Extracts the multipart boundary token from a Content-Type header.
 * @param {string | undefined} contentType
 * @returns {string}
 */
export function getMultipartBoundary(contentType = '') {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!match) {
    throw new Error('Missing multipart boundary.');
  }

  return match[1] || match[2];
}

/**
 * Parses the first uploaded file from a multipart/form-data request body.
 * @param {Buffer} bodyBuffer
 * @param {string} boundary
 * @returns {{ filename: string, content: Buffer }}
 */
export function parseUploadedFile(bodyBuffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from('\r\n\r\n');
  const parts = splitMultipartBody(bodyBuffer, boundaryBuffer);

  for (const part of parts) {
    const separatorIndex = part.indexOf(headerSeparator);

    if (separatorIndex === -1) {
      continue;
    }

    const headers = part.slice(0, separatorIndex).toString('utf8');
    const filenameMatch = headers.match(/filename="([^"]+)"/i);

    if (!filenameMatch) {
      continue;
    }

    const contentStart = separatorIndex + headerSeparator.length;
    const contentEnd = part.length >= 2 && part.at(-2) === 13 && part.at(-1) === 10
      ? part.length - 2
      : part.length;

    return {
      filename: filenameMatch[1],
      content: part.slice(contentStart, contentEnd)
    };
  }

  throw new Error('No uploaded file was found.');
}

/**
 * Splits a multipart request body into raw part buffers.
 * @param {Buffer} bodyBuffer
 * @param {Buffer} boundaryBuffer
 * @returns {Array<Buffer>}
 */
export function splitMultipartBody(bodyBuffer, boundaryBuffer) {
  const parts = [];
  let searchStart = 0;

  while (searchStart < bodyBuffer.length) {
    const boundaryStart = bodyBuffer.indexOf(boundaryBuffer, searchStart);

    if (boundaryStart === -1) {
      break;
    }

    const partStart = boundaryStart + boundaryBuffer.length + 2;
    const nextBoundaryStart = bodyBuffer.indexOf(boundaryBuffer, partStart);

    if (nextBoundaryStart === -1) {
      break;
    }

    parts.push(bodyBuffer.slice(partStart, nextBoundaryStart - 2));
    searchStart = nextBoundaryStart;
  }

  return parts;
}
