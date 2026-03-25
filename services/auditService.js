const AuditLogModel = require('../models/auditLog.model'); 

/**
 * @desc Fetch logs for a specific case with pagination
 */
exports.getCaseLogs = async (caseId, userRole, query) => {
    const { page = 1, limit = 10 } = query;

    // 1. Define what fields are sensitive
    const isInternalRole = ["ADMIN", "JUDGE"].includes(userRole);

    const queryObj = { entityId: caseId };
    
    
    // If NOT an Admin/Judge, we hide the 'context' (IP/UserAgent) and 'changes.diff'
    let projection = {};
    if (!isInternalRole) {
        projection = {
            "context": 0,          // Hide IP/Browser info
            "changes.before": 0,   // Hide raw technical data
            "changes.after": 0     // Hide raw technical data
        };
    }

    const logs = await AuditLogModel.find(queryObj, projection)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user", "name role")
        .lean(); 
    
    const total = await AuditLogModel.countDocuments(queryObj);

    return { logs, total };
};
/**
 * @desc Logic to track what actually changed (the Diff) and save it
 */
exports.recordLog = async ({ user, action, entityId, entityType = "Case", before, after, context }) => {
    const diff = {};
    
    // Ensure we handle Mongoose documents by converting to plain objects
    const safeBefore = before && typeof before.toObject === 'function' ? before.toObject() : (before || {});
    const safeAfter = after && typeof after.toObject === 'function' ? after.toObject() : (after || {});

    // Calculate the Diff
    Object.keys(safeAfter).forEach(key => {
        // Skip internal Mongoose keys like __v or updatedAt if you don't want them in logs
        if (['_id', '__v', 'updatedAt'].includes(key)) return;

        const valBefore = JSON.stringify(safeBefore[key]);
        const valAfter = JSON.stringify(safeAfter[key]);

        if (valBefore !== valAfter) {
            diff[key] = { 
                from: safeBefore[key] === undefined ? null : safeBefore[key], 
                to: safeAfter[key] 
            };
        }
    });

    // If no changes occurred, don't waste DB space with a log
    if (Object.keys(diff).length === 0 && action === "UPDATE") {
        return null; 
    }

    return await AuditLogModel.create({
        user: user._id || user, // Handle both user object or just ID
        action,
        entityType,
        entityId,
        changes: { 
            before: safeBefore, 
            after: safeAfter, 
            diff 
        },
        context: {
            ip: context?.ip || "unknown",
            userAgent: context?.userAgent || "unknown",
            source: context?.source || "API"
        }
    });
};