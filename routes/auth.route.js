const express = require('express')
const { validate } = require('../middlewares/validation.middleware')
const { registerSchema, loginSchema } = require('../validators/auth.validator')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
let router = express.Router()


router.post("/register", validate(registerSchema), authController.register)

router.post("/login", validate(loginSchema), authController.login)

router.post("/logout",authMiddleware, authController.logout)

router.post("/refresh-token", authController.refreshAccessToken)


module.exports = router