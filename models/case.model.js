const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const crypto = require("crypto");


const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5);

const CaseSchema = new mongoose.Schema({

    caseNumber: {
        type: String,
        unique: true,
        index: true,
        immutable: true
    },

    title: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    crimeType: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: "LOW",
        index: true
    },

    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },

        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (val) => val.length === 2,
                message: "Coordinates must be [longitude, latitude]"
            }
        },

        address: String
    },
    reporters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    status: {
        type: String,
        enum: ['REPORTED', 'ASSIGNED', 'UNDER_REVIEW', 'ESCALATED', 'UNDER_REVIEW', "PENDING_DISPATCH", 'INVESTIGATION', 'HEARING', 'JUDGEMENT', 'CLOSED'],
        default: 'REPORTED',
        index: true
    },

    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    aiInsights: {
        complexity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
        predictedVerdict: String,
        riskScore: Number,
        suggestedEvidence: [String],
        analyzedAt: Date
    },

    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },

    isAnonymous: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    isClustered: {
        type: Boolean,
        default: false,
        index: true
    },
    history: [
        {
            status: {
                type: String,
                enum: ['REPORTED', 'UNDER_REVIEW', 'ASSIGNED','PENDING_DISPATCH','INVESTIGATION', 'HEARING', 'JUDGEMENT', 'CLOSED']
            },
            changedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            reason: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    clusterSize: {
        type: Number,
        default: 0
    },

    clusterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        default: null
    },

    assignedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })


CaseSchema.index({ location: "2dsphere" });
CaseSchema.index({ address: 1 });
CaseSchema.pre('save', function (next) {

    if (!this.caseNumber) {
        const year = new Date().getFullYear();
        const randomPart = nanoid();
        this.caseNumber = `CR-${year}-${randomPart}`;
    }

    if (!this.shareToken && !this.isAnonymous) {
        this.shareToken = crypto.randomBytes(16).toString("hex");
    }

    next
})

module.exports = mongoose.model("Case", CaseSchema);