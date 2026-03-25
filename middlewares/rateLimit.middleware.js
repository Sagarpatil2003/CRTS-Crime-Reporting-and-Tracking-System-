const rateLimit = require('express-rate-limit')

const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests. Try again later'
    }
})

module.exports = appLimiter