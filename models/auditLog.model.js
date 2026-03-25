const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: { type: String, required: true }, // e.g., "STATUS_UPDATED", "OFFICER_ASSIGNED"
    entityType: { type: String, default: 'Case' },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    changes: {
        before: { type: Object },
        after: { type: Object },
        diff: { type: Object } 
    },
    context: {
        ip: String,
        userAgent: String
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Auto-delete logs after 90 days to keep the DB light
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);