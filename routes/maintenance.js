const crypto = require("crypto");
const express = require("express");
const asyncHandler = require("../lib/async-handler");
const {
  resetApiKeyLimits,
  resetDailyRequestCount,
} = require("../lib/quota-maintenance");

const router = express.Router();

function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function requireCronSecret(req, res, next) {
  if (!process.env.CRON_SECRET) {
    return res.status(503).json({ status: false, message: "Scheduled maintenance is not configured." });
  }
  if (!isAuthorizedCronRequest(req)) {
    return res.status(401).json({ status: false, message: "Unauthorized." });
  }
  return next();
}

router.get("/api/maintenance/daily", requireCronSecret, asyncHandler(async (req, res) => {
  await resetDailyRequestCount();
  const dhakaDay = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
  }).format(new Date());
  const monthlyReset = dhakaDay === "01";
  if (monthlyReset) await resetApiKeyLimits();
  return res.json({
    status: true,
    task: monthlyReset ? "daily-and-monthly-quota-reset" : "daily-request-reset",
  });
}));

module.exports = { router, isAuthorizedCronRequest };
