const catchAsync = require("../../utils/catchAsync")
const adminService = require('../../services/admin.service')
const ApiResponse = require('../../utils/ApiResponse')

exports.assignCaseManually = catchAsync(async (req, res) => {
    const { id } = req.params; 
    const { badgeNumber } = req.body;

    // 🚩 Debug: Ensure Admin is logged in
    if (!req.user) {
        throw new ApiError(401, "Admin authentication failed");
    }

    const reqContext = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        source: "ADMIN_PANEL"
    };

    const result = await adminService.manualAssignOfficer(
        id,
        badgeNumber,
        req.user, // Ensure this is the full user object from your auth middleware
        reqContext
    );
  
    res.status(200).json(
        new ApiResponse(200, result, `Case successfully assigned to Badge: ${badgeNumber}`)
    );
});