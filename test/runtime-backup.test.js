const assert = require("node:assert/strict");
const { test } = require("node:test");
const { encryptValue } = require("../lib/runtime-config");
const { createSettingsBackup, validateSettingsBackup } = require("../lib/runtime-backup");

test("encrypted settings backup round-trips with the same master key", () => {
  const env = { ADMIN_SETTINGS_ENCRYPTION_KEY: "backup-test-master-key-that-is-at-least-32-characters" };
  const record = { key: "GEMINI_API_KEY", ...encryptValue("private-api-key", env) };
  const backup = createSettingsBackup([record], env);
  assert.equal(JSON.stringify(backup).includes("private-api-key"), false);
  assert.equal(validateSettingsBackup(backup, env)[0].key, "GEMINI_API_KEY");
});

test("encrypted settings backup rejects a different master key and tampering", () => {
  const env = { ADMIN_SETTINGS_ENCRYPTION_KEY: "backup-test-master-key-that-is-at-least-32-characters" };
  const record = { key: "OPENAI_API_KEY", ...encryptValue("private-api-key", env) };
  const backup = createSettingsBackup([record], env);
  const differentKey = { ADMIN_SETTINGS_ENCRYPTION_KEY: "different-master-key-with-at-least-32-characters" };
  assert.throws(() => validateSettingsBackup(backup, differentKey), /different encryption key/);
  const tampered = structuredClone(backup);
  tampered.records[0].ciphertext = "00".repeat(16);
  assert.throws(() => validateSettingsBackup(tampered, env), /authenticate data/);
});
