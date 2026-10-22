const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    adminMfaEnabled: {
        type: Boolean,
        default: false,
    },
    adminMfaPendingSecret: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    adminMfaPendingExpiresAt: {
        type: Date,
        default: null,
    },
    adminMfaSecret: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    adminMfaRecoveryHashes: {
        type: [String],
        default: [],
    },
    adminMfaLastStep: {
        type: Number,
        default: -1,
    },
    apikey: { 
        type: String 
    },
    limitApikey: {
         type: Number 
    },
});

module.exports = mongoose.model('user', userSchema);