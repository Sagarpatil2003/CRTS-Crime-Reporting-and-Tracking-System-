const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const { validate } = require('../middlewares/validation.middleware')
const canAccessCase = require('../middlewares/accessGuard')
const EvidenceController = require('../controllers/evidence.controller')
const { evidenceSchema, witnessSchema } = require('../validators/evidence.validator')

router.use(auth)


router.get("/:id/evidence",
    role("CITIZEN", "OFFICER", "JUDGE", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase,
    EvidenceController.getEvidence
)

router.post("/:id/evidence",
    role("CITIZEN", "ADMIN","OFFICER"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase,
    validate(evidenceSchema),
    EvidenceController.addEvidence
)


// CREATE witness
router.post("/:id/witness",
    role("CITIZEN", "OFFICER", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase,
    validate(witnessSchema),
    EvidenceController.addWitness
)

// GET witnesses
router.get("/:id/witness",
    role("CITIZEN","OFFICER", "JUDGE", "ADMIN"),
    permit("INVESTIGATE_CASE"),
    canAccessCase,
    EvidenceController.getWitness
)


// OFFICER
router.delete("/:caseId/evidence/:evidenceId",
    role("CITIZEN", "OFFICER", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    EvidenceController.deleteEvidence
);
module.exports = router

