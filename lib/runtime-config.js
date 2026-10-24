const crypto = require("crypto");
const AppSetting = require("../model/AppSetting");

const runtimeSettingKeys = [
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENROUTER_API_KEY",
  "OPENROUTER_SITE_URL",
  "OPENROUTER_APP_NAME",
  "DEEPSEEK_API_KEY",
  "GROQ_API_KEY",
  "MISTRAL_API_KEY",
  "LLM_API_KEY",
  "LLM_BASE_URL",
  "LLM_MODEL",
  "CUTTLY_API_KEYS",
  "BITLY_API_KEYS",
  "sendemail",
  "fromsendemail",
  "sendpwmail",
  "servicesmtp",
  "domain",
  "recaptcha_key_1",
  "recaptcha_key_2",
  "AI_PROVIDER_DAILY_REQUEST_LIMIT",
  "AI_PROVIDER_MONTHLY_TOKEN_LIMIT",
  "AI_USER_PER_MINUTE_LIMIT",
];
const secretSettingKeys = new Set([
  "OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY", "OPENROUTER_API_KEY",
  "DEEPSEEK_API_KEY", "GROQ_API_KEY", "MISTRAL_API_KEY", "LLM_API_KEY",
  "CUTTLY_API_KEYS", "BITLY_API_KEYS", "sendpwmail", "recaptcha_key_2",
]);

function encryptionKey(env = process.env) {
  const secret = env.ADMIN_SETTINGS_ENCRYPTION_KEY || "";
  if (secret.length < 32) {
    throw new Error("ADMIN_SETTINGS_ENCRYPTION_KEY must be set to a stable secret of at least 32 characters.");
  }
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

function encryptValue(value, env = process.env) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(env), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
    ciphertext: ciphertext.toString("hex"),
  };
}

function decryptValue(record, env = process.env) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(env),
    Buffer.from(record.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(record.authTag, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

function validateSettingInput(key, value) {
  if (!runtimeSettingKeys.includes(key)) throw new Error("Unsupported runtime setting.");
  if (typeof value !== "string" || value.length > 4096 || /[\r\n\0]/.test(value)) {
    throw new Error(`${key} must be a single-line value of at most 4096 characters.`);
  }
  if (key.endsWith("_URL") || key === "LLM_BASE_URL") {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${key} must be a valid HTTPS URL.`);
    }
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error(`${key} must be an HTTPS URL without embedded credentials.`);
    }
  }
  if (key === "servicesmtp" && value && !/^[a-zA-Z0-9 ._-]{1,64}$/.test(value)) {
    throw new Error("SMTP service name contains unsupported characters.");
  }
  const numericLimits = {
    AI_PROVIDER_DAILY_REQUEST_LIMIT: [1, 100000],
    AI_PROVIDER_MONTHLY_TOKEN_LIMIT: [1000, 1000000000],
    AI_USER_PER_MINUTE_LIMIT: [1, 600],
  };
  if (numericLimits[key]) {
    const [minimum, maximum] = numericLimits[key];
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
      throw new Error(`${key} must be an integer from ${minimum} to ${maximum}.`);
    }
  }
  if (key === "domain" && value && !/^[a-zA-Z0-9.:[\]-]{1,253}$/.test(value)) {
    throw new Error("Domain contains unsupported characters.");
  }
}

async function getRuntimeConfig() {
  const records = await AppSetting.find({ key: { $in: runtimeSettingKeys } }).lean();
  const saved = new Map(records.map((record) => [record.key, decryptValue(record)]));
  return Object.fromEntries(runtimeSettingKeys.map((key) => [
    key,
    saved.has(key) ? saved.get(key) : (process.env[key] || ""),
  ]));
}

async function saveRuntimeConfig(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Settings payload must be an object.");
  }
  const updates = Object.entries(input).filter(([key, value]) =>
    runtimeSettingKeys.includes(key) && typeof value === "string" && value.length > 0
  );
  for (const [key, value] of updates) validateSettingInput(key, value);

  for (const [key, value] of updates) {
    const encrypted = encryptValue(value);
    await AppSetting.updateOne(
      { key },
      { $set: { ...encrypted } },
      { upsert: true, runValidators: true }
    );
  }
  return updates.map(([key]) => key);
}

async function clearRuntimeSetting(key) {
  if (!runtimeSettingKeys.includes(key)) throw new Error("Unsupported runtime setting.");
  await AppSetting.deleteOne({ key });
}

async function getRuntimeSettingState() {
  const records = await AppSetting.find({ key: { $in: runtimeSettingKeys } }).select("key").lean();
  const savedKeys = new Set(records.map((record) => record.key));
  return runtimeSettingKeys.map((key) => ({
    key,
    secret: secretSettingKeys.has(key),
    configured: savedKeys.has(key) || Boolean(process.env[key]),
    source: savedKeys.has(key) ? "database" : process.env[key] ? "environment" : "missing",
  }));
}

function hasEncryptionKey(env = process.env) {
  return typeof env.ADMIN_SETTINGS_ENCRYPTION_KEY === "string" &&
    env.ADMIN_SETTINGS_ENCRYPTION_KEY.length >= 32;
}

module.exports = {
  runtimeSettingKeys,
  secretSettingKeys,
  encryptValue,
  decryptValue,
  validateSettingInput,
  getRuntimeConfig,
  saveRuntimeConfig,
  clearRuntimeSetting,
  getRuntimeSettingState,
  hasEncryptionKey,
};
