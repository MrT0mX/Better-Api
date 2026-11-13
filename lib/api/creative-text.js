const { renderEffectSvg } = require("../text-effects");

const localTextStyles = [
  { id: "flaming", name: "Ember Flame", effect: "fire", maxLines: 1 },
  { id: "shadow-sky", name: "Sky Shadow", effect: "shadow", maxLines: 1 },
  { id: "metallic", name: "Liquid Chrome", effect: "chrome", maxLines: 1 },
  { id: "naruto", name: "Anime Burst", effect: "comic", maxLines: 1 },
  { id: "pubg", name: "Arena Badge", effect: "block", maxLines: 2 },
  { id: "under-grass", name: "Botanical Glow", effect: "flower", maxLines: 1 },
  { id: "harry-potter", name: "Wizard Smoke", effect: "smoke", maxLines: 1 },
  { id: "flower-typography", name: "Floral Type", effect: "flower", maxLines: 1 },
  { id: "picture-of-love", name: "Rose Letter", effect: "rose", maxLines: 1 },
  { id: "coffee-cup", name: "Copper Press", effect: "copper", maxLines: 1 },
  { id: "butterfly", name: "Aurora Wing", effect: "aurora", maxLines: 1 },
  { id: "night-sky", name: "Deep Sea Glow", effect: "deepsea", maxLines: 1 },
  { id: "carved-wood", name: "Carved Wood", effect: "wood", maxLines: 1 },
  { id: "illuminated-metallic", name: "Illuminated Gold", effect: "gold", maxLines: 1 },
  { id: "sweet-candy", name: "Sugar Candy", effect: "candy", maxLines: 1 },
];

function listLocalTextStyles() {
  return {
    status: true,
    provider: "Better-Api Original Text Art",
    guest: false,
    styles: localTextStyles.map(({ id, name, maxLines }) => ({
      id,
      name,
      endpoint: `/api/photooxy/${id}`,
      method: "GET",
      requiredQuery: maxLines === 2 ? ["text", "text2"] : ["text"],
      apiKey: "apikey query parameter or x-api-key header",
      output: "image/svg+xml",
    })),
  };
}

async function renderLocalText(styleId, text) {
  const style = localTextStyles.find((entry) => entry.id === styleId);
  if (!style) throw new Error("Unknown original text style.");

  const lines = (Array.isArray(text) ? text : [text]).map((value) => String(value ?? "").trim());
  if (!lines[0] || lines.some((line) => [...line].length > 28)) {
    throw new Error("Text must contain 1 to 28 characters per line.");
  }
  if (style.maxLines === 2 && !lines[1]) {
    throw new Error("Second text line is required for this style.");
  }

  return Buffer.from(renderEffectSvg({
    text: lines[0],
    secondLine: lines[1] || "",
    effectId: style.effect,
  }));
}

module.exports = { localTextStyles, listLocalTextStyles, renderLocalText };
