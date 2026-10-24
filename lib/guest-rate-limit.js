function createGuestRateLimiter({ windowMs = 60_000, maxRequests = 30 } = {}) {
  const requests = new Map();
  let calls = 0;

  return function guestRateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = requests.get(key);

    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
    } else if (current.count >= maxRequests) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({
        status: false,
        message: "Guest request limit reached. Try again shortly or create an account.",
      });
    } else {
      current.count += 1;
    }

    calls += 1;
    if (calls % 100 === 0) {
      for (const [address, limit] of requests) {
        if (limit.resetAt <= now) requests.delete(address);
      }
    }

    return next();
  };
}

module.exports = createGuestRateLimiter;
