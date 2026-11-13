const express = require("express");
const createGuestRateLimiter = require("../lib/guest-rate-limit");
const { effects, getEffect, renderEffectSvg, isValidXmlText } = require("../lib/text-effects");

const router = express.Router();
const guestRateLimit = createGuestRateLimiter({ maxRequests: 30 });

router.get("/effects", (req, res) => {
  res.render("effects");
});

router.get("/api/text-effects/styles", (req, res) => {
  const groups = effects.reduce((result, effect) => {
    (result[effect.group] ||= []).push(effect);
    return result;
  }, {});
  res.json({ status: true, guest: true, groups });
});

router.get("/api/text-effects/render", guestRateLimit, (req, res) => {
  const text = typeof req.query.text === "string" ? req.query.text.trim() : "";
  const secondLine = typeof req.query.text2 === "string" ? req.query.text2.trim() : "";
  const effectId = typeof req.query.effect === "string" ? req.query.effect.trim().toLowerCase() : "neon";

  if (!text) {
    return res.status(400).json({ status: false, message: "text query parameter is required." });
  }
  if (!isValidXmlText(text) || !isValidXmlText(secondLine)) {
    return res.status(400).json({ status: false, message: "Text contains unsupported control characters." });
  }
  if ([...text].length > 28 || [...secondLine].length > 20) {
    return res.status(400).json({ status: false, message: "Text is too long (maximum 28 characters per line)." });
  }

  const effect = getEffect(effectId);
  if (!effect) {
    return res.status(400).json({
      status: false,
      message: "Unsupported effect. See GET /api/text-effects/styles.",
    });
  }

  const svg = renderEffectSvg({ text, secondLine, effectId });
  res.set({
    "Cache-Control": "public, max-age=300",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "X-Content-Type-Options": "nosniff",
  });
  return res.type("image/svg+xml").send(svg);
});

module.exports = router;
