const CaseModel = require('../models/case.model');
const UserModel = require('../models/user.model');
const ApiError = require('../utils/ApiError')
const auditService = require('../services/auditService')

exports.assignOfficerToCase = async (caseId, coordinates) => {
    const candidates = await UserModel.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: coordinates },
                distanceField: "distance",
                key: "location",
                query: {
                    role: "OFFICER",
                    availabilityStatus: "AVAILABLE",
                    accountStatus: "ACTIVE"
                },
                spherical: true
            }
        },
        { $limit: 6 },
        {
            $lookup: {
                from: "cases",
                let: { off_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$assignedOfficer", "$$off_id"] },
                                    { $in: ["$status", ["ASSIGNED", "UNDER_REVIEW", "INVESTIGATION"]] }
                                ]
                            }
                        }
                    }
                ],
                as: "activeCases"
            }
        },
        { $addFields: { caseLoad: { $size: "$activeCases" } } },
        { $sort: { caseLoad: 1, distance: 1 } },
        { $limit: 1 }
    ]);
    // console.log("👮 Candidates found:", JSON.stringify(candidates, null, 2));
    if (!candidates || candidates.length === 0) {
        console.log("⚠️ No officer found matching criteria.");
        return null;
    }

    const officer = candidates[0];

    // This is the part that actually updates the database
    return await CaseModel.findByIdAndUpdate(caseId, {
        assignedOfficer: officer._id,
        status: "ASSIGNED",
        assignedAt: new Date(),
        $push: {
            history: {
                status: "ASSIGNED",
                reason: `System auto-assigned to ${officer.name}.`,
                timestamp: new Date()
            }
        }
    }, { new: true });
};


exports.processExpiredAssignments = async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const expiredCases = await CaseModel.find({
        status: "ASSIGNED",
        assignedAt: { $lt: oneHourAgo }
    });

    for (const caseDoc of expiredCases) {
        const failedOfficerId = caseDoc.assignedOfficer;

        await CaseModel.findByIdAndUpdate(caseDoc._id, {
            assignedOfficer: null,
            assignedAt: null,
            status: "REPORTED",
            $push: {
                history: {
                    status: "REPORTED", // Move back to pool
                    reason: "Officer failed to acknowledge within 60 minutes. Re-routing.",
                    changedBy: failedOfficerId
                }
            }
        });

        // Auto-retry assignment
        await this.assignOfficerToCase(caseDoc._id, caseDoc.location.coordinates);
    }
};



exports.acceptCaseAssignment = async (caseId, officerId, reqContext = {}) => {
    // 1. Fetch the case with the "Before" state
    const caseDoc = await CaseModel.findOne({
        _id: caseId,
        assignedOfficer: officerId.toString(),
        status: "ASSIGNED"
    });

    if (!caseDoc) {
        throw new ApiError(400, "Case is no longer available or already accepted.");
    }

    // 🚩 Capture "Before" snapshot (Convert to JSON to avoid Mongoose internal props)
    const beforeState = {
        status: caseDoc.status,
        acceptedAt: caseDoc.acceptedAt
    };

    // 2. Perform the update
    caseDoc.status = "UNDER_REVIEW";
    caseDoc.acceptedAt = new Date();

    caseDoc.history.push({
        status: "UNDER_REVIEW",
        reason: "Officer accepted the assignment.",
        changedBy: officerId,
        timestamp: new Date()
    });

    const updatedCase = await caseDoc.save();

    // 🚩 Define "After" state
    const afterState = {
        status: updatedCase.status,
        acceptedAt: updatedCase.acceptedAt
    };

    // 3. Create the Audit Log entry
    await auditService.recordLog({
        user: officerId,
        action: "CASE_ACCEPTED_BY_OFFICER",
        entityType: "Case",
        entityId: caseId,
        changes: {
            before: beforeState,
            after: afterState,
            diff: {
                status: { from: beforeState.status, to: afterState.status }
            }
        },
        context: {
            ip: reqContext.ip || 'Unknown',
            userAgent: reqContext.userAgent || 'System/API'
        }
    });

    return updatedCase;
};