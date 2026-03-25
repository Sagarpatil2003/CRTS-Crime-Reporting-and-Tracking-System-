const catchAsync = require("../../utils/catchAsync")
const adminService = require('../../services/admin.service')
const ApiResponse = require('../../utils/ApiResponse')

exports.assignCaseManually = catchAsync(async(req, res) => {
    const { id } = req.params; // Case Id
    const { badgeNumber } = req.body; // We use Badge Number for the lookup

    const reqContext = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        source: "ADMIN_PANEL"
    };

    
    const result = await adminService.manualAssignOfficer(
        id,
        badgeNumber,
        req.user,
        reqContext
    );
  
    res.status(200).json(
        new ApiResponse(200, result, `Case successfully assigned to Badge: ${badgeNumber}`)
    );
});