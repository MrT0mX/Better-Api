const mongoose = require("mongoose");

const adminMfaAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bucket: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

adminMfaAttemptSchema.index({ userId: 1, bucket: 1 }, { unique: true });
adminMfaAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AdminMfaAttempt", adminMfaAttemptSchema);
