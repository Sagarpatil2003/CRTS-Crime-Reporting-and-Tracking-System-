const EvidenceModel = require('../models/evidence.model')
const CaseModel = require('../models/case.model')
const ApiError = require("../utils/ApiError")
const auditService = require('../services/auditService')



exports.getEvidenceByCaseId = async (caseId, user) => {
    // First, verify the user has access to the case itself
    const foundCase = await CaseModel.findById(caseId).select("reporters isDeleted").lean();

    if (!foundCase || foundCase.isDeleted) throw new ApiError(404, "Case not found.");

    const isOwner = foundCase.reporters.some(id => id.toString() === user.id.toString());
    const isStaff = ["ADMIN", "OFFICER"].includes(user.role?.toUpperCase());

    if (!isOwner && !isStaff) {
        throw new ApiError(403, "Not authorized to view this case.");
    }

    // Fetch Evidence from the unique Evidence Schema
    return await EvidenceModel.find({ caseId })
        .sort({ createdAt: -1 })
        .populate("submittedBy", "name role")
        .lean();
}

exports.addEvidence = async (caseId, user, data) => {
    const userId = (user._id || user.id || user).toString();

    // 1. Record is created here
    const evidence = await EvidenceModel.create({
        caseId: caseId,
        submittedBy: userId,
        evidenceType: data.evidenceType,
        fileUrl: data.fileUrl,
        verificationStatus: "PENDING" // This is the initial state
    });


    await auditService.recordLog({
        user: user,
        action: "EVIDENCE_SUBMITTED",
        entityId: evidence._id,
        entityType: "Evidence",
        before: {},
        after: {
            status: "PENDING",
            fileUrl: data.fileUrl
        },
        context: { caseId: caseId }
    });

    return evidence;
}


exports.deleteEvidence = async (caseId, evidenceId, user) => {
    const isAdmin = user.role === 'ADMIN';
    const userId = (user._id || user.id).toString();

    const evidence = await EvidenceModel.findById(evidenceId).setOptions({ withDeleted: true })

    if (!evidence) {
        throw new ApiError(404, "Evidence record not found.");
    }

    const isOwner = evidence.submittedBy.toString() === userId;


    if (!isOwner && !isAdmin && user.role !== 'OFFICER') {
        throw new ApiError(403, "Access Denied: You do not have permission to delete this.");
    }

    let resultMessage = "";
    let logAction = "";

 
    if (isAdmin) {
        await EvidenceModel.findByIdAndDelete(evidenceId).setOptions({ withDeleted: true });
        resultMessage = "Evidence permanently purged from the database.";
        logAction = "EVIDENCE_HARD_DELETE";
    } else {
 
        if (evidence.isDeleted) {
            throw new ApiError(400, "Evidence is already in the trash.");
        }

        evidence.isDeleted = true;
        evidence.deletedAt = new Date();
        await evidence.save();

        resultMessage = "Evidence moved to trash.";
        logAction = "EVIDENCE_SOFT_DELETE";
    }

    
    await auditService.recordLog({
        user,
        action: logAction,
        entityId: caseId,
        entityType: "Case",
        before: { 
            id: evidence._id, 
            type: evidence.evidenceType,
            status: evidence.verificationStatus 
        },
        after: { 
            status: isAdmin ? "PERMANENTLY_DELETED" : "ARCHIVED" 
        },
        context: { evidenceId }
    });

    return { success: true, message: resultMessage };
};


exports.addWitness = async (caseId, userId, data, context = {}) => {

    const witness = await EvidenceModel.create({
        caseId,
        submittedBy: userId,
        evidenceType: 'WITNESS_STATEMENT',
        witnessInfo: {
            name: data.name,
            contact: data.contact,
            statement: data.statement,
            address: data.address,
            isVerified: false
        }
    });

    await auditService.recordLog({
        user: { _id: userId },
        action: "WITNESS_ADDED",
        entityId: caseId,
        entityType: "Case",
        before: {},
        after: {
            evidenceId: witness._id,
            type: "WITNESS_STATEMENT",
            witnessName: data.name,
            contact: data.contact
        },
        context: {
            source: "WITNESS_MODULE",
            ip: context.ip || "unknown",
            userAgent: context.userAgent || "unknown"
        }
    });

    return witness;
};

exports.getWitnessesByCase = async (caseId) => {
    return await EvidenceModel.find({
        caseId,
        evidenceType: "WITNESS_STATEMENT"
    })
        .populate('submittedBy', 'name role')
        .sort({ createdAt: -1 })
        .lean();
}
