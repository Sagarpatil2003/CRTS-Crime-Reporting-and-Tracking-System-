const CaseModel = require('../models/case.model');
const UserModel = require('../models/user.model');
const NotificationModel = require('../models/notification.model');
const EvidenceModel = require('../models/evidence.model');
const { getIO } = require('../sockets/notification.socket');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

exports.createCase = async (caseData, evidenceData, user) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const io = getIO();

    try {

        if (!caseData.location?.coordinates && caseData.location?.address) {
            const geoRes = await geocoder.geocode(caseData.location.address);
            if (geoRes?.length > 0) {
                caseData.location.coordinates = [geoRes[0].longitude, geoRes[0].latitude];
            } else {
                throw new ApiError(400, "Address could not be resolved to coordinates.");
            }
        }


        const radiusMap = { THEFT: 200, ACCIDENT: 500, FIRE: 800, DEFAULT: 300 };
        const maxDist = radiusMap[caseData.crimeType?.toUpperCase()] || radiusMap.DEFAULT;
        const timeWindow = new Date(Date.now() - 60 * 60 * 1000);

        const existingCluster = await CaseModel.findOne({
            crimeType: caseData.crimeType,
            status: { $ne: "CLOSED" },
            createdAt: { $gte: timeWindow },
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: caseData.location.coordinates },
                    $maxDistance: maxDist
                }
            }
        }).session(session);


        if (existingCluster && !caseData.forceCreate) {
            const mergedCase = await this.mergeToExistingCase(existingCluster._id, evidenceData, user, session);
            await session.commitTransaction();


            if (mergedCase.assignedOfficer) {
                io.to(mergedCase.assignedOfficer.toString()).emit('notification', {
                    type: 'CLUSTER_UPDATE',
                    message: `New reporter linked to Case: ${mergedCase.caseNumber}`
                });
            }
            return mergedCase;
        }


        const [createdCase] = await CaseModel.create([
            {
                ...caseData,
                reporters: [user._id || user.id],
                status: "REPORTED"
            }
        ], { session });


        if (evidenceData) {
            await EvidenceModel.create([
                {
                    ...evidenceData,
                    caseId: createdCase._id,
                    submittedBy: user._id || user.id,
                    verificationStatus: 'PENDING'
                }
            ], { session });
        }


        let assignedOfficer = await UserModel.findOne({
            role: "OFFICER",
            accountStatus: "ACTIVE",
            "preferences.assignedArea": { $regex: caseData.location.address || "", $options: 'i' }
        }).session(session);

        if (!assignedOfficer) {
            const nearby = await UserModel.aggregate([
                {
                    $geoNear: {
                        key: "currentLocation",
                        near: { type: "Point", coordinates: createdCase.location.coordinates },
                        distanceField: "distance",
                        maxDistance: 15000,
                        query: { role: "OFFICER", accountStatus: "ACTIVE" },
                        spherical: true
                    }
                },
                {
                    $lookup: {
                        from: "cases",
                        localField: "_id",
                        foreignField: "assignedOfficer",
                        as: "workload"
                    }
                },
                {
                    $addFields: {
                        activeCaseCount: {
                            $size: {
                                $filter: {
                                    input: "$workload",
                                    as: "c",
                                    cond: { $ne: ["$$c.status", "CLOSED"] }
                                }
                            }
                        }
                    }
                },
                { $sort: { activeCaseCount: 1, distance: 1 } },
                { $limit: 1 }
            ]).session(session);

            assignedOfficer = nearby[0];
        }


        if (assignedOfficer) {
            const officerId = assignedOfficer._id;

            await UserModel.findByIdAndUpdate(officerId, { availabilityStatus: "ON_CASE" }, { session });

            createdCase.assignedOfficer = officerId;
            createdCase.status = "UNDER_REVIEW";
            await createdCase.save({ session });

            const notifications = await NotificationModel.create([
                {
                    recipient: officerId,
                    type: 'STATUS_CHANGE',
                    title: 'New Case Assigned',
                    message: `Case #${createdCase.caseNumber} assigned to you.`,
                    relatedCase: createdCase._id,
                    priority: 'HIGH'
                },
                {
                    recipient: user._id || user.id,
                    type: 'STATUS_CHANGE',
                    title: 'Officer Assigned',
                    message: `An officer is reviewing your report #${createdCase.caseNumber}.`,
                    relatedCase: createdCase._id,
                    priority: 'MEDIUM'
                }
            ], { session });

            // Socket Emissions
            io.to(officerId.toString()).emit('notification', { type: 'NEW_ASSIGNMENT', data: notifications[0] });
            io.to((user._id || user.id).toString()).emit('notification', { type: 'STATUS_UPDATE', data: notifications[1] });
        }

        await session.commitTransaction();
        return createdCase;

    } catch (error) {
        await session.abortTransaction();
        console.error("CreateCase Transaction Failed:", error);
        throw new ApiError(error.statusCode || 500, error.message);
    } finally {
        session.endSession();
    }
};

/**
 * @desc Link a new reporter/evidence to an existing case thread (Internal helper)
 */
exports.mergeToExistingCase = async (caseId, evidenceData, user, passedSession = null) => {
    const session = passedSession || await mongoose.startSession();
    if (!passedSession) session.startTransaction();

    try {
        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseId,
            { $addToSet: { reporters: user._id || user.id } },
            { new: true, session }
        );

        if (evidenceData) {
            await EvidenceModel.create([{
                ...evidenceData,
                caseId: updatedCase._id,
                submittedBy: user._id || user.id,
                verificationStatus: 'PENDING'
            }], { session });
        }

        if (!passedSession) await session.commitTransaction();
        return updatedCase;
    } catch (error) {
        if (!passedSession) await session.abortTransaction();
        throw error;
    } finally {
        if (!passedSession) session.endSession();
    }
};


exports.updateStatus = async (caseId, newStatus, reason, user) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const currentCase = await CaseModel.findById(caseId).session(session)
        if (!currentCase) {
            throw new ApiError(404, "Case Not Found")
        }

        const validStatuses = ['REPORTED', 'UNDER_REVIEW', 'INVESTIGATION', 'HEARING', 'JUDGEMENT', 'CLOSED']
        if (!validStatuses.includes(newStatus)) {
            throw new ApiError(400, `Invalid ${newStatus}`)
        }

        if (user.role != "ADMIN" && currentCase.assignedOfficer?.String() != user.id) {
            throw new ApiError(403, "You are not authorized to update this case status.")
        }

        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseId,
            {
                $set: { status: newStatus },
                $push: {
                    history: {
                        status: newStatus,
                        changedBy: user.id,
                        reason: reason || "No reason provided",
                        timestamp: new Date()
                    }
                }
            },
            { new: true, session, runValidators: true }
        ).populate('assignedOfficer', 'name badgeNumber')

        await session.commitTransaction();
        return updatedCase;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
} 