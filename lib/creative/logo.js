const { escapeXml } = require("../text-effects");

const styles = [
  { id: "monogram", name: "Monogram", color: "#a98bff", dark: "#222044", shape: "circle" },
  { id: "shield", name: "Shield Crest", color: "#62e9d4", dark: "#112b32", shape: "shield" },
  { id: "orbit", name: "Orbit Mark", color: "#ff87bd", dark: "#321c36", shape: "orbit" },
  { id: "hexagon", name: "Hex Badge", color: "#ffc368", dark: "#362416", shape: "hexagon" },
  { id: "seal", name: "Round Seal", color: "#9ed4ff", dark: "#172b40", shape: "seal" },
  { id: "wave", name: "Wave Wordmark", color: "#74f2cf", dark: "#102c2c", shape: "wave" },
];

function getLogoStyle(id) {
  return styles.find((style) => style.id === id);
}

function logoMark(style, initials) {
  const label = escapeXml(initials);
  if (style.shape === "shield") {
    return `<path d="M150 38 232 68v65c0 49-35 83-82 105-47-22-82-56-82-105V68z" fill="${style.dark}" stroke="${style.color}" stroke-width="6"/><text x="150" y="151" text-anchor="middle" dominant-baseline="middle" fill="${style.color}" font-size="55" font-weight="900" font-family="Arial,sans-serif">${label}</text>`;
  }
  if (style.shape === "orbit") {
    return `<circle cx="150" cy="125" r="67" fill="${style.dark}" stroke="${style.color}" stroke-width="5"/><ellipse cx="150" cy="125" rx="110" ry="37" fill="none" stroke="${style.color}" stroke-width="5" transform="rotate(-25 150 125)"/><circle cx="249" cy="79" r="9" fill="${style.color}"/><text x="150" y="132" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="51" font-weight="900" font-family="Arial,sans-serif">${label}</text>`;
  }
  if (style.shape === "hexagon") {
    return `<path d="m150 31 87 50v100l-87 50-87-50V81z" fill="${style.dark}" stroke="${style.color}" stroke-width="6"/><text x="150" y="135" text-anchor="middle" dominant-baseline="middle" fill="${style.color}" font-size="55" font-weight="900" font-family="Arial,sans-serif">${label}</text>`;
  }
  if (style.shape === "seal") {
    return `<circle cx="150" cy="125" r="91" fill="${style.dark}" stroke="${style.color}" stroke-width="5" stroke-dasharray="7 6"/><circle cx="150" cy="125" r="71" fill="none" stroke="${style.color}" stroke-opacity=".55" stroke-width="2"/><text x="150" y="132" text-anchor="middle" dominant-baseline="middle" fill="${style.color}" font-size="54" font-weight="900" font-family="Georgia,serif">${label}</text>`;
  }
  if (style.shape === "wave") {
    return `<path d="M53 134c37-50 73 50 110 0s73 50 110 0" fill="none" stroke="${style.color}" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="125" r="82" fill="none" stroke="${style.color}" stroke-opacity=".35" stroke-width="3"/><text x="150" y="141" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="54" font-weight="900" font-family="Arial,sans-serif">${label}</text>`;
  }
  return `<circle cx="150" cy="125" r="88" fill="${style.dark}" stroke="${style.color}" stroke-width="6"/><circle cx="150" cy="125" r="73" fill="none" stroke="${style.color}" stroke-opacity=".42" stroke-width="2"/><text x="150" y="132" text-anchor="middle" dominant-baseline="middle" fill="${style.color}" font-size="55" font-weight="900" font-family="Arial,sans-serif">${label}</text>`;
}

function renderLogoSvg({ text, tagline = "", styleId = "monogram" }) {
  const style = getLogoStyle(styleId);
  if (!style) throw new Error("Unsupported logo style.");

  const title = escapeXml(text);
  const subtitle = escapeXml(tagline);
  const initials = text.trim().split(/\s+/).map((word) => [...word][0]).join("").slice(0, 3).toUpperCase();
  const wordSize = Math.max(30, Math.min(72, 860 / Math.max([...text].length, 10)));
  const wordmark = style.shape === "wave"
    ? `<text x="300" y="157" fill="${style.color}" font-size="${wordSize}" font-weight="900" font-family="Arial,sans-serif" letter-spacing="2">${title}</text>`
    : `<text x="300" y="145" fill="#fff" font-size="${wordSize}" font-weight="900" font-family="Arial,sans-serif" letter-spacing="1">${title}</text>`;
  const taglineText = subtitle
    ? `<text x="304" y="199" fill="#b8c2d6" font-size="22" font-family="Arial,sans-serif" letter-spacing="3">${subtitle}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="300" viewBox="0 0 1000 300" role="img" aria-label="${title} ${style.name} logo"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101425"/><stop offset="1" stop-color="${style.dark}"/></linearGradient></defs><rect width="1000" height="300" rx="28" fill="url(#bg)"/><path d="M285 45v210" stroke="${style.color}" stroke-opacity=".34" stroke-width="2"/>${logoMark(style, initials || "M")}${wordmark}${taglineText}</svg>`;
}

module.exports = { styles, getLogoStyle, renderLogoSvg };
