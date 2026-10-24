const assert = require("node:assert/strict");
const { test } = require("node:test");
const asyncHandler = require("../lib/async-handler");

test("passes rejected async route errors to Express", async () => {
  const expected = new Error("database unavailable");
  let received;
  const next = (error) => { received = error; };

  await asyncHandler(async () => {
    throw expected;
  })({}, {}, next);

  assert.equal(received, expected);
});

test("passes synchronous route errors to Express", () => {
  const expected = new Error("invalid request");
  let received;
  const next = (error) => { received = error; };

  asyncHandler(() => {
    throw expected;
  })({}, {}, next);

  assert.equal(received, expected);
});

test("does not swallow successful route responses", async () => {
  let sent = false;
  await asyncHandler(async (_req, res) => {
    res.send();
    sent = true;
  })({}, { send: () => {} }, (error) => {
    throw error;
  });

  assert.equal(sent, true);
});
