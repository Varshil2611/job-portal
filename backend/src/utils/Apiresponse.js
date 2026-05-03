/**
 * Consistent API response shape for ALL successful responses.
 * Every controller should use this so Angular can rely
 * on a predictable { success, statusCode, message, data } structure.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
  }
}

export default ApiResponse;