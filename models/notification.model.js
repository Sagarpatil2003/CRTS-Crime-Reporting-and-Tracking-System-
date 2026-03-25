const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['CRIME_ALERT', 'STATUS_CHANGE', 'HEARING_REMINDER'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    // The direct link for the frontend to redirect the user
    actionUrl: { 
        type: String, 
        placeholder: "/dashboard/cases/:id" 
    },

    relatedCase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    },

    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW',
        index: true
    },

    isRead: { type: Boolean, default: false },
    
    // Optional: Extra data like specific hearing dates or officer names
    metadata: {
        type: Map,
        of: String
    },

    expiredAt: { 
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
    }
}, { timestamps: true });

// Auto-delete expired notifications
NotificationSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);
