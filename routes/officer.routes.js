const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const { validate } = require('../middlewares/validation.middleware')
const canAccessCase = require('../middlewares/accessGuard')
const EvidenceController = require('../controllers/evidence.controller')
const { evidenceSchema, witnessSchema } = require('../validators/evidence.validator')
const OfficerCaseController = require('../controllers/officer/case.controller')

router.use(auth)

router.patch("/:caseId/accept",
    role("OFFICER"),
    permit("INVESTIGATE_CASE"),
    OfficerCaseController.acceptCase
)


router.get("/cases-list",
    role("OFFICER", "ADMIN"),
    OfficerCaseController.getMyCases
)

module.exports = router