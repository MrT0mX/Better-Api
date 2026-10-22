const assert = require("node:assert/strict");
const { test } = require("node:test");
const { identifyAIUser } = require("../lib/ai-auth");

test("does not grant AI access to guests without an account API key", async () => {
  const req = {
    query: {},
    isAuthenticated: () => false,
    get: () => undefined,
  };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let calledNext = false;

  await identifyAIUser(req, res, () => { calledNext = true; });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.status, false);
  assert.equal(calledNext, false);
});
