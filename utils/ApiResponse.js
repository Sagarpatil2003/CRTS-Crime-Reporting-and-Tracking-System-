/**
 * @desc API Response Wrapper
 */

class ApiResponse {
   /**
    * @param {number} statusCode - HTTP Status Code (200, 201, etc.) 
    * @param {any} data - The actual payload (User, Case, Array, etc)
    * @param {string} message - A helpful message for the frontend
    */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message 
        this.success = statusCode < 400 // Automatically sets success based on code
    }
}

module.exports = ApiResponse