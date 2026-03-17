const Joi = require("joi")

const createCaseSchema = Joi.object({
    title: Joi.string()
        .min(10)
        .max(150)
        .required()
        .messages({
            'string.min': 'Title should be descripive (min 10 chars)',
            'any.required': 'Case title is mandatory'
        }),
    description: Joi.string()
        .min(70)
        .required()
        .trim(),

    crimeType: Joi.string()
        .required()
        .lowercase()
        .trim(),

    priority: Joi.string()
        .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        .default('LOW'),

    location: Joi.object({
        // Point in required for MongoDB "2dsphere"
        type: Joi.string().valid('Point').default('Point'),

        // Longitude must be between -180 and 180, Latitude between -90 and 90
        coordinates: Joi.array()
            .items(
                Joi.number().min(-180).max(180), // Longitude
                Joi.number().min(-90).max(90)  // Latitude
            )
            .length(2)
            .optional(),

        address: Joi.string()
            .min(5)
            .required()
            .messages({
                'any.required': 'Physical address is required for dispatching officers'
            })

    }).required(),
    
    // Advance Field: Allows bypassing the duplicate check
    forceCreate: Joi.boolean().default(false),
    isAnonymous: Joi.boolean().default(false),
    evidence: Joi.object({
        evidenceType: Joi.string().valid('IMAGE', 'VIDEO', 'DOCUMENT', 'WITNESS_STATEMENT').required(),
        fileUrl: Joi.string().uri().required(),
        fileMimeType: Joi.string().required(),
        fileSize: Joi.number().required()
    }).optional(),

    metadata: Joi.object().optional()
}).or('location.coordinates', 'location.address')
// The .or() ensures at least one way to find the crime location exists. 


// Updating Case Status

const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('REPORTED', 'UNDER_REVIEW', 'INVESTIGATION', 'HEARING', 'JUDGEMENT', 'CLOSED')
        .required(),
    reason: Joi.string().min(5).max(200).required()
        .messages({
            'any.required': "A reason for the status change must be provided for the audit trail."
        })

})


module.exports = {
    createCaseSchema,
    updateStatusSchema
};   