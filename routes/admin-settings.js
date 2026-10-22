const express = require("express");
const nodemailer = require("nodemailer");
const User = require("../model/user");
const AppSetting = require("../model/AppSetting");
const AdminAuditLog = require("../model/AdminAuditLog");
const AIProviderUsage = require("../model/AIProviderUsage");
const bcryptjs = require("bcryptjs");
const asyncHandler = require("../lib/async-handler");
const { createAdminGuard } = require("../lib/admin-access");
const { recordAdminAudit } = require("../lib/admin-audit");
const { reserveAdminMfaAttempt } = require("../lib/admin-mfa-rate-limit");
const {
  generateTotpSecret,
  createTotpUri,
  verifyTotp,
  createRecoveryCodes,
  hashRecoveryCode,
} = require("../lib/admin-totp");
const logger = require("../lib/logger");
const {
  runtimeSettingKeys,
  getRuntimeConfig,
  saveRuntimeConfig,
  clearRuntimeSetting,
  getRuntimeSettingState,
  hasEncryptionKey,
  encryptValue,
  decryptValue,
} = require("../lib/runtime-config");
const { createSettingsBackup, validateSettingsBackup } = require("../lib/runtime-backup");

const router = express.Router();
const requireAdmin = createAdminGuard((id) =>
  User.findById(id).select("username isAdmin isVerified adminMfaEnabled").lean()
);

const settingGroups = [
  {
    title: "AI Provider API Keys",
    fields: [
      ["GEMINI_API_KEY", "Google Gemini", "API key from Google AI Studio."],
      ["OPENAI_API_KEY", "OpenAI", "OpenAI platform API key."],
      ["ANTHROPIC_API_KEY", "Anthropic / Claude", "Anthropic Console API key."],
      ["OPENROUTER_API_KEY", "OpenRouter", "OpenRouter API key."],
      ["DEEPSEEK_API_KEY", "DeepSeek", "DeepSeek API key."],
      ["GROQ_API_KEY", "Groq", "GroqCloud API key."],
      ["MISTRAL_API_KEY", "Mistral", "Mistral API key."],
    ],
  },
  {
    title: "Custom LLM",
    fields: [
      ["LLM_API_KEY", "Custom LLM API key", "Key for an OpenAI-compatible endpoint."],
      ["LLM_BASE_URL", "Chat completions URL", "HTTPS endpoint URL; do not include credentials."],
      ["LLM_MODEL", "Model name", "Provider model identifier."],
    ],
  },
  {
    title: "Email / SMTP",
    fields: [
      ["sendemail", "SMTP username", "SMTP account username."],
      ["sendpwmail", "SMTP password", "SMTP password or provider app password."],
      ["fromsendemail", "Sender email", "From address used in verification and reset emails."],
      ["servicesmtp", "SMTP service", "For example Zoho or Gmail; use provider's exact nodemailer service name."],
      ["domain", "Public domain", "For example api.example.com; no http:// prefix."],
    ],
  },
  {
    title: "Other API Credentials",
    fields: [
      ["CUTTLY_API_KEYS", "Cuttly API keys", "Comma-separated API keys."],
      ["BITLY_API_KEYS", "Bitly API keys", "Comma-separated API keys."],
      ["recaptcha_key_1", "reCAPTCHA site key", "Public site key used by signup/login forms."],
      ["recaptcha_key_2", "reCAPTCHA secret key", "Server-only secret paired with the site key."],
      ["OPENROUTER_SITE_URL", "OpenRouter site URL", "Optional HTTPS URL sent as app attribution."],
      ["OPENROUTER_APP_NAME", "OpenRouter app name", "Optional app attribution label."],
    ],
  },
  {
    title: "AI Usage Guardrails",
    fields: [
      ["AI_PROVIDER_DAILY_REQUEST_LIMIT", "Daily requests per provider", "Shared request ceiling for each AI provider per UTC day; default 500."],
      ["AI_PROVIDER_MONTHLY_TOKEN_LIMIT", "Monthly estimated tokens per provider", "Shared monthly token ceiling; reservation estimates input at 2 characters per token and reserves max output tokens. Provider billing remains separate."],
      ["AI_USER_PER_MINUTE_LIMIT", "Per-account requests per minute", "Rate limit for each account and provider; default 10."],
    ],
  },
];

const credentialSources = {
  GEMINI_API_KEY: ["Google AI Studio-তে API key নিন", "https://aistudio.google.com/apikey"],
  OPENAI_API_KEY: ["OpenAI Platform-এ API key নিন", "https://platform.openai.com/api-keys"],
  ANTHROPIC_API_KEY: ["Anthropic Console-এ API key নিন", "https://console.anthropic.com/settings/keys"],
  OPENROUTER_API_KEY: ["OpenRouter-এ API key নিন", "https://openrouter.ai/keys"],
  DEEPSEEK_API_KEY: ["DeepSeek Platform-এ API key নিন", "https://platform.deepseek.com/api_keys"],
  GROQ_API_KEY: ["GroqCloud-এ API key নিন", "https://console.groq.com/keys"],
  MISTRAL_API_KEY: ["Mistral Console-এ API key নিন", "https://console.mistral.ai/api-keys"],
  CUTTLY_API_KEYS: ["Cuttly Developer API দেখুন", "https://cutt.ly/cuttly-api"],
  BITLY_API_KEYS: ["Bitly API documentation দেখুন", "https://dev.bitly.com/"],
  recaptcha_key_1: ["Google reCAPTCHA Admin Console খুলুন", "https://www.google.com/recaptcha/admin"],
  recaptcha_key_2: ["Google reCAPTCHA Admin Console খুলুন", "https://www.google.com/recaptcha/admin"],
  sendemail: ["Zoho Mail SMTP setup দেখুন", "https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html"],
  sendpwmail: ["Gmail App Password নির্দেশনা দেখুন", "https://support.google.com/accounts/answer/185833"],
};

function buildFields(state) {
  const stateByKey = new Map(state.map((entry) => [entry.key, entry]));
  return settingGroups.map((group) => ({
    ...group,
    fields: group.fields.map(([key, label, hint]) => ({
      key,
      label,
      hint,
      sourceLabel: credentialSources[key]?.[0] || "",
      sourceUrl: credentialSources[key]?.[1] || "",
      secret: stateByKey.get(key)?.secret || false,
      configured: stateByKey.get(key)?.configured || false,
      source: stateByKey.get(key)?.source || "missing",
      testable: !key.startsWith("AI_"),
      type: key.includes("URL") || key === "LLM_BASE_URL" ? "url" :
        key === "LLM_MODEL" || key === "servicesmtp" || key === "domain" ||
        key === "fromsendemail" || key === "sendemail" ? "text" :
          key.startsWith("AI_") ? "number" : "password",
    })),
  }));
}

function getCheckTarget(key, config) {
  const providers = {
    OPENAI_API_KEY: { url: "https://api.openai.com/v1/models", headers: (value) => ({ Authorization: `Bearer ${value}` }) },
    GEMINI_API_KEY: { url: `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(config.GEMINI_API_KEY)}` },
    ANTHROPIC_API_KEY: { url: "https://api.anthropic.com/v1/models?limit=1", headers: (value) => ({ "x-api-key": value, "anthropic-version": "2023-06-01" }) },
    OPENROUTER_API_KEY: { url: "https://openrouter.ai/api/v1/models", headers: (value) => ({ Authorization: `Bearer ${value}` }) },
    DEEPSEEK_API_KEY: { url: "https://api.deepseek.com/models", headers: (value) => ({ Authorization: `Bearer ${value}` }) },
    GROQ_API_KEY: { url: "https://api.groq.com/openai/v1/models", headers: (value) => ({ Authorization: `Bearer ${value}` }) },
    MISTRAL_API_KEY: { url: "https://api.mistral.ai/v1/models", headers: (value) => ({ Authorization: `Bearer ${value}` }) },
  };
  const target = providers[key];
  if (!target) return null;
  return {
    url: target.url,
    headers: target.headers ? target.headers(config[key]) : {},
  };
}

