const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true
    },

    role: {
        type: String,
        enum: ["CITIZEN", "OFFICER", "LAWYER", "JUDGE", 'ADMIN'],
        default: "CITIZEN",
        index: true
    },
    password: { type: String, required: true, select: false },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: {
            type: String,   
            trim: true
        }
    },


    availabilityStatus: {
        type: String,
        enum: ["AVAILABLE", "ON_CASE", "OFF_DUTY"],
        default: "AVAILABLE"
    },
    badgeNumber: { type: String, sparse: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
        default: "ACTIVE"
    },

    preferences: {
        alertRadius: { type: Number, default: 5 },
        notificationsEnabled: { type: Boolean, default: true },
    },

    lastLoginAt: Date
}, { timestamps: true })

// passwords will be hashed

UserSchema.pre('save', async function (next) {

    if (this.isModified("password")) {
        const passwordString = String(this.password);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(passwordString, salt);
    }


    if (this.role === 'OFFICER' && !this.badgeNumber) {
        // Generates OFF + timestamp (e.g., OFF-1710425)
        this.badgeNumber = `OFF-${Date.now().toString().slice(-7)}`;
    }

    next
});


// Instance Method for cleaner Logic
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}




UserSchema.index({ currentLocation: "2dsphere" });
UserSchema.index({ location: "2dsphere" });
module.exports = mongoose.model('User', UserSchema)
