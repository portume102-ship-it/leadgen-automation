// backend/database/dbErrorHandler.js
const logger = require('../worker/logger');

/**
 * Custom error class representing a database-level error mapped to an HTTP status code
 */
class DatabaseError extends Error {
  /**
   * @param {string} message Error description
   * @param {number} statusCode Suggested HTTP status code
   * @param {string} code Postgres error code
   * @param {string} [detail] Optional error detail
   */
  constructor(message, statusCode, code, detail = '') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.code = code;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Translates PostgreSQL database errors into standardized DatabaseError exceptions
 * @param {Error} error Raw error object
 * @param {string} [context] Context description of where the error occurred
 * @returns {DatabaseError}
 */
function handleDbError(error, context = 'Database Operation') {
  // If already a translated DatabaseError, return it directly
  if (error instanceof DatabaseError) {
    return error;
  }

  const pgCode = error.code;
  const detail = error.detail || '';
  let msg = error.message;
  let status = 500;

  switch (pgCode) {
    case '23505': // Unique Violation
      status = 409;
      msg = `Conflict: A record with this unique constraint already exists. Details: ${detail || error.message}`;
      break;

    case '23503': // Foreign Key Violation
      status = 400;
      msg = `Referential Integrity Error: Referenced record does not exist or is currently linked to other records. Details: ${detail || error.message}`;
      break;

    case '23502': // Not Null Violation
      status = 400;
      msg = `Validation Error: Missing required field. Details: ${error.message}`;
      break;

    case '23514': // Check Constraint Violation
      status = 400;
      msg = `Validation Error: Constraint check failed. Details: ${error.message}`;
      break;

    case '22P02': // Invalid Text Representation (e.g. invalid UUID syntax)
      status = 400;
      msg = `Validation Error: Invalid data format (e.g., malformed UUID or type mismatch). Details: ${error.message}`;
      break;

    case '40001': // Serialization Failure
    case '40P01': // Deadlock Detected
      status = 503;
      msg = `Service Temporary Unavailable: A concurrency collision occurred. Please retry your request.`;
      break;

    default:
      // Keep status as 500
      msg = `Database execution failed: ${error.message}`;
      break;
  }

  logger.error({
    context,
    pgCode,
    detail,
    originalMessage: error.message,
    mappedStatus: status
  }, `[Database Error Handler] Translated error for ${context}: ${msg}`);

  return new DatabaseError(msg, status, pgCode, detail);
}

module.exports = {
  DatabaseError,
  handleDbError
};
