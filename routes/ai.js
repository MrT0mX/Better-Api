const express = require("express");
const asyncHandler = require("../lib/async-handler");
const { identifyAIUser, reserveAIQuota } = require("../lib/ai-auth");
const logger = require("../lib/logger");
const { getRuntimeConfig } = require("../lib/runtime-config");

const router = express.Router();

const providers = {
  openai: {
    name: "OpenAI",
    key: "OPENAI_API_KEY",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
  },
  gemini: {
    name: "Google Gemini",
    key: "GEMINI_API_KEY",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.5-flash",
  },
  anthropic: {
    name: "Anthropic Claude",
    key: "ANTHROPIC_API_KEY",
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-haiku-20241022",
  },
  openrouter: {
    name: "OpenRouter",
    key: "OPENROUTER_API_KEY",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "openai/gpt-4o-mini",
  },
  deepseek: {
    name: "DeepSeek",
    key: "DEEPSEEK_API_KEY",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
  },
  groq: {
    name: "Groq",
    key: "GROQ_API_KEY",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
  },
  mistral: {
    name: "Mistral",
    key: "MISTRAL_API_KEY",
    url: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
  },
  llm: {
    name: "Custom OpenAI-compatible LLM",
    key: "LLM_API_KEY",
    url: process.env.LLM_BASE_URL || "",
    model: process.env.LLM_MODEL || "custom-model",
  },
};

function normalizeProvider(value) {
  const provider = String(value || "").trim().toLowerCase();
  return provider === "claude" ? "anthropic" : provider;
}

function listProviders(runtimeConfig = process.env) {
  return Object.entries(providers).map(([id, config]) => ({
    id,
    name: config.name,
    configured: Boolean(
      runtimeConfig[config.key]?.trim() &&
      (id !== "llm" || runtimeConfig.LLM_BASE_URL?.trim())
    ),
    defaultModel: id === "llm" ? runtimeConfig.LLM_MODEL || config.model : config.model,
  }));
}

function validateChatInput(body, agentMode = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "JSON request body দিন।" };
  }

  const provider = normalizeProvider(body.provider || "openai");
  if (!providers[provider]) return { error: "সমর্থিত provider: openai, gemini, anthropic/claude, openrouter।" };

  const model = String(body.model || providers[provider].model).trim();
  if (!/^[a-zA-Z0-9_.:/-]{1,100}$/.test(model)) return { error: "model নামটি সঠিক নয়।" };

  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 20) {
    return { error: "messages-এ ১ থেকে ২০টি message দিন।" };
  }

  let totalCharacters = 0;
  const messages = [];
  for (const message of body.messages) {
    if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") {
      return { error: "প্রতিটি message-এ user অথবা assistant role এবং string content দিন।" };
    }
    const content = message.content.trim();
    if (!content || content.length > 12000) return { error: "প্রতিটি message ১ থেকে ১২,০০০ অক্ষরের মধ্যে হতে হবে।" };
    totalCharacters += content.length;
    messages.push({ role: message.role, content });
  }
  if (totalCharacters > 30000) return { error: "একটি অনুরোধে সর্বোচ্চ ৩০,০০০ অক্ষর পাঠানো যাবে।" };
  if (!messages.some((message) => message.role === "user")) return { error: "কমপক্ষে একটি user message দিন।" };

  const maxTokens = Number(body.max_tokens ?? 1024);
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 2048) {
    return { error: "max_tokens ১ থেকে ২০৪৮-এর মধ্যে পূর্ণসংখ্যা হতে হবে।" };
  }

  if (agentMode && body.mode !== undefined && !["chat", "teach"].includes(body.mode)) {
    return { error: "agent mode chat অথবা teach হতে পারে।" };
  }

  return { provider, model, messages, maxTokens, mode: body.mode || "chat" };
}

function buildProviderRequest(config, apiKey, input, agentMode) {
  const messages = [...input.messages];
  if (agentMode) {
    const teachingPrompt = input.mode === "teach"
      ? "Act as a patient tutor. Explain concepts step by step, ask short check-for-understanding questions, and adapt to the learner's stated level. You do not retain or learn from this session after the request."
      : "Act as a helpful, careful assistant. Ask a brief clarifying question when the task is unclear. Do not claim to execute external actions.";
    messages.unshift({ role: "system", content: teachingPrompt });
  }

  const headers = { "Content-Type": "application/json" };
  let payload;
  if (config.key === providers.anthropic.key) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    payload = {
      model: input.model,
      max_tokens: input.maxTokens,
      system: messages.filter((message) => message.role === "system").map((message) => message.content).join("\n"),
      messages: messages.filter((message) => message.role !== "system"),
    };
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
    payload = {
      model: input.model,
      messages,
      max_tokens: input.maxTokens,
    };
  }

  if (config.key === providers.openrouter.key) {
    headers["HTTP-Referer"] = config.siteUrl || process.env.OPENROUTER_SITE_URL || "http://localhost";
    headers["X-Title"] = config.appName || process.env.OPENROUTER_APP_NAME || "MrTomXxX API";
  }

  return { url: config.url, headers, payload };
}

