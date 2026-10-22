const assert = require("node:assert/strict");
const { test } = require("node:test");
const createGuestRateLimiter = require("../lib/guest-rate-limit");

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    set(key, value) { this.headers[key] = value; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("limits guest previews by IP and returns retry guidance", () => {
  const limiter = createGuestRateLimiter({ windowMs: 60_000, maxRequests: 1 });
  const req = { ip: "guest-a", socket: {} };
  let nextCalls = 0;

  limiter(req, makeResponse(), () => { nextCalls += 1; });
  const response = makeResponse();
  limiter(req, response, () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers["Retry-After"], "60");
  assert.match(response.body.message, /Guest request limit/);
});

test("keeps guest limits isolated between clients", () => {
  const limiter = createGuestRateLimiter({ maxRequests: 1 });
  const first = makeResponse();
  const second = makeResponse();
  let nextCalls = 0;

  limiter({ ip: "guest-a", socket: {} }, first, () => { nextCalls += 1; });
  limiter({ ip: "guest-b", socket: {} }, second, () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
});
