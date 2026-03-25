const express = require('express')
const router = express.Router()
const caseController = require('../controllers/case.controllers')
const OfficerCaseController = require('../controllers/officer/case.controller')
const { createCaseSchema, updateStatusSchema , nearbyCasesSchema } = require('../validators/case.validator')

// Middlewares
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const { validate } = require('../middlewares/validation.middleware')
const checkForDuplicateCase = require('../middlewares/duplicateCheck.middleware')
const accessGuard = require('../middlewares/accessGuard')


/**
 * @route   GET /cases/nearBycases
 * @desc    Public news feed/map of nearby incidents
 */
router.get('/nearBycases', validate(nearbyCasesSchema), caseController.getNearbyCases)


router.use(auth) 

/**
 * @route   GET /cases/my-cases
 * @desc    Fetch list for the logged-in user (Moved up to avoid :id conflict)
 */
router.get('/my-cases', caseController.getMyCase)

/**
 * @route   POST /cases
 * @desc    File a new report (Triggers CASE_REPORTED log)
 */
router.post('/',
    role("CITIZEN","ADMIN"),
    permit("REPORT_CASE"),
    validate(createCaseSchema),
    checkForDuplicateCase, 
    caseController.createCase
)

/**
 * @route   GET /cases/:id/logs
 * @desc    Fetch the Audit Log Timeline
 */
router.get("/:id/logs",
    role("CITIZEN", "OFFICER", "ADMIN", "LAWYER", "JUDGE"), 
    permit("VIEW_CASE_LOGS"),
    caseController.getCaseTimeline
)

/**
 * @route   PATCH /cases/:id/status
 * @desc    Strict workflow status change (Triggers STATUS_CHANGE log)
 */
router.patch("/:id/status",
    role("OFFICER", "JUDGE", "ADMIN"),
    permit("UPDATE_CASE_STATUS"),
    validate(updateStatusSchema),
    // validateWorkflow, 
    caseController.updateStatus
)

/**
 * @route   GET /cases/:id
 * @desc    Specific details
 */
router.get("/:id", 
    accessGuard, 
    caseController.getCaseDetails
)

// ACCEPT THE CASE



module.exports = router

