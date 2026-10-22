const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAdminGuard } = require("../lib/admin-access");

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    set(key, value) { this.headers[key] = value; return this; },
    status(value) { this.statusCode = value; return this; },
    send(value) { this.body = value; return this; },
    redirect(value) { this.redirectTo = value; return this; },
  };
}

test("admin settings guard redirects anonymous visitors", async () => {
  const guard = createAdminGuard(async () => null);
  const res = makeResponse();
  await guard({ isAuthenticated: () => false }, res, () => assert.fail("must not continue"));
  assert.equal(res.redirectTo, "/login");
});

test("admin settings guard denies normal or unverified accounts", async () => {
  for (const user of [
    { isAdmin: false, isVerified: true },
    { isAdmin: true, isVerified: false },
    null,
  ]) {
    const guard = createAdminGuard(async () => user);
    const res = makeResponse();
    await guard({ isAuthenticated: () => true, user: { id: "account-id" } }, res, () => assert.fail("must not continue"));
    assert.equal(res.statusCode, 403);
    assert.equal(res.headers["Cache-Control"], "no-store");
  }
});

test("admin settings guard rechecks database role and marks the response private", async () => {
  const account = { id: "admin-id", isAdmin: true, isVerified: true };
  const guard = createAdminGuard(async (id) => {
    assert.equal(id, "admin-id");
    return account;
  });

  test("admin settings guard logs out sessions that have not completed enabled MFA", async () => {
    const account = { id: "admin-id", isAdmin: true, isVerified: true, adminMfaEnabled: true };
    const guard = createAdminGuard(async () => account);
    const req = {
      isAuthenticated: () => true,
      user: { id: "admin-id" },
      session: {},
      logout(callback) { this.loggedOut = true; callback(); },
    };
    const res = makeResponse();
    await guard(req, res, () => assert.fail("MFA must be required"));
    assert.equal(req.loggedOut, true);
    assert.equal(res.redirectTo, "/login");
  });
  const req = { isAuthenticated: () => true, user: { id: "admin-id", isAdmin: false } };
  const res = makeResponse();
  let nextCalls = 0;
  await guard(req, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(req.adminUser, account);
  assert.equal(res.headers["Cache-Control"], "no-store, private");
});
