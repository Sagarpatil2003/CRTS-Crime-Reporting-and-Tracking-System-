const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Auto-delete expired tokens from DB
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);