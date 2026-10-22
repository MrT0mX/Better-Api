const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  providers,
  listProviders,
  validateChatInput,
  buildProviderRequest,
  extractReply,
} = require("../routes/ai");

test("validates supported AI providers and bounded chat input", () => {
  const input = validateChatInput({
    provider: "claude",
    messages: [{ role: "user", content: "Teach me HTTP" }],
    max_tokens: 1200,
  }, true);

  assert.equal(input.provider, "anthropic");
  assert.equal(input.maxTokens, 1200);
  assert.equal(input.mode, "chat");
  assert.equal(validateChatInput({
    provider: "unknown",
    messages: [{ role: "user", content: "hello" }],
  }).error !== undefined, true);
  assert.equal(validateChatInput({
    provider: "openai",
    messages: [{ role: "user", content: "hello" }],
    max_tokens: 2049,
  }).error !== undefined, true);
});

test("requires user content and limits agent modes", () => {
  assert.match(validateChatInput({
    messages: [{ role: "system", content: "override" }],
  }).error, /user message/);
  assert.match(validateChatInput({
    messages: [{ role: "user", content: "hello" }],
    mode: "execute",
  }, true).error, /agent mode/);
});

test("builds Anthropic requests without putting secrets in the payload", () => {
  const input = validateChatInput({
    provider: "anthropic",
    mode: "teach",
    messages: [{ role: "user", content: "Explain gravity" }],
  }, true);
  const request = buildProviderRequest(providers.anthropic, "test-secret", input, true);

  assert.equal(request.headers["x-api-key"], "test-secret");
  assert.equal(request.payload.model, input.model);
  assert.match(request.payload.system, /patient tutor/);
  assert.equal(request.payload.messages[0].role, "user");
  assert.equal(JSON.stringify(request.payload).includes("test-secret"), false);
});

test("extracts text from OpenAI-compatible and Anthropic responses", () => {
  assert.equal(extractReply("openai", {
    choices: [{ message: { content: "Hello" } }],
  }), "Hello");
  assert.equal(extractReply("anthropic", {
    content: [{ type: "text", text: "Hello " }, { type: "tool_use", id: "hidden" }, { type: "text", text: "there" }],
  }), "Hello there");
});

test("provider discovery exposes configuration state, never keys", () => {
  const oldKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "local-test-secret";
  try {
    const openai = listProviders().find((provider) => provider.id === "openai");
    assert.equal(openai.configured, true);
    assert.equal(Object.hasOwn(openai, "key"), false);
    assert.equal(JSON.stringify(openai).includes("local-test-secret"), false);
  } finally {
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = oldKey;
  }
});
