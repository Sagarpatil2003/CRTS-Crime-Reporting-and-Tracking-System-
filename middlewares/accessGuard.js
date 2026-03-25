const CaseModel = require('../models/case.model');
const ApiError = require('../utils/ApiError');

const accessGuard = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user._id || req.user.id

        const foundCase = await CaseModel.findById(id).lean()
        if (!foundCase || foundCase.isDeleted) {
            throw new ApiError(404, "Case not found.")
        }

        // Role Bypass
        const isStaff = ['ADMIN', 'OFFICER'].includes(req.user.role);
        if (isStaff) return next();

        // Safe Ownership Check
        // We use .map(String) to ensure we are comparing strings to strings
        const reporterIds = (foundCase.reporters || []).map(rid => rid.toString());
        const currentUserId = userId.toString();

        // console.log(`- Access Check ---`);
        // console.log(`Current User: ${currentUserId}`);
        // console.log(`Case Reporters: ${reporterIds}`);

        const isOwner = reporterIds.includes(currentUserId);

        if (!isOwner) {
            // Throwing message helps  debug in Postman
            throw new ApiError(403, "Access Denied: You are not a reporter of this case.");
        }

        req.case = foundCase
        next()
    } catch (error) {
        next(error);
    }
};

module.exports = accessGuard;