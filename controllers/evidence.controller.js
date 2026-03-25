const evidenceServices = require('../services/evidence.service')
const catchAsync = require("../utils/catchAsync")
const ApiResponse = require('../utils/ApiResponse')



exports.addEvidence = catchAsync(async (req, res) => {
    const evidence = await evidenceServices.addEvidence(
        req.params.id,
        req.user,
        req.body,
        {
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        }
    );

    res.status(201).json(
        new ApiResponse(201, evidence, "Evidence uploaded successfully")
    );
});


exports.deleteEvidence = catchAsync(async (req, res) => {
    const { caseId, evidenceId } = req.params
    await evidenceServices.deleteEvidence(caseId, evidenceId, req.user)
    res.status(200).json(new ApiResponse(200, null, "Evidence deleted successfully"))
})

exports.getEvidence = catchAsync(async (req, res) => {
    const evidence = await evidenceServices.getEvidenceByCaseId(req.params.id, req.user)
    res.status(200).json(new ApiResponse(200, evidence, "Evidence list fetched."))
})

exports.addWitness = catchAsync(async (req, res) => {
    const witness = await evidenceServices.addWitness(
        req.params.id,
        req.user.id,
        req.body,
        {
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        }
    );

    res.status(201).json(new ApiResponse(201, witness, "Witness information added"));
});


exports.getWitness = catchAsync(async (req, res) => {
    const witnesses = await evidenceServices.getWitnessesByCase(req.params.id)
    res.status(200).json(
        new ApiResponse(200, witnesses, "Witnesses retrieved")
    )
})