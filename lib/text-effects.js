const effects = [
  { id: "neon", name: "Neon Glow", group: "Glow", background: "#101026", fill: "#f3efff", stroke: "#b15cff", glow: "#8d36ff", font: "Arial, sans-serif" },
  { id: "aurora", name: "Aurora Gradient", group: "Glow", background: "#0b1820", fill: "url(#paint)", stroke: "#9fffe3", glow: "#47ffd1", font: "Arial, sans-serif" },
  { id: "prism", name: "Prism Light", group: "Glow", background: "#11152b", fill: "url(#paint)", stroke: "#e0d4ff", glow: "#ac76ff", font: "Arial, sans-serif" },
  { id: "deepsea", name: "Deep Sea Glow", group: "Glow", background: "#061d2b", fill: "url(#paint)", stroke: "#b2fff8", glow: "#17c7d6", font: "Arial, sans-serif" },
  { id: "cyber", name: "Cyber Grid", group: "Digital", background: "#0c1024", fill: "#73fff4", stroke: "#ef64ff", glow: "#54eaff", font: "monospace" },
  { id: "glitch", name: "Chromatic Shift", group: "Digital", background: "#12101b", fill: "#fff", stroke: "#fafafa", glow: "#ff4388", font: "Arial Black, sans-serif" },
  { id: "hologram", name: "Hologram", group: "Digital", background: "#0b1c2a", fill: "url(#paint)", stroke: "#c9faff", glow: "#69e8ff", font: "Arial, sans-serif" },
  { id: "matrix", name: "Digital Matrix", group: "Digital", background: "#06160d", fill: "url(#paint)", stroke: "#a3ffb1", glow: "#22e65f", font: "monospace" },
  { id: "pixel", name: "Pixel Arcade", group: "Digital", background: "#17132d", fill: "url(#paint)", stroke: "#fff68d", glow: "#fb4bff", font: "monospace" },
  { id: "gold", name: "Liquid Gold", group: "Metal", background: "#1e1710", fill: "url(#paint)", stroke: "#ffe5a0", glow: "#efaa36", font: "Georgia, serif" },
  { id: "chrome", name: "Silver Chrome", group: "Metal", background: "#171b25", fill: "url(#paint)", stroke: "#e8f2ff", glow: "#a6c8ef", font: "Arial Black, sans-serif" },
  { id: "carbon", name: "Carbon Fiber", group: "Metal", background: "#12151b", fill: "url(#paint)", stroke: "#d4dbe7", glow: "#78859b", font: "Arial Black, sans-serif" },
  { id: "copper", name: "Brushed Copper", group: "Metal", background: "#20130e", fill: "url(#paint)", stroke: "#ffd2ae", glow: "#e7773b", font: "Georgia, serif" },
  { id: "fire", name: "Ember Flame", group: "Nature", background: "#21100c", fill: "url(#paint)", stroke: "#ffcf77", glow: "#ff4a20", font: "Georgia, serif" },
  { id: "ice", name: "Arctic Ice", group: "Nature", background: "#071a2b", fill: "url(#paint)", stroke: "#c7f5ff", glow: "#46caff", font: "Arial, sans-serif" },
  { id: "water", name: "Water Ripple", group: "Nature", background: "#071d2b", fill: "url(#paint)", stroke: "#c7f7ff", glow: "#25bce8", font: "Georgia, serif" },
  { id: "wood", name: "Carved Wood", group: "Nature", background: "#26180f", fill: "url(#paint)", stroke: "#e8c79b", glow: "#aa6b35", font: "Georgia, serif" },
  { id: "flower", name: "Floral Garden", group: "Nature", background: "#211324", fill: "url(#paint)", stroke: "#ffe0f0", glow: "#ee72ae", font: "Georgia, serif" },
  { id: "rose", name: "Rose Quartz", group: "Soft", background: "#23131c", fill: "url(#paint)", stroke: "#ffd5e8", glow: "#ff78b8", font: "Georgia, serif" },
  { id: "glass", name: "Frosted Glass", group: "Soft", background: "#14212e", fill: "url(#paint)", stroke: "#e3f8ff", glow: "#8bd9ef", font: "Arial, sans-serif" },
  { id: "crystal", name: "Crystal Facet", group: "Soft", background: "#17172b", fill: "url(#paint)", stroke: "#f3e5ff", glow: "#bb92ff", font: "Georgia, serif" },
  { id: "retro", name: "Retro Sunset", group: "Retro", background: "#1a1030", fill: "url(#paint)", stroke: "#ffb24d", glow: "#ff5f91", font: "Arial Black, sans-serif" },
  { id: "comic", name: "Pop Comic", group: "Retro", background: "#fff4d6", fill: "#ffcf28", stroke: "#25203a", glow: "#ff724d", font: "Arial Black, sans-serif" },
  { id: "candy", name: "Sugar Candy", group: "Retro", background: "#28122b", fill: "url(#paint)", stroke: "#fff0fb", glow: "#ff6ee6", font: "Arial Black, sans-serif" },
  { id: "extrude", name: "3D Extrusion", group: "3D", background: "#101725", fill: "url(#paint)", stroke: "#edf1ff", glow: "#7487ff", font: "Arial Black, sans-serif" },
  { id: "block", name: "3D Block", group: "3D", background: "#171329", fill: "url(#paint)", stroke: "#f1d6ff", glow: "#b447ff", font: "Arial Black, sans-serif" },
  { id: "shadow", name: "Long Shadow", group: "3D", background: "#e9effb", fill: "#fff", stroke: "#4653a8", glow: "#8793d4", font: "Arial Black, sans-serif" },
  { id: "paper", name: "Paper Cut", group: "Art", background: "#f7e9d4", fill: "url(#paint)", stroke: "#7c4c42", glow: "#bc7355", font: "Georgia, serif" },
  { id: "ink", name: "Ink Stamp", group: "Art", background: "#f3eedf", fill: "url(#paint)", stroke: "#315d50", glow: "#45836b", font: "Georgia, serif" },
  { id: "smoke", name: "Violet Smoke", group: "Art", background: "#171423", fill: "url(#paint)", stroke: "#efddff", glow: "#a573dc", font: "Georgia, serif" },
  { id: "outline", name: "Outline Studio", group: "Minimal", background: "#f4f5fa", fill: "none", stroke: "#4940aa", glow: "#8d7eff", font: "Arial, sans-serif" },
];

const gradients = {
  aurora: ["#80fff0", "#b98aff", "#ff82bd"],
  prism: ["#7afcff", "#a77aff", "#ff80d1"],
  deepsea: ["#afffee", "#22bacc", "#2569d9"],
  hologram: ["#d0fff9", "#5ee2ff", "#a987ff"],
  matrix: ["#c1ffc9", "#37e86c", "#08762e"],
  pixel: ["#ff4cf5", "#ffcf55", "#6fffe7"],
  gold: ["#fff2bd", "#e9a835", "#fff6cd"],
  chrome: ["#71809b", "#ffffff", "#9db2d8"],
  carbon: ["#dfe4ec", "#6b7788", "#f6f7fa"],
  copper: ["#ffe1c6", "#db7441", "#8b3929"],
  fire: ["#fff17a", "#ff8a30", "#fa3c32"],
  ice: ["#f4ffff", "#83eaff", "#638cff"],
  water: ["#d0ffff", "#38bce5", "#3154c9"],
  wood: ["#f3cd8c", "#aa6034", "#653927"],
  flower: ["#fff1c2", "#ff70ba", "#9c75ff"],
  rose: ["#fff0fa", "#ff8fbe", "#c59cff"],
  glass: ["#f3ffff", "#90dff2", "#8d9cff"],
  crystal: ["#ffffff", "#b99cff", "#73d8ff"],
  retro: ["#ff5478", "#ffb249", "#fff05b"],
  candy: ["#ff8ff2", "#fff2fa", "#7ceaff"],
  extrude: ["#dce7ff", "#8a98ff", "#5149b8"],
  block: ["#ffe2ff", "#cb6dff", "#7334bc"],
  paper: ["#fff5d8", "#dca781", "#9c6456"],
  ink: ["#d9edcf", "#498866", "#1f4a3b"],
  smoke: ["#f2dfff", "#b07be7", "#6a4aaf"],
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

function isValidXmlText(value) {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d ||
      codePoint >= 0xd800 && codePoint <= 0xdfff ||
      codePoint === 0xfffe ||
      codePoint === 0xffff
    ) return false;
  }
  return true;
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

  const shadowLayer = effect.id === "shadow"
    ? Array.from({ length: 7 }, (_, index) =>
      `<text x="${centerX + (index + 1) * 9}" y="${primaryY + (index + 1) * 8}" text-anchor="middle" fill="#5966b2" opacity="${0.78 - index * 0.08}" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text>`
    ).join("")
    : "";
  const extrusionLayer = effect.id === "extrude" || effect.id === "block"
    ? Array.from({ length: 8 }, (_, index) =>
      `<text x="${centerX + (index + 1) * 2}" y="${primaryY + (index + 1) * 3}" text-anchor="middle" fill="${effect.id === "block" ? "#58318e" : "#4a5794"}" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text>`
    ).join("")
    : "";
  const texture = effect.id === "carbon"
    ? `<path d="M0 0h${width}v${height}H0z" fill="url(#weave)" opacity=".22"/>`
    : effect.id === "matrix"
      ? `<path d="M0 30h${width}M0 60h${width}M0 90h${width}M0 120h${width}M0 150h${width}" stroke="#36ee70" stroke-opacity=".08" stroke-width="2"/>`
      : effect.id === "paper" || effect.id === "ink"
        ? `<path d="M18 18h${width - 36}v${height - 36}H18z" fill="none" stroke="${effect.stroke}" stroke-opacity=".25" stroke-width="2" stroke-dasharray="${effect.id === "ink" ? "5 6" : "0"}"/>`
        : "";
  const weave = effect.id === "carbon"
    ? `<pattern id="weave" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0h6v6H0zM6 6h6v6H6z" fill="#e3e8f0"/><path d="M6 0h6v6H6zM0 6h6v6H0z" fill="#161b24"/></pattern>`
    : "";
  const glitchLayer = effect.id === "glitch"
    ? `<text x="${centerX + 4}" y="${primaryY + 2}" text-anchor="middle" fill="#42e8ff" opacity=".72" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text><text x="${centerX - 4}" y="${primaryY - 2}" text-anchor="middle" fill="#ff397f" opacity=".72" font-family="${effect.font}" font-size="${size}" font-weight="900">${escapedText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapedText} - ${effect.name}"><defs>${gradient}${weave}${filter}</defs><rect width="100%" height="100%" rx="28" fill="${effect.background}"/>${texture}<path d="M0 ${height * .76} C${width * .22} ${height * .62} ${width * .46} ${height * .91} ${width} ${height * .66}" fill="none" stroke="${effect.glow}" stroke-opacity=".14" stroke-width="2"/>${shadowLayer}${extrusionLayer}${glitchLayer}<text x="${centerX}" y="${primaryY}" text-anchor="middle" fill="${effect.fill}" stroke="${effect.stroke}" stroke-width="${effect.id === "outline" ? 4 : 1.5}" paint-order="stroke" filter="url(#glow)" font-family="${effect.font}" font-size="${size}" font-weight="900" letter-spacing="2">${escapedText}</text>${secondLine ? `<text x="${centerX}" y="${secondaryY}" text-anchor="middle" fill="${effect.fill}" stroke="${effect.stroke}" stroke-width="1" paint-order="stroke" filter="url(#glow)" font-family="${effect.font}" font-size="${secondarySize}" font-weight="800" letter-spacing="1">${escapedSecondLine}</text>` : ""}</svg>`;
}

module.exports = { effects, getEffect, renderEffectSvg, escapeXml, isValidXmlText };
