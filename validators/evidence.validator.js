const Joi = require("joi")

exports.evidenceSchema = Joi.object({
  evidenceType: Joi.string()
    .valid("IMAGE", "VIDEO", "DOCUMENT")
    .required(),

  fileUrl: Joi.string()
    .uri()
    .required(),

  fileMimeType: Joi.string()
    .valid(
      "image/jpeg",
      "image/png",
      "video/mp4",
      "application/pdf"
    )
    .required(),

  fileSize: Joi.number()
    .max(5 * 1024 * 1024)
    .required()
})

exports.witnessSchema = Joi.object({
  name: Joi.string().min(3).required(),
  contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  statement: Joi.string().min(10).required(),
  address: Joi.string().optional()
});