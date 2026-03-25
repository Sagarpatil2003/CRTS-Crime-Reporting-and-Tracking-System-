const workflowConfig = require('../constants/caseWorkflow');
const CaseModel = require('../models/case.model');
const ApiError = require('../utils/ApiError');

const validateWorkflow = async (req, res, next) => {
    try {
        const { status: newStatus } = req.body
        const userRole = req.user.role

        // Fetch current case to know its current status
        const currentCase = await CaseModel.findById(req.params.id)
        if (!currentCase) throw new ApiError(404, "Case not found")

        const currentStatus = currentCase.status;
        const config = workflowConfig[currentStatus]

        //Check if the transition is allowed
        if (!config.next.includes(newStatus)) {
            throw new ApiError(400, `Invalid transition: Cannot move from ${currentStatus} to ${newStatus}`)
        }

        // Check if the user's role is allowed to trigger THIS specific target status
        const targetConfig = workflowConfig[newStatus]

        //We usually check if the role is allowed to move TO the next state
        if (!targetConfig.allowedRoles.includes(userRole)) {
            throw new ApiError(403, `Your role (${userRole}) is not authorized to move a case to ${newStatus}`)
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validateWorkflow;