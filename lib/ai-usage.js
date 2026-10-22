const AIProviderUsage = require("../model/AIProviderUsage");
const AIUserRateLimit = require("../model/AIUserRateLimit");

const numericLimit = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

async function ensureBucket(Model, filter, defaults) {
  try {
    await Model.updateOne(filter, { $setOnInsert: { ...filter, ...defaults } }, { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

async function incrementWithinLimit(Model, filter, cap, increment = 1, defaults) {
  await ensureBucket(Model, filter, defaults || { requests: 0, tokens: 0 });
  return Model.findOneAndUpdate(
    { ...filter, requests: { $lt: cap } },
    { $inc: { requests: increment }, $set: { updatedAt: new Date() } },
    { new: true }
  );
}

async function reserveProviderUsage(req, res, next, dependencies = {}) {
  const providerUsageModel = dependencies.AIProviderUsage || AIProviderUsage;
  const userRateLimitModel = dependencies.AIUserRateLimit || AIUserRateLimit;
  const config = req.aiRuntimeConfig;
  const provider = req.aiRequest.provider;
  const userId = req.aiAccount.userId;
  const now = new Date();
  const dayBucket = now.toISOString().slice(0, 10);
  const monthBucket = dayBucket.slice(0, 7);
  const minuteBucket = now.toISOString().slice(0, 16);
  const userLimit = numericLimit(config.AI_USER_PER_MINUTE_LIMIT, 10);
  const dailyLimit = numericLimit(config.AI_PROVIDER_DAILY_REQUEST_LIMIT, 500);
  const monthlyTokenLimit = numericLimit(config.AI_PROVIDER_MONTHLY_TOKEN_LIMIT, 500000);
  const requestCharacters = req.aiRequest.messages.reduce((sum, message) => sum + message.content.length, 0);
  const reservedTokens = Math.ceil(requestCharacters / 2) + req.aiRequest.maxTokens;
  const userFilter = { userId, provider, bucket: minuteBucket };
  const userRate = await incrementWithinLimit(
    userRateLimitModel,
    userFilter,
    userLimit,
    1,
    { requests: 0, expiresAt: new Date(now.getTime() + 2 * 60 * 1000) }
  );
  if (!userRate) {
    return res.status(429).json({
      status: false,
      message: `এই provider-এ প্রতি মিনিটে সর্বোচ্চ ${userLimit}টি request করা যাবে।`,
    });
  }
  const dayFilter = { provider, period: "day", bucket: dayBucket };
  const daily = await incrementWithinLimit(providerUsageModel, dayFilter, dailyLimit);
  if (!daily) {
    return res.status(429).json({
      status: false,
      message: "এই provider-এর দৈনিক request budget শেষ। পরে আবার চেষ্টা করুন।",
    });
  }
  const monthFilter = { provider, period: "month", bucket: monthBucket };
  await ensureBucket(providerUsageModel, monthFilter, { requests: 0, tokens: 0 });
  const monthly = await providerUsageModel.findOneAndUpdate(
    { ...monthFilter, tokens: { $lte: monthlyTokenLimit - reservedTokens } },
    { $inc: { requests: 1, tokens: reservedTokens }, $set: { updatedAt: new Date() } },
    { new: true }
  );
  if (!monthly) {
    await providerUsageModel.updateOne(dayFilter, { $inc: { requests: -1 } });
    return res.status(429).json({
      status: false,
      message: "এই provider-এর মাসিক estimated token budget শেষ। Admin settings-এ budget বাড়ান বা পরের মাসে চেষ্টা করুন।",
    });
  }

  req.aiBudgetReservation = { monthFilter, reservedTokens };
  const remaining = Math.max(0, monthlyTokenLimit - monthly.tokens);
  if (remaining <= monthlyTokenLimit * 0.2) {
    req.aiBudgetAlert = { remaining, limit: monthlyTokenLimit };
  }
  return next();
}

async function reconcileProviderUsage(req, usage) {
  if (!req.aiBudgetReservation || !usage) return;
  const inputTokens = Number(usage.prompt_tokens ?? usage.input_tokens);
  const outputTokens = Number(usage.completion_tokens ?? usage.output_tokens);
  if (!Number.isFinite(inputTokens) || !Number.isFinite(outputTokens) ||
      inputTokens < 0 || outputTokens < 0) return;
  const actualTokens = Math.floor(inputTokens) + Math.floor(outputTokens);
  await AIProviderUsage.updateOne(
    req.aiBudgetReservation.monthFilter,
    {
      $inc: {
        tokens: actualTokens - req.aiBudgetReservation.reservedTokens,
      },
      $set: { updatedAt: new Date() },
    }
  );
}

module.exports = { reserveProviderUsage, reconcileProviderUsage, numericLimit };
