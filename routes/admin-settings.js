const express = require("express");
const nodemailer = require("nodemailer");
const User = require("../model/user");
const asyncHandler = require("../lib/async-handler");
const { createAdminGuard } = require("../lib/admin-access");
const logger = require("../lib/logger");
const {
  runtimeSettingKeys,
  getRuntimeConfig,
  saveRuntimeConfig,
  clearRuntimeSetting,
  getRuntimeSettingState,
  hasEncryptionKey,
} = require("../lib/runtime-config");

const router = express.Router();
const requireAdmin = createAdminGuard((id) =>
  User.findById(id).select("username isAdmin isVerified").lean()
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
];

function buildFields(state) {
  const stateByKey = new Map(state.map((entry) => [entry.key, entry]));
  return settingGroups.map((group) => ({
    ...group,
    fields: group.fields.map(([key, label, hint]) => ({
      key,
      label,
      hint,
      secret: stateByKey.get(key)?.secret || false,
      configured: stateByKey.get(key)?.configured || false,
      source: stateByKey.get(key)?.source || "missing",
      type: key.includes("URL") || key === "LLM_BASE_URL" ? "url" :
        key === "LLM_MODEL" || key === "servicesmtp" || key === "domain" ||
        key === "fromsendemail" || key === "sendemail" ? "text" : "password",
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
  res.render("admin-settings", {
    csrfToken: req.csrfToken(),
    groups: buildFields(state),
    encryptionReady,
    message: req.query.saved === "1" ? "Settings encrypted and saved." : "",
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
  logger.info(`Admin ${req.adminUser.username} cleared runtime setting ${key}.`);
  return res.json({ status: true, message: "Stored value removed. Environment fallback, if present, remains active." });
}));

router.post("/admin/settings/check", requireAdmin, asyncHandler(async (req, res) => {
  const key = String(req.body.key || "");
  const config = await getRuntimeConfig();
  const result = await verifyCredential(key, config);
  return res.status(result.status === "error" ? 502 : 200).json(result);
}));

module.exports = { router, requireAdmin, buildFields, verifyCredential, settingGroups };
