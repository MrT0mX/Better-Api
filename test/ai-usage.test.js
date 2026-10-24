const assert = require("node:assert/strict");
const { test } = require("node:test");
const { reserveProviderUsage } = require("../lib/ai-usage");

function createModel(uniqueFields) {
  const rows = new Map();
  const keyFor = (filter) => uniqueFields.map((field) => `${field}:${filter[field]}`).join("|");
  return {
    rows,
    async updateOne(filter, update) {
      const key = keyFor(filter);
      if (!rows.has(key)) rows.set(key, { ...filter, ...(update.$setOnInsert || {}) });
      if (update.$inc) {
        for (const [field, amount] of Object.entries(update.$inc)) {
          rows.get(key)[field] = (rows.get(key)[field] || 0) + amount;
        }
      }
      return { acknowledged: true };
    },
    async findOneAndUpdate(filter, update) {
      const row = rows.get(keyFor(filter));
      if (!row) return null;
      if (filter.requests && !(row.requests < filter.requests.$lt)) return null;
      if (filter.tokens && !(row.tokens <= filter.tokens.$lte)) return null;
      for (const [field, amount] of Object.entries(update.$inc)) {
        row[field] = (row[field] || 0) + amount;
      }
      return row;
    },
  };
}

function makeRequest(config) {
  return {
    aiRuntimeConfig: config,
    aiRequest: { provider: "openai", messages: [{ content: "hi" }], maxTokens: 100 },
    aiAccount: { userId: "user-id" },
  };
}

function makeResponse() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test("provider budget reserves estimated tokens and denies requests beyond monthly cap", async () => {
  const providerUsage = createModel(["provider", "period", "bucket"]);
  const userRate = createModel(["userId", "provider", "bucket"]);
  const dependencies = { AIProviderUsage: providerUsage, AIUserRateLimit: userRate };
  const config = {
    AI_USER_PER_MINUTE_LIMIT: "10",
    AI_PROVIDER_DAILY_REQUEST_LIMIT: "10",
    AI_PROVIDER_MONTHLY_TOKEN_LIMIT: "101",
  };
  const firstRequest = makeRequest(config);
  let passed = false;
  await reserveProviderUsage(firstRequest, makeResponse(), () => { passed = true; }, dependencies);
  assert.equal(passed, true);
  assert.equal(firstRequest.aiBudgetReservation.reservedTokens, 101);

  const response = makeResponse();
  passed = false;
  await reserveProviderUsage(makeRequest(config), response, () => { passed = true; }, dependencies);
  assert.equal(passed, false);
  assert.equal(response.statusCode, 429);
  const monthly = [...providerUsage.rows.values()].find((row) => row.period === "month");
  assert.equal(monthly.tokens, 101);
  const daily = [...providerUsage.rows.values()].find((row) => row.period === "day");
  assert.equal(daily.requests, 1);
});

test("per-account provider rate limit rejects excess requests", async () => {
  const providerUsage = createModel(["provider", "period", "bucket"]);
  const userRate = createModel(["userId", "provider", "bucket"]);
  const dependencies = { AIProviderUsage: providerUsage, AIUserRateLimit: userRate };
  const config = {
    AI_USER_PER_MINUTE_LIMIT: "1",
    AI_PROVIDER_DAILY_REQUEST_LIMIT: "10",
    AI_PROVIDER_MONTHLY_TOKEN_LIMIT: "10000",
  };
  const firstResponse = makeResponse();
  await reserveProviderUsage(makeRequest(config), firstResponse, () => {}, dependencies);
  const secondResponse = makeResponse();
  let passed = false;
  await reserveProviderUsage(makeRequest(config), secondResponse, () => { passed = true; }, dependencies);
  assert.equal(passed, false);
  assert.equal(secondResponse.statusCode, 429);
  assert.match(secondResponse.payload.message, /প্রতি মিনিটে/);
});
