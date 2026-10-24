const crypto = require("crypto");
const {
  runtimeSettingKeys,
  decryptValue,
  validateSettingInput,
  hasEncryptionKey,
} = require("./runtime-config");

function keyFingerprint(env = process.env) {
  if (!hasEncryptionKey(env)) {
    throw new Error("ADMIN_SETTINGS_ENCRYPTION_KEY is unavailable.");
  }
  return crypto.createHash("sha256")
    .update(env.ADMIN_SETTINGS_ENCRYPTION_KEY)
    .digest("hex")
    .slice(0, 16);
}

function createSettingsBackup(records, env = process.env) {
  for (const record of records) decryptValue(record, env);
  return {
    formatVersion: 1,
    keyFingerprint: keyFingerprint(env),
    createdAt: new Date().toISOString(),
    records: records.map(({ key, iv, authTag, ciphertext }) => ({ key, iv, authTag, ciphertext })),
  };
}

function validateSettingsBackup(backup, env = process.env) {
  if (!hasEncryptionKey(env) || !backup || backup.formatVersion !== 1 ||
      !Array.isArray(backup.records) || backup.records.length > runtimeSettingKeys.length) {
    throw new Error("Backup format or encryption configuration is invalid.");
  }
  if (backup.keyFingerprint !== keyFingerprint(env)) {
    throw new Error("Backup was created with a different encryption key.");
  }

  const seen = new Set();
  return backup.records.map((record) => {
    if (!record || !runtimeSettingKeys.includes(record.key) || seen.has(record.key) ||
        !/^[a-f0-9]{24}$/i.test(record.iv || "") ||
        !/^[a-f0-9]{32}$/i.test(record.authTag || "") ||
        !/^(?:[a-f0-9]{2})*$/i.test(record.ciphertext || "")) {
      throw new Error("Backup contains an unsupported or malformed setting.");
    }
    const value = decryptValue(record, env);
    validateSettingInput(record.key, value);
    seen.add(record.key);
    return { key: record.key, iv: record.iv, authTag: record.authTag, ciphertext: record.ciphertext };
  });
}

module.exports = { keyFingerprint, createSettingsBackup, validateSettingsBackup };