async function verifyCredential(key, config) {
  if (!runtimeSettingKeys.includes(key)) {
    return { status: "error", message: "এই credential test করা যাবে না।" };
  }
  if (!config[key]) {
    return { status: "error", message: "এই credential দেওয়া নেই। আগে save করুন।" };
  }
  if (key === "sendpwmail" || key === "sendemail") {
    if (!config.sendemail || !config.sendpwmail || !config.servicesmtp) {
      return { status: "error", message: "SMTP username, password, service—তিনটিই দিন।" };
    }
    const transporter = nodemailer.createTransport({
      service: config.servicesmtp,
      auth: { user: config.sendemail, pass: config.sendpwmail },
    });
    try {
      await transporter.verify();
      return { status: "ok", message: "SMTP server connection সফল। কোনো test email পাঠানো হয়নি।" };
    } catch (error) {
      logger.warn("Admin SMTP connection test failed.");
      return { status: "error", message: "SMTP connection ব্যর্থ; service name, credentials ও provider settings পরীক্ষা করুন।" };
    } finally {
      transporter.close();
    }
  }

  const target = getCheckTarget(key, config);
  if (!target) {
    return { status: "unknown", message: "Secret সংরক্ষিত; test status এই endpoint দিয়ে যাচাই করা যায় না। সংশ্লিষ্ট API দিয়ে test করুন।" };
  }

  try {
    const response = await fetch(target.url, {
      headers: target.headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return { status: "error", message: `Provider test ব্যর্থ (HTTP ${response.status}); key, quota ও provider account পরীক্ষা করুন।` };
    }
    return { status: "ok", message: "Provider key accepted; models endpoint reachable." };
  } catch (error) {
    logger.warn(`Admin credential test for ${key} failed.`);
    return { status: "error", message: "Provider-এ সংযোগ করা যায়নি; network ও provider status পরীক্ষা করুন।" };
  }
}

router.get("/admin/settings", requireAdmin, asyncHandler(async (req, res) => {
  const state = await getRuntimeSettingState();
  const encryptionReady = hasEncryptionKey();
  const config = await getRuntimeConfig();
  const audit = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(20).lean();
  const usage = await AIProviderUsage.find({
    period: "month",
    bucket: new Date().toISOString().slice(0, 7),
  }).sort({ provider: 1 }).lean();
  res.render("admin-settings", {
    csrfToken: req.csrfToken(),
    groups: buildFields(state),
    encryptionReady,
    message: req.query.saved === "1" ? "Settings encrypted and saved." : "",
    audit,
    usage,
    monthlyTokenLimit: Number(config.AI_PROVIDER_MONTHLY_TOKEN_LIMIT) || 500000,
  });
}));

router.post("/admin/settings", requireAdmin, asyncHandler(async (req, res) => {
  if (!hasEncryptionKey()) {
    return res.status(503).render("admin-settings-error", {
      message: "Saving secrets বন্ধ। Hosting secret-এ ADMIN_SETTINGS_ENCRYPTION_KEY দিন (কমপক্ষে ৩২ অক্ষর) এবং server restart করুন।",
    });
  }

  try {
    const saved = await saveRuntimeConfig(req.body);
    await recordAdminAudit(req, {
      action: "admin.settings.update",
      target: "runtime-settings",
      details: { settingNames: saved },
    });
    logger.info(`Admin ${req.adminUser.username} updated ${saved.length} runtime settings.`);
    return res.redirect("/admin/settings?saved=1");
  } catch (error) {
    logger.warn(`Admin settings update rejected: ${error.message}`);
    const state = await getRuntimeSettingState();
    return res.status(400).render("admin-settings", {
      csrfToken: req.csrfToken(),
      groups: buildFields(state),
      encryptionReady: hasEncryptionKey(),
      message: error.message,
    });
  }
}));

router.post("/admin/settings/clear", requireAdmin, asyncHandler(async (req, res) => {
  const key = String(req.body.key || "");
  if (!runtimeSettingKeys.includes(key)) {
    return res.status(400).json({ status: false, message: "Unsupported setting." });
  }
  await clearRuntimeSetting(key);
  await recordAdminAudit(req, {
    action: "admin.settings.clear",
    target: key,
  });
  logger.info(`Admin ${req.adminUser.username} cleared runtime setting ${key}.`);
  return res.json({ status: true, message: "Stored value removed. Environment fallback, if present, remains active." });
}));

router.post("/admin/settings/check", requireAdmin, asyncHandler(async (req, res) => {
  const key = String(req.body.key || "");
  const config = await getRuntimeConfig();
  const result = await verifyCredential(key, config);
  await recordAdminAudit(req, {
    action: "admin.credential.test",
    target: key,
    outcome: result.status === "error" ? "failure" : "success",
  });
  return res.status(result.status === "error" ? 502 : 200).json(result);
}));

router.get("/admin/security", requireAdmin, (req, res) => {
  res.set("Cache-Control", "no-store, private");
  return res.render("admin-security", {
    csrfToken: req.csrfToken(),
    mfaEnabled: req.adminUser.adminMfaEnabled === true,
    message: "",
  });
});

router.post("/admin/security/mfa/setup", requireAdmin, asyncHandler(async (req, res) => {
  if (!hasEncryptionKey()) {
    return res.status(503).json({ status: false, message: "MFA secret encryption key configured নেই।" });
  }
  const admin = await User.findById(req.adminUser._id).select("password adminMfaEnabled username");
  if (!admin || admin.adminMfaEnabled) {
    return res.status(409).json({ status: false, message: "MFA আগে থেকেই চালু আছে অথবা admin পাওয়া যায়নি।" });
  }
  const passwordValid = await bcryptjs.compare(String(req.body.password || ""), admin.password || "");
  if (!passwordValid) {
    await recordAdminAudit(req, { action: "admin.mfa.setup", outcome: "failure" });
    return res.status(403).json({ status: false, message: "বর্তমান password সঠিক নয়।" });
  }

  const secret = generateTotpSecret();
  await User.updateOne(
    { _id: admin._id, isAdmin: true },
    {
      $set: {
        adminMfaPendingSecret: encryptValue(secret),
        adminMfaPendingExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    }
  );
  await recordAdminAudit(req, { action: "admin.mfa.setup", target: "enrollment-started" });
  return res.json({
    status: true,
    secret,
    uri: createTotpUri(secret, admin.username),
    expiresInMinutes: 10,
  });
}));

router.post("/admin/security/mfa/confirm", requireAdmin, asyncHandler(async (req, res) => {
  const admin = await User.findById(req.adminUser._id)
    .select("adminMfaPendingSecret adminMfaPendingExpiresAt username adminMfaEnabled");
  if (!admin?.adminMfaPendingSecret ||
      !admin.adminMfaPendingExpiresAt ||
      admin.adminMfaPendingExpiresAt.getTime() < Date.now() ||
      admin.adminMfaEnabled) {
    return res.status(400).json({ status: false, message: "MFA setup শেষ হয়েছে বা মেয়াদ পার হয়েছে। আবার শুরু করুন।" });
  }
  const attempt = await reserveAdminMfaAttempt(admin._id);
  if (!attempt) {
    return res.status(429).json({ status: false, message: "অনেকবার চেষ্টা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।" });
  }
  const secret = decryptValue(admin.adminMfaPendingSecret);
  const step = verifyTotp(secret, String(req.body.code || ""));
  if (step === null) {
    await recordAdminAudit(req, { action: "admin.mfa.confirm", outcome: "failure" });
    return res.status(400).json({ status: false, message: "Authenticator app-এর ৬ digit code সঠিক নয়।" });
  }

  const recoveryCodes = createRecoveryCodes();
  await User.updateOne(
    { _id: admin._id, adminMfaEnabled: false },
    {
      $set: {
        adminMfaEnabled: true,
        adminMfaSecret: admin.adminMfaPendingSecret,
        adminMfaRecoveryHashes: recoveryCodes.map(hashRecoveryCode),
        adminMfaLastStep: step,
        adminMfaPendingSecret: null,
        adminMfaPendingExpiresAt: null,
      },
    }
  );
  await recordAdminAudit(req, { action: "admin.mfa.enabled" });
  return res.json({ status: true, recoveryCodes });
}));

router.post("/admin/security/mfa/disable", requireAdmin, asyncHandler(async (req, res) => {
  const admin = await User.findById(req.adminUser._id)
    .select("password adminMfaEnabled adminMfaSecret adminMfaRecoveryHashes adminMfaLastStep username");
  const passwordValid = admin && await bcryptjs.compare(String(req.body.password || ""), admin.password || "");
  if (!passwordValid || !admin.adminMfaEnabled) {
    await recordAdminAudit(req, { action: "admin.mfa.disable", outcome: "failure" });
    return res.status(403).json({ status: false, message: "Password সঠিক নয় অথবা MFA চালু নেই।" });
  }

  const attempt = await reserveAdminMfaAttempt(admin._id);
  if (!attempt) {
    return res.status(429).json({ status: false, message: "অনেকবার চেষ্টা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।" });
  }
  let verified = false;
  const step = verifyTotp(decryptValue(admin.adminMfaSecret), String(req.body.code || ""));
  if (step !== null && step > admin.adminMfaLastStep) {
    const consumed = await User.updateOne(
      { _id: admin._id, adminMfaLastStep: { $lt: step } },
      { $set: { adminMfaLastStep: step } }
    );
    verified = consumed.modifiedCount === 1;
  } else if (step === null) {
    const recoveryHash = hashRecoveryCode(String(req.body.code || ""));
    const consumed = await User.updateOne(
      { _id: admin._id, adminMfaRecoveryHashes: recoveryHash },
      { $pull: { adminMfaRecoveryHashes: recoveryHash } }
    );
    verified = consumed.modifiedCount === 1;
  }
  if (!verified) {
    await recordAdminAudit(req, { action: "admin.mfa.disable", outcome: "failure" });
    return res.status(403).json({ status: false, message: "Authenticator বা recovery code সঠিক নয়/ব্যবহৃত হয়েছে।" });
  }
  await User.updateOne(
    { _id: admin._id },
    {
      $set: {
        adminMfaEnabled: false,
        adminMfaSecret: null,
        adminMfaRecoveryHashes: [],
        adminMfaLastStep: -1,
        adminMfaPendingSecret: null,
        adminMfaPendingExpiresAt: null,
      },
    }
  );
  await recordAdminAudit(req, { action: "admin.mfa.disabled" });
  return res.json({ status: true, message: "Admin MFA বন্ধ করা হয়েছে।" });
}));

router.get("/admin/settings/backup", requireAdmin, asyncHandler(async (req, res) => {
  if (!hasEncryptionKey()) {
    return res.status(503).json({ status: false, message: "Encryption key unavailable." });
  }
  const records = await AppSetting.find({ key: { $in: runtimeSettingKeys } })
    .select("key iv authTag ciphertext -_id").lean();
  const backup = createSettingsBackup(records);
  await recordAdminAudit(req, {
    action: "admin.settings.backup",
    details: { recordCount: records.length },
  });
  res.set("Content-Type", "application/json");
  res.set("Content-Disposition", `attachment; filename="better-api-settings-${new Date().toISOString().slice(0, 10)}.json"`);
  return res.json(backup);
}));

router.post("/admin/settings/restore", requireAdmin, asyncHandler(async (req, res) => {
  let validated;
  try {
    validated = validateSettingsBackup(req.body);
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
  for (const record of validated) {
    await AppSetting.updateOne({ key: record.key }, { $set: record }, { upsert: true, runValidators: true });
  }
  await recordAdminAudit(req, {
    action: "admin.settings.restore",
    details: { recordCount: validated.length },
  });
  return res.json({ status: true, restored: validated.length });
}));

router.get("/admin/settings/audit", requireAdmin, asyncHandler(async (req, res) => {
  const records = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(100).lean();
  return res.json({ status: true, records });
}));

module.exports = {
  router,
  requireAdmin,
  buildFields,
  verifyCredential,
  settingGroups,
  credentialSources,
};
