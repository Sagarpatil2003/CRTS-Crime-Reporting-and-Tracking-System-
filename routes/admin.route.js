const express = require('express')
const router = express.Router()

const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const AdminController = require("../controllers/admin/case.controller")
const auth = require('../middlewares/auth.middleware')

router.use(auth) 

router.patch("/cases/:id/assign", 
    role("ADMIN"), 
    permit("MANAGE_ASSIGNMENTS"), 
    AdminController.assignCaseManually
)

module.exports = router