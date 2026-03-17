

class ApiError extends Error {
    constructor(statusCode, message) {
       super(message) //This tells the built-in Error class to handle the message
       this.statusCode = statusCode // this stores our custom code
       
       // This line makes sure we can exactly where the error happened in our code
       Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ApiError