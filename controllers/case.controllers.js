const catchAsync = require('../utils/catchAsync')
const caseService = require('../services/case.service')
const ApiResponse = require('../utils/ApiResponse');
const UserModel = require('../models/user.model');

exports.createCase = catchAsync(async (req, res) => {
    const { evidence, ...caseData } = req.body;

    if (req.isDuplicate) {
        const mergedCase = await caseService.mergeToExistingCase(
            req.duplicateCaseId,
            evidence,
            req.user
        );
        return res.status(200).json(
            new ApiResponse(200, mergedCase, "Incident report linked to existing active case.")
        );
    }
   
    const newCase = await caseService.createCase(caseData, evidence, req.user);

    res.status(201).json(
        new ApiResponse(201, newCase, "Case and initial evidence registered.")
    );
});


exports.updateOfficerLocation = catchAsync(async (req, res) => {
    const { lat, lng } = req.body
    if (!lat || !lng) {
        throw new ApiError(400, "Invalid location coordinates");
    }
    await UserModel.findByIdAndUpdate(req.user.id, {
        currentLocation: {
            type: "Point",
            coordinates: [lng, lat]
        }
    })

    res.status(200).json({
        success: true,
        message: "Location updated"
    })
})

exports.updateStatus = catchAsync(async(req, res) => {
    const {status, reason} = req.body

    // Pass the reason to the service so it can be saved in the Case History
    const updatedCase = await caseService.updateStatus(
        req.params.id,
        status,
        reason,
        req.user
    )

    res.status(200).json(new ApiResponse(200, updatedCase, `Case status updated to ${status}`))
})