// src/utils/ThesysError.js
// Custom error class for the Thesys SDK

/**
 * Custom error class for errors thrown by the Thesys SDK.
 */
export class ThesysError extends Error {
  public status?: number;
  public code?: string;

  /**
   * @param message - Human-readable error description
   * @param options - Additional error details
   */
  constructor(message: string, options: { status?: number; code?: string; cause?: unknown } = {}) {
    const { status, code, cause } = options;
    super(message, cause ? { cause } : undefined);
    this.name = "ThesysError";
    if (status !== undefined) this.status = status;
    if (code !== undefined) this.code = code;
  }
}