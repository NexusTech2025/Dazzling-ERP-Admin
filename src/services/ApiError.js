/**
 * src/services/api/ApiError.js
 * Custom error class for handling DazzlingDB API exceptions.
 */
export class ApiError extends Error {
  constructor(message, status = null, rawBackendError = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.rawBackendError = rawBackendError;
    
    // Captures the stack trace (V8 engine specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}