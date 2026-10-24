const assert = require("node:assert/strict");
const { test } = require("node:test");
const { sanitizeAuditDetails } = require("../lib/admin-audit");

test("admin audit details preserve safe metadata and redact secrets", () => {
  const details = sanitizeAuditDetails({
    settingNames: ["OPENAI_API_KEY", "AI_USER_PER_MINUTE_LIMIT"],
    outcome: "success",
    password: "do-not-store",
    apiToken: "do-not-store",
    secretValue: "do-not-store",
    credentialContents: "do-not-store",
    count: 3,
  });
  assert.deepEqual(details, {
    settingNames: ["OPENAI_API_KEY", "AI_USER_PER_MINUTE_LIMIT"],
    outcome: "success",
    count: 3,
  });
});
