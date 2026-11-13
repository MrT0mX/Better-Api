const express = require("express");
const createGuestRateLimiter = require("../lib/guest-rate-limit");
const { effects, getEffect, renderEffectSvg, isValidXmlText } = require("../lib/text-effects");
const { styles: logoStyles, getLogoStyle, renderLogoSvg } = require("../lib/creative/logo");
const { motions, getMotion, renderAnimatedSvg } = require("../lib/creative/animation");
const { listUpstreamStyles } = require("../lib/creative/upstream-catalog");

const router = express.Router();
const guestRateLimit = createGuestRateLimiter({ maxRequests: 30 });

function groupBy(items) {
  return items.reduce((groups, item) => {
    (groups[item.group] ||= []).push(item);
    return groups;
  }, {});
}

function sendSvg(res, svg, filename) {
  res.set({
    "Cache-Control": "public, max-age=300",
    "Content-Disposition": `inline; filename="${filename}.svg"`,
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "X-Content-Type-Options": "nosniff",
  });
  return res.type("image/svg+xml").send(svg);
}

function readText(req, res, { maximum = 28, required = true } = {}) {
  const value = typeof req.query.text === "string" ? req.query.text.trim() : "";
  if (required && !value) {
    res.status(400).json({ status: false, message: "text query parameter is required." });
    return null;
  }
  if (!isValidXmlText(value)) {
    res.status(400).json({ status: false, message: "text contains unsupported control characters." });
    return null;
  }
  if ([...value].length > maximum) {
    res.status(400).json({ status: false, message: `text must be ${maximum} characters or fewer.` });
    return null;
  }
  return value;
}

router.get("/api/creative/styles", (req, res) => {
  res.json({
    status: true,
    guest: true,
    groups: groupBy(effects),
    logoStyles,
    animations: motions,
  });
});

router.get("/api/textpro/styles", (req, res) => {
  res.json(listUpstreamStyles("textpro"));
});

router.get("/api/photooxy/styles", (req, res) => {
  res.json(listUpstreamStyles("photooxy"));
});

router.get("/api/creative/text/render", guestRateLimit, (req, res) => {
  const text = readText(req, res);
  if (text === null) return;
  const secondLine = typeof req.query.text2 === "string" ? req.query.text2.trim() : "";
  if ([...secondLine].length > 20) {
    return res.status(400).json({ status: false, message: "text2 must be 20 characters or fewer." });
  }
  const styleId = typeof req.query.style === "string" ? req.query.style.trim().toLowerCase() : "neon";
  if (!getEffect(styleId)) {
    return res.status(400).json({ status: false, message: "Unknown text style. See GET /api/creative/styles." });
  }
  return sendSvg(res, renderEffectSvg({ text, secondLine, effectId: styleId }), `${styleId}-text`);
});

router.get("/api/creative/logo/render", guestRateLimit, (req, res) => {
  const text = readText(req, res, { maximum: 24 });
  if (text === null) return;
  const tagline = typeof req.query.tagline === "string" ? req.query.tagline.trim() : "";
  if ([...tagline].length > 32 || !isValidXmlText(tagline)) {
    return res.status(400).json({ status: false, message: "tagline must be 32 characters or fewer." });
  }
  const styleId = typeof req.query.style === "string" ? req.query.style.trim().toLowerCase() : "monogram";
  if (!getLogoStyle(styleId)) {
    return res.status(400).json({ status: false, message: "Unknown logo style. See GET /api/creative/styles." });
  }
  return sendSvg(res, renderLogoSvg({ text, tagline, styleId }), `${styleId}-logo`);
});

router.get("/api/creative/animation/render", guestRateLimit, (req, res) => {
  const text = readText(req, res, { maximum: 24 });
  if (text === null) return;
  const motionId = typeof req.query.motion === "string" ? req.query.motion.trim().toLowerCase() : "pulse";
  if (!getMotion(motionId)) {
    return res.status(400).json({ status: false, message: "Unknown animation. See GET /api/creative/styles." });
  }
  return sendSvg(res, renderAnimatedSvg({ text, motionId }), `${motionId}-animation`);
});

module.exports = router;
