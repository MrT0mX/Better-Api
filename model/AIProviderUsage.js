const mongoose = require("mongoose");

const aiProviderUsageSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  period: { type: String, enum: ["day", "month"], required: true },
  bucket: { type: String, required: true },
  requests: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

aiProviderUsageSchema.index({ provider: 1, period: 1, bucket: 1 }, { unique: true });

module.exports = mongoose.model("AIProviderUsage", aiProviderUsageSchema);
