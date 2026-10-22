const assert = require("node:assert/strict");
const { test } = require("node:test");
const { getAdminConfig } = require("../lib/bootstrap-admin");

test("admin bootstrap is disabled when no admin secrets are configured", () => {
  assert.equal(getAdminConfig({
    ADMIN_USERNAME: "",
    ADMIN_EMAIL: "",
    ADMIN_PASSWORD: "",
  }), null);
});

test("admin bootstrap requires the complete configuration", () => {
  assert.throws(
    () => getAdminConfig({ ADMIN_USERNAME: "mrtomxx", ADMIN_EMAIL: "", ADMIN_PASSWORD: "" }),
    /ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD together/
  );
});

test("admin bootstrap rejects weak or short passwords", () => {
  assert.throws(
    () => getAdminConfig({
      ADMIN_USERNAME: "mrtomxx",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "short1A",
    }),
    /at least 12 characters/
  );
});

test("admin bootstrap validates input and normalizes the email without exposing defaults", () => {
  const config = getAdminConfig({
    ADMIN_USERNAME: "mrtomxx",
    ADMIN_EMAIL: "ADMIN@example.com",
    ADMIN_PASSWORD: "Use-A-New-Secret-123",
  });

  assert.equal(config.username, "mrtomxx");
  assert.equal(config.email, "admin@example.com");
  assert.equal(config.password, "Use-A-New-Secret-123");
  assert.throws(
    () => getAdminConfig({
      ADMIN_USERNAME: "mrtomxx",
      ADMIN_EMAIL: "not-an-email",
      ADMIN_PASSWORD: "Use-A-New-Secret-123",
    }),
    /ADMIN_EMAIL must be a valid email/
  );
});
