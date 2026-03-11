// src/utils/ThesysError.js
// Custom error class for the Thesys SDK

export class ThesysError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {object} [options]
   * @param {number} [options.status]      - HTTP status code (if applicable)
   * @param {string} [options.code]        - Short machine-readable error code
   * @param {unknown} [options.cause]      - Original underlying error
   */
  constructor(message, { status, code, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ThesysError";
    if (status !== undefined) this.status = status;
    if (code !== undefined) this.code = code;
  }
}