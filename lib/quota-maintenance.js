require("../settings");
const User = require("../model/user");
const dataweb = require("../model/DataWeb");
const logger = require("./logger");

async function resetApiKeyLimits() {
  if (!Number.isInteger(LimitApikey) || LimitApikey < 0) {
    throw new Error("LIMIT_APIKEY is not configured as a valid non-negative integer.");
  }
  await User.updateMany({}, { $set: { limitApikey: LimitApikey } });
  logger.info("API key limits were reset.");
}

async function resetDailyRequestCount() {
  await dataweb.updateOne({}, { $set: { RequestToday: 0 } });
  logger.info("Today's API request count was reset.");
}

module.exports = { resetApiKeyLimits, resetDailyRequestCount };
