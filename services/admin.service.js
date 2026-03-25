const CaseModel = require('../models/case.model')
const UserModel = require('../models/user.model')
const auditService = require('../services/auditService')
const ApiError = require('../utils/ApiError')

exports.manualAssignOfficer = async (caseId, badgeNumber, adminUser, reqContext) => {
    // 1. Fetch case by ID and officer by Badge Number
    const [caseDoc, officer] = await Promise.all([
        CaseModel.findById(caseId),
        UserModel.findOne({ badgeNumber: badgeNumber, role: 'OFFICER' })
    ]);
    // console.log(officer)
    if (!caseDoc) throw new ApiError(404, "Case not found");
    if (!officer) throw new ApiError(404, `Officer with badge ${badgeNumber} not found`);

    // Snapshot for Audit Log
    const beforeState = {
        assignedOfficer: caseDoc.assignedOfficer,
        status: caseDoc.status
    };

    // 2. Perform the assignment using the officer's real _id
    caseDoc.assignedOfficer = officer._id;
    caseDoc.status = "ASSIGNED";
    caseDoc.assignedAt = new Date();

    caseDoc.history.push({
        status: "ASSIGNED",
        reason: `Manually assigned by Admin (${adminUser.name}) to Badge ${badgeNumber}`,
        changedBy: adminUser._id,
        timestamp: new Date()
    });

    const updatedCase = await caseDoc.save();
    console.log(officer._id)
    // 3. Record Audit Log
    await auditService.recordLog({
        user: adminUser.id, // 🚩 FIX: Extract the _id property
        action: "ADMIN_MANUAL_ASSIGNMENT",
        entityId: caseId,
        before: beforeState,
        after: { assignedOfficer: officer._id, badge: badgeNumber, status: "ASSIGNED" },
        context: reqContext
    });

    return updatedCase;
};

