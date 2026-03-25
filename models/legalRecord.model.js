const mongoose = require('mongoose');

const LegalRecordSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true,
        index: true
    },

    legalComments: [{
        lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    hearings: [{
        hearingDate: Date,
        courtroom: String,
        notes: String,
        judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    
    finalVerdict: {
        decision: String,
        reasoning: String,
        sentencing: String,
        isPublic: { type: Boolean, default: false },
        closedAt: Date
    },

    appealStatus: {
        type: String,
        enum: ['NONE', 'FILED', 'UNDER_REVIEW', 'RESOLVED'],
        default: 'NONE' 
    },
    appealClosedAt: Date

}, { timestamps: true });

module.exports = mongoose.model('LegalRecord', LegalRecordSchema);
