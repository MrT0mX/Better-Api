const assert = require("node:assert/strict");
const { test } = require("node:test");
const { isAuthorizedCronRequest } = require("../routes/maintenance");

test("Vercel cron authorization compares the complete bearer secret", (t) => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "a-long-test-cron-secret-value";
  t.after(() => {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  });

  assert.equal(
    isAuthorizedCronRequest({ get: () => "Bearer a-long-test-cron-secret-value" }),
    true
  );
  assert.equal(
    isAuthorizedCronRequest({ get: () => "Bearer a-long-test-cron-secret-valuE" }),
    false
  );
  assert.equal(
    isAuthorizedCronRequest({ get: () => "a-long-test-cron-secret-value" }),
    false
  );
});

test("Vercel cron authorization denies access when the secret is unset", (t) => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  t.after(() => {
    if (previous !== undefined) process.env.CRON_SECRET = previous;
  });
  assert.equal(isAuthorizedCronRequest({ get: () => "Bearer anything" }), false);
});
