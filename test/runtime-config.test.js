const assert = require("node:assert/strict");
const { test } = require("node:test");
const AppSetting = require("../model/AppSetting");
const {
  encryptValue,
  decryptValue,
  validateSettingInput,
  saveRuntimeConfig,
  getRuntimeConfig,
  getRuntimeSettingState,
  clearRuntimeSetting,
} = require("../lib/runtime-config");

test("runtime secrets are encrypted and authenticated with the stable master key", () => {
  const env = { ADMIN_SETTINGS_ENCRYPTION_KEY: "a-stable-test-secret-with-at-least-32-characters" };
  const encrypted = encryptValue("private-provider-key", env);
  assert.notEqual(encrypted.ciphertext, Buffer.from("private-provider-key").toString("hex"));
  assert.equal(decryptValue(encrypted, env), "private-provider-key");
  assert.throws(
    () => decryptValue(encrypted, { ADMIN_SETTINGS_ENCRYPTION_KEY: "a-different-stable-secret-with-more-than-32-characters" }),
    /Unsupported state or unable to authenticate data/
  );
});

test("runtime secret encryption refuses a missing or short master key", () => {
  assert.throws(() => encryptValue("secret", {}), /ADMIN_SETTINGS_ENCRYPTION_KEY must be set/);
  assert.throws(
    () => encryptValue("secret", { ADMIN_SETTINGS_ENCRYPTION_KEY: "too-short" }),
    /at least 32 characters/
  );
});

test("runtime config rejects startup-only keys, unsafe URLs, and multiline values", () => {
  assert.throws(() => validateSettingInput("mongodb", "mongodb://localhost"), /Unsupported runtime setting/);
  assert.throws(() => validateSettingInput("LLM_BASE_URL", "http://example.com"), /HTTPS URL/);
  assert.throws(() => validateSettingInput("GEMINI_API_KEY", "one\ntwo"), /single-line value/);
  assert.doesNotThrow(() => validateSettingInput("LLM_BASE_URL", "https://llm.example.com/v1/chat/completions"));
});

test("runtime config saves once, uses encrypted storage, and returns state without secret values", async (t) => {
  const originalFind = AppSetting.find;
  const originalUpdateOne = AppSetting.updateOne;
  const originalDeleteOne = AppSetting.deleteOne;
  const originalEncryptionKey = process.env.ADMIN_SETTINGS_ENCRYPTION_KEY;
  const geminiFallback = process.env.GEMINI_API_KEY || "";
  const records = new Map();
  process.env.ADMIN_SETTINGS_ENCRYPTION_KEY = "stable-runtime-settings-test-key-with-more-than-32-characters";
  t.after(() => {
    AppSetting.find = originalFind;
    AppSetting.updateOne = originalUpdateOne;
    AppSetting.deleteOne = originalDeleteOne;
    if (originalEncryptionKey === undefined) delete process.env.ADMIN_SETTINGS_ENCRYPTION_KEY;
    else process.env.ADMIN_SETTINGS_ENCRYPTION_KEY = originalEncryptionKey;
  });

  AppSetting.find = () => ({
    select() { return this; },
    lean: async () => [...records.values()],
  });
  AppSetting.updateOne = async (filter, update) => {
    records.set(filter.key, { key: filter.key, ...update.$set });
  };
  AppSetting.deleteOne = async ({ key }) => {
    records.delete(key);
  };

  const changed = await saveRuntimeConfig({
    GEMINI_API_KEY: "private-key-value",
    OPENROUTER_SITE_URL: "https://example.com",
    mongodb: "mongodb://must-not-be-saved",
  });
  assert.deepEqual(changed, ["GEMINI_API_KEY", "OPENROUTER_SITE_URL"]);
  assert.doesNotMatch(JSON.stringify(records.get("GEMINI_API_KEY")), /private-key-value/);

  const config = await getRuntimeConfig();
  assert.equal(config.GEMINI_API_KEY, "private-key-value");
  assert.equal(config.OPENROUTER_SITE_URL, "https://example.com");
  assert.equal(config.mongodb, undefined);

  const state = await getRuntimeSettingState();
  assert.equal(state.find((entry) => entry.key === "GEMINI_API_KEY").configured, true);
  assert.equal(JSON.stringify(state).includes("private-key-value"), false);

  await saveRuntimeConfig({ OPENAI_API_KEY: "another-secret" });
  assert.equal((await getRuntimeConfig()).GEMINI_API_KEY, "private-key-value");
  await clearRuntimeSetting("GEMINI_API_KEY");
  assert.equal((await getRuntimeConfig()).GEMINI_API_KEY, geminiFallback);
});
