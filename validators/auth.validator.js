const joi = require('joi')

const  registerSchema = joi.object({
    name: joi.string().min(2).max(50).required().trim(),
    email: joi.string().email().required().lowercase(),
    password: joi.string().min(6).required(),
    role: joi.string().valid("CITIZEN", "OFFICER", "LAWYER", "JUDGE", "ADMIN").default("CITIZEN"),
    
    location: joi.object({
        coordinates: joi.array().items(joi.number()).length(2).required()
    }).optional(),
    
    badgeNumber: joi.string().when('role', {
        is: 'OFFICER',
        then: joi.required(),
        otherwise: joi.optional()
    })
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

module.exports = {
    registerSchema,
    loginSchema
}