const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // 1. Handle Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        error.message = `Invalid ${err.path}: ${err.value}`;
        error.statusCode = 400
    }

    // 2. Handle Mongoose Duplicate Key (Error Code 11000)
    if (err.code === 11000) {
        // err.keyValue looks like this: { email: 'test@example.com' }
        const field = Object.keys(err.keyValue)[0];
        const value = Object.values(err.keyValue)[0];

        error.message = `The ${field} '${value}' is already in use. Please use another ${field}!`;
        error.statusCode = 400;
    }

    // 3. Handle Joi / Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(el => el.message);
        error.message = `Invalid input data: ${messages.join('. ')}`;
        error.statusCode = 400;
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

module.exports = globalErrorHandler