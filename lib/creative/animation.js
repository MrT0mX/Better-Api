const { escapeXml } = require("../text-effects");

const motions = [
  { id: "pulse", name: "Soft Pulse", color: "#ba91ff", animation: "pulse 2.2s ease-in-out infinite" },
  { id: "float", name: "Float", color: "#64e9d4", animation: "float 3s ease-in-out infinite" },
  { id: "shimmer", name: "Shimmer", color: "#ffc96d", animation: "shimmer 2.4s linear infinite" },
  { id: "bounce", name: "Bounce", color: "#ff7db1", animation: "bounce 1.8s ease-in-out infinite" },
];

function getMotion(id) {
  return motions.find((motion) => motion.id === id);
}

function renderAnimatedSvg({ text, motionId = "pulse" }) {
  const motion = getMotion(motionId);
  if (!motion) throw new Error("Unsupported animation.");
  const escapedText = escapeXml(text);
  const size = Math.max(38, Math.min(112, 1700 / Math.max([...text].length, 8)));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300" role="img" aria-label="Animated text: ${escapedText}"><defs><linearGradient id="animated-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="${motion.color}"/><stop offset="1" stop-color="#73caff"/></linearGradient><filter id="animated-glow" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="9" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><style>@keyframes pulse{50%{opacity:.62;transform:scale(.97)}}@keyframes float{50%{transform:translateY(-13px)}}@keyframes shimmer{0%{filter:hue-rotate(0deg);opacity:.8}50%{filter:hue-rotate(55deg);opacity:1}100%{filter:hue-rotate(0deg);opacity:.8}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}.animated{transform-box:fill-box;transform-origin:center;animation:${motion.animation};filter:url(#animated-glow)}</style><rect width="900" height="300" rx="28" fill="#101425"/><path d="M0 245Q220 170 450 245T900 210" fill="none" stroke="${motion.color}" stroke-opacity=".22" stroke-width="3"/><text class="animated" x="450" y="165" text-anchor="middle" dominant-baseline="middle" fill="url(#animated-fill)" stroke="#fff" stroke-opacity=".35" stroke-width="1" paint-order="stroke" font-family="Arial Black,Arial,sans-serif" font-size="${size}" font-weight="900" letter-spacing="2">${escapedText}</text></svg>`;
}

module.exports = { motions, getMotion, renderAnimatedSvg };
