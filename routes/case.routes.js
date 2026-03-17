const express = require('express')
const router = express.Router()
const caseController = require('../controllers/case.controllers')
const { createCaseSchema, updateStatusSchema } = require('../validators/case.validation')
// middlewares
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const { validate } = require('../middlewares/validation.middleware')
const workflow = require('../constants/caseWorkflow')
const checkForDuplicateCase = require('../middlewares/duplicateCheck.middleware')
const detectCluster = require('../middlewares/clusterDetection.middleware')


// All case routes require being logged in
router.use(auth)

router.post('/',
    role("CITIZEN", "OFFICER"),
    permit("REPORT_CASE"),
    validate(createCaseSchema),
    checkForDuplicateCase,
    detectCluster,
    caseController.createCase
)


router.patch("/:id/status",
    role("OFFICER", "JUDGE", "ADMIN"),
    permit("INVESTIGATE_CASE", "FINALIZE_VERDICT"),
    validate(updateStatusSchema),
    caseController.updateStatus
);


module.exports = router