function extractReply(provider, data) {
  if (provider === "anthropic") {
    return (data.content || [])
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }
  return data.choices?.[0]?.message?.content;
}

function prepareChat(agentMode) {
  return asyncHandler(async (req, res, next) => {
    const input = validateChatInput(req.body, agentMode);
    if (input.error) return res.status(400).json({ status: false, message: input.error });

    const runtimeConfig = await getRuntimeConfig();
    const config = providers[input.provider];
    const isConfigured = listProviders(runtimeConfig).find((provider) => provider.id === input.provider)?.configured;
    if (!isConfigured) {
      return res.status(503).json({
        status: false,
        message: input.provider === "llm"
          ? "Custom LLM এখন configure করা নেই। Admin settings-এ LLM_BASE_URL ও LLM_API_KEY দিন।"
          : `${config.name} এখন configure করা নেই। Admin settings থেকে ${config.key} যোগ করুন।`,
      });
    }

    if (input.provider === "llm" && !req.body.model) {
      input.model = runtimeConfig.LLM_MODEL || config.model;
    }
    req.aiRequest = input;
    req.aiRuntimeConfig = runtimeConfig;
    return next();
  });
}

async function handleChat(req, res, agentMode = false) {
  const input = req.aiRequest || validateChatInput(req.body, agentMode);
  if (input.error) return res.status(400).json({ status: false, message: input.error });

  const config = providers[input.provider];
  const runtimeConfig = req.aiRuntimeConfig || await getRuntimeConfig();
  const apiKey = runtimeConfig[config.key]?.trim();
  const providerUrl = input.provider === "llm"
    ? runtimeConfig.LLM_BASE_URL?.trim()
    : config.url;
  if (!providerUrl) {
    return res.status(503).json({
      status: false,
      message: "Custom LLM provider configure করা নেই। সার্ভারে LLM_BASE_URL দিন।",
    });
  }

  const request = buildProviderRequest({
    ...config,
    url: providerUrl,
    siteUrl: runtimeConfig.OPENROUTER_SITE_URL,
    appName: runtimeConfig.OPENROUTER_APP_NAME,
  }, apiKey, input, agentMode);
  let upstream;
  try {
    upstream = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.payload),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    logger.warn(`AI provider ${input.provider} ${timedOut ? "timed out" : "could not be reached"}.`);
    return res.status(timedOut ? 504 : 502).json({
      status: false,
      message: timedOut ? "AI provider উত্তর দিতে বেশি সময় নিয়েছে।" : "AI provider-এ সংযোগ করা যায়নি।",
    });
  }

  if (!upstream.ok) {
    logger.warn(`AI provider ${input.provider} returned HTTP ${upstream.status}.`);
    return res.status(502).json({
      status: false,
      message: "AI provider অনুরোধটি সম্পন্ন করতে পারেনি। provider status ও model configuration পরীক্ষা করুন।",
    });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (error) {
    logger.warn(`AI provider ${input.provider} returned invalid JSON.`);
    return res.status(502).json({ status: false, message: "AI provider-এর response পড়া যায়নি।" });
  }

  const content = extractReply(input.provider, data);
  if (typeof content !== "string" || !content) {
    logger.warn(`AI provider ${input.provider} returned no text content.`);
    return res.status(502).json({ status: false, message: "AI provider কোনো text response দেয়নি।" });
  }

  return res.json({
    status: true,
    provider: input.provider,
    model: input.model,
    result: { role: "assistant", content },
    usage: data.usage || null,
    memory: "stateless",
  });
}

router.get("/api/ai/providers", asyncHandler(async (req, res) => {
  res.json({
    status: true,
    providers: listProviders(await getRuntimeConfig()),
  });
}));

router.post(
  "/api/ai/chat",
  identifyAIUser,
  prepareChat(false),
  reserveAIQuota,
  asyncHandler((req, res) => handleChat(req, res))
);
router.post(
  "/api/agent/chat",
  identifyAIUser,
  prepareChat(true),
  reserveAIQuota,
  asyncHandler((req, res) => handleChat(req, res, true))
);

router.stack.forEach((layer) => {
  if (layer.route) {
    layer.route.stack.forEach((routeLayer) => {
      if (routeLayer.handle.constructor.name === "AsyncFunction") {
        routeLayer.handle = asyncHandler(routeLayer.handle);
      }
    });
  }
});

module.exports = {
  router,
  providers,
  listProviders,
  validateChatInput,
  buildProviderRequest,
  extractReply,
};
