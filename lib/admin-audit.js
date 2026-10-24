const crypto = require("crypto");
const AdminAuditLog = require("../model/AdminAuditLog");

function sanitizeAuditDetails(details = {}) {
  return Object.fromEntries(
    Object.entries(details).filter(([key, value]) =>
      !/secret|password|token|credential|keyvalue/i.test(key) &&
      (["string", "number", "boolean"].includes(typeof value) ||
        (Array.isArray(value) && value.length <= 50 && value.every((item) => typeof item === "string")))
    )
  );
}

function recordAdminAudit(req, {
  actorId = req?.adminUser?._id || req?.user?._id,
  actor = req?.adminUser?.username || req?.user?.username || "system",
  action,
  target = "",
  outcome = "success",
  details = {},
}) {
  const safeDetails = sanitizeAuditDetails(details);
  const ipHash = req?.ip
    ? crypto.createHash("sha256").update(req.ip).digest("hex")
    : undefined;
  return AdminAuditLog.create({ actorId, actor, action, target, outcome, details: safeDetails, ipHash });
}

module.exports = { recordAdminAudit, sanitizeAuditDetails };
