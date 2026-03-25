const catchAsync = require('../../utils/catchAsync')
const ApiResponse = require('../../utils/ApiResponse')
const CaseService = require('../../services/case.service')
const AssignmentService = require('../../services/assignment.service')

exports.getMyCases = catchAsync(async (req, res) => {
    const officerId = req.user.id || req.user._id;
    const result = await CaseService.getOfficerCases(officerId, req.query);

    //  result is an object, check result.cases.length
    const hasCases = result && result.cases && result.cases.length > 0;

    res.status(200).json(
        new ApiResponse(
            200,
            result,
            hasCases ? "Cases retrieved successfully" : "No cases found for your profile"
        )
    );
});

exports.acceptCase = catchAsync(async (req, res) => {
    const { caseId } = req.params;

    const officerId = req.user?._id || req.user?.id;

    if (!officerId) {
        throw new ApiError(401, "Officer ID not found in request. Check Auth Middleware.");
    }

    const updatedCase = await AssignmentService.acceptCaseAssignment(caseId, officerId);

    res.status(200).json(new ApiResponse(200, updatedCase, "Case accepted."));
});