const effects = [
  { id: "neon", name: "Neon Glow", group: "Glow", background: "#101026", fill: "#f3efff", stroke: "#b15cff", glow: "#8d36ff", font: "Arial, sans-serif" },
  { id: "aurora", name: "Aurora Gradient", group: "Glow", background: "#0b1820", fill: "url(#paint)", stroke: "#9fffe3", glow: "#47ffd1", font: "Arial, sans-serif" },
  { id: "cyber", name: "Cyber Grid", group: "Digital", background: "#0c1024", fill: "#73fff4", stroke: "#ef64ff", glow: "#54eaff", font: "monospace" },
  { id: "glitch", name: "Chromatic Shift", group: "Digital", background: "#12101b", fill: "#fff", stroke: "#fafafa", glow: "#ff4388", font: "Arial Black, sans-serif" },
  { id: "gold", name: "Liquid Gold", group: "Metal", background: "#1e1710", fill: "url(#paint)", stroke: "#ffe5a0", glow: "#efaa36", font: "Georgia, serif" },
  { id: "chrome", name: "Silver Chrome", group: "Metal", background: "#171b25", fill: "url(#paint)", stroke: "#e8f2ff", glow: "#a6c8ef", font: "Arial Black, sans-serif" },
  { id: "fire", name: "Ember Flame", group: "Nature", background: "#21100c", fill: "url(#paint)", stroke: "#ffcf77", glow: "#ff4a20", font: "Georgia, serif" },
  { id: "ice", name: "Arctic Ice", group: "Nature", background: "#071a2b", fill: "url(#paint)", stroke: "#c7f5ff", glow: "#46caff", font: "Arial, sans-serif" },
  { id: "rose", name: "Rose Quartz", group: "Soft", background: "#23131c", fill: "url(#paint)", stroke: "#ffd5e8", glow: "#ff78b8", font: "Georgia, serif" },
  { id: "retro", name: "Retro Sunset", group: "Retro", background: "#1a1030", fill: "url(#paint)", stroke: "#ffb24d", glow: "#ff5f91", font: "Arial Black, sans-serif" },
  { id: "comic", name: "Pop Comic", group: "Retro", background: "#fff4d6", fill: "#ffcf28", stroke: "#25203a", glow: "#ff724d", font: "Arial Black, sans-serif" },
  { id: "outline", name: "Outline Studio", group: "Minimal", background: "#f4f5fa", fill: "none", stroke: "#4940aa", glow: "#8d7eff", font: "Arial, sans-serif" },
];

const gradients = {
  aurora: ["#80fff0", "#b98aff", "#ff82bd"],
  gold: ["#fff2bd", "#e9a835", "#fff6cd"],
  chrome: ["#71809b", "#ffffff", "#9db2d8"],
  fire: ["#fff17a", "#ff8a30", "#fa3c32"],
  ice: ["#f4ffff", "#83eaff", "#638cff"],
  rose: ["#fff0fa", "#ff8fbe", "#c59cff"],
  retro: ["#ff5478", "#ffb249", "#fff05b"],
};

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);
}

function getEffect(id) {
  return effects.find((effect) => effect.id === id);
}

function renderEffectSvg({ text, effectId = "neon", secondLine = "" }) {
  const effect = getEffect(effectId);
  if (!effect) throw new Error("Unsupported text effect.");

  const combined = secondLine ? `${text} ${secondLine}` : text;
  const charCount = [...combined].length;
  const width = Math.max(640, Math.min(1400, 240 + charCount * 44));
  const height = secondLine ? 440 : 340;
  const centerX = width / 2;
  const primaryY = secondLine ? 195 : height / 2 + 24;
  const secondaryY = 300;
  const escapedText = escapeXml(text);
  const escapedSecondLine = escapeXml(secondLine);
  const size = Math.max(38, Math.min(118, 1880 / Math.max([...text].length, 8)));
  const secondarySize = Math.max(32, Math.min(88, 1280 / Math.max([...secondLine].length, 8)));
  const stops = gradients[effect.id] || ["#b18cff", "#66d9ff", "#ff8ed0"];

  const gradient = effect.fill.startsWith("url(")
    ? `<linearGradient id="paint" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${stops[0]}"/><stop offset="52%" stop-color="${stops[1]}"/><stop offset="100%" stop-color="${stops[2]}"/></linearGradient>`
    : "";
  const filter = effect.id === "glitch"
    ? `<filter id="glow" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feFlood flood-color="${effect.glow}" result="color"/><feComposite in="color" in2="blur" operator="in" result="soft"/><feMerge><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : `<filter id="glow" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="8" result="blur"/><feFlood flood-color="${effect.glow}" result="color"/><feComposite in="color" in2="blur" operator="in" result="soft"/><feMerge><feMergeNode in="soft"/><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  const glitchLayer = effect.id === "glitch"
    ? `<text x="${centerX + 4}" y="${primaryY + 2}" text-anchor="middle" fill="#42e8ff" opacity=".72" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text><text x="${centerX - 4}" y="${primaryY - 2}" text-anchor="middle" fill="#ff397f" opacity=".72" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapedText} - ${effect.name}"><defs>${gradient}${filter}</defs><rect width="100%" height="100%" rx="28" fill="${effect.background}"/><path d="M0 ${height * .76} C${width * .22} ${height * .62} ${width * .46} ${height * .91} ${width} ${height * .66}" fill="none" stroke="${effect.glow}" stroke-opacity=".14" stroke-width="2"/>${glitchLayer}<text x="${centerX}" y="${primaryY}" text-anchor="middle" fill="${effect.fill}" stroke="${effect.stroke}" stroke-width="${effect.id === "outline" ? 4 : 1.5}" paint-order="stroke" filter="url(#glow)" font-family="${effect.font}" font-size="${size}" font-weight="900" letter-spacing="2">${escapedText}</text>${secondLine ? `<text x="${centerX}" y="${secondaryY}" text-anchor="middle" fill="${effect.fill}" stroke="${effect.stroke}" stroke-width="1" paint-order="stroke" filter="url(#glow)" font-family="${effect.font}" font-size="${secondarySize}" font-weight="800" letter-spacing="1">${escapedSecondLine}</text>` : ""}</svg>`;
}

module.exports = { effects, getEffect, renderEffectSvg };
