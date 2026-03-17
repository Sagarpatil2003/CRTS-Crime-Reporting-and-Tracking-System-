const mongoose = require('mongoose')

const validateObjectId = (req, res, next) => {

    if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        })
    }
    next()
}

const validate = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
        // 1. Return ALL validation errors found, not just the first one.
        // Great for showing a full list of mistakes to the user at once.
        abortEarly: false,
        // 2. Security: Remove any fields NOT defined in the schema.
        // Prevents "Mass Assignment" attacks (e.g., someone trying to inject 'isAdmin: true').
        stripUnknown: true
    })

    if (error) {
        // Create a custom error object or use your ApiError class
        const errorMessage = error.details.map(e => e.message).join(', ');
        const validationError = new Error(errorMessage);
        validationError.statusCode = 400;

        // Send it to the globalErrorHandler
        return next(validationError);
    }

    req.body = value;
    next();
}

const validateQuery = schema => (req, res, next) => {

    const { value, error } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
    })

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map(e => e.message)
        })
    }

    req.query = value // Overwrite with sanitized query data
    next()
}


module.exports = {
    validateObjectId,
    validate,
    validateQuery
}
