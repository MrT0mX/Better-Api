const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, required: false },
  actor: { type: String, required: true, maxlength: 64 },
  action: { type: String, required: true, maxlength: 64 },
  target: { type: String, maxlength: 128 },
  outcome: { type: String, enum: ["success", "failure"], default: "success" },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipHash: { type: String, maxlength: 64 },
}, { timestamps: { createdAt: true, updatedAt: false } });

adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ actorId: 1, createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
