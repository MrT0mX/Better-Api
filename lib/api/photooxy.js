const { renderEffectSvg } = require("../text-effects");

const effectsByTemplate = [
  ["realistic-flaming-text-effect-online-197", "fire"],
  ["shadow-text-effect-in-the-sky-394", "shadow"],
  ["create-metallic-text-glow-online-188", "chrome"],
  ["make-naruto-banner-online-free-378", "comic"],
  ["make-wallpaper-battlegrounds-logo-text-146", "block"],
  ["make-quotes-under-grass-376", "flower"],
  ["create-harry-potter-text-on-horror-background-178", "smoke"],
  ["flower-typography-text-effect-164", "flower"],
  ["create-a-picture-of-love-message-377", "rose"],
  ["put-any-text-in-to-coffee-cup-371", "copper"],
  ["butterfly-text-with-reflection-effect-183", "aurora"],
  ["write-stars-text-on-the-night-sky-200", "deepsea"],
  ["carved-wood-effect-online-171", "wood"],
  ["illuminated-metallic-effect-177", "gold"],
  ["sweet-andy-text-online-168", "candy"],
];

function photooxy(url, text) {
  const template = effectsByTemplate.find(([slug]) => url.includes(slug));
  if (!template) throw new Error("Unsupported Photooxy template.");

  const lines = (Array.isArray(text) ? text : [text]).map((value) => String(value ?? "").trim());
  if (!lines[0] || lines.some((line) => [...line].length > 40)) {
    throw new Error("Photooxy text must contain 1 to 40 characters per line.");
  }

  return Buffer.from(renderEffectSvg({
    text: lines[0],
    secondLine: lines[1] || "",
    effectId: template[1],
  }));
}

module.exports = photooxy;
