const mongoose = require("mongoose");

const aiUserRateLimitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  provider: { type: String, required: true },
  bucket: { type: String, required: true },
  requests: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

aiUserRateLimitSchema.index({ userId: 1, provider: 1, bucket: 1 }, { unique: true });
aiUserRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AIUserRateLimit", aiUserRateLimitSchema);
