const catalog = require("./catalog.json");
const { escapeXml, isValidXmlText } = require("../text-effects");

const MAX_TEXT = 42;
const MAX_SUBTEXT = 32;

function findDesign(categoryId, templateId) {
  const category = catalog.find((entry) => entry.id === categoryId);
  if (!category) return null;
  const template = category.templates.find((entry) => entry.id === templateId);
  return template ? { category, template } : null;
}

function renderDesignSvg({ categoryId, templateId, text, subtext = "", intensity = 70, image = "" }) {
  const design = findDesign(categoryId, templateId);
  if (!design) throw new Error("Unknown category or template. See GET /api/creative/catalog.");
  const main = String(text ?? "").trim();
  const second = String(subtext ?? "").trim();
  if (!main || [...main].length > MAX_TEXT || [...second].length > MAX_SUBTEXT) {
    throw new Error(`text is required (maximum ${MAX_TEXT} characters); subtext allows ${MAX_SUBTEXT} characters.`);
  }
  if (!isValidXmlText(main) || !isValidXmlText(second)) {
    throw new Error("Text contains unsupported control characters.");
  }
  if (image && (typeof image !== "string" || image.length > 3_700_000 || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image))) {
    throw new Error("image must be a base64 data URL for PNG, JPEG, or WEBP and stay below 2.7 MB.");
  }

  const { category, template } = design;
  const [a, b, c] = template.colors;
  const [ratioW, ratioH] = category.ratio;
  const width = 1200;
  const height = Math.round(width * ratioH / ratioW);
  const safeMain = escapeXml(main);
  const safeSecond = escapeXml(second);
  const strength = Math.max(20, Math.min(100, Number(intensity) || 70)) / 100;
  const fontSize = Math.min(112, Math.max(42, Math.floor(1040 / Math.max([...main].length, 8))));
  const textY = second ? height * 0.57 : height * 0.55;
  const radius = Math.min(width, height) * 0.28;
  const decorations = category.motif === "frame"
    ? `<rect x="38" y="38" width="${width - 76}" height="${height - 76}" rx="24" fill="none" stroke="${c}" stroke-width="14"/><rect x="65" y="65" width="${width - 130}" height="${height - 130}" rx="14" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="2"/>`
    : category.motif === "confetti" || category.motif === "snow" || category.motif === "hearts"
      ? Array.from({ length: 28 }, (_, index) => {
        const x = 42 + ((index * 197 + 83) % (width - 84));
        const y = 42 + ((index * 131 + 47) % (height - 84));
        const size = 5 + (index % 7) * 2;
        const opacity = (0.22 + (index % 5) * 0.09) * strength;
        return category.motif === "hearts"
          ? `<path d="M${x} ${y + size} C${x - size * 1.5} ${y - size}, ${x - size * 5} ${y + size * 2}, ${x} ${y + size * 5} C${x + size * 5} ${y + size * 2}, ${x + size * 1.5} ${y - size}, ${x} ${y + size}" fill="${c}" opacity="${opacity}"/>`
          : `<circle cx="${x}" cy="${y}" r="${size}" fill="${c}" opacity="${opacity}"/>`;
      }).join("")
      : category.motif === "hud" || category.motif === "banner" || category.motif === "crest"
        ? `<path d="M42 42h120M42 42v120M${width - 42} 42h-120M${width - 42} 42v120M42 ${height - 42}h120M42 ${height - 42}v-120M${width - 42} ${height - 42}h-120M${width - 42} ${height - 42}v-120" fill="none" stroke="${c}" stroke-width="4" opacity=".65"/><circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="none" stroke="${c}" stroke-width="2" opacity=".28"/>`
        : `<circle cx="${width * 0.82}" cy="${height * 0.22}" r="${radius}" fill="${c}" opacity=".14"/><circle cx="${width * 0.16}" cy="${height * 0.82}" r="${radius * 0.7}" fill="${b}" opacity=".18"/>`;

  const pattern = category.motif === "manga"
    ? `<path d="M0 ${height * .12}L${width * .42} ${height * .5}M0 ${height * .27}L${width * .34} ${height * .5}M${width} ${height * .14}L${width * .63} ${height * .5}M${width} ${height * .28}L${width * .68} ${height * .5}" stroke="#fff" stroke-opacity=".13" stroke-width="8"/>`
    : category.motif === "glass"
      ? `<path d="M${width * .68} 0L${width} 0L${width} ${height}Z" fill="#ffffff" opacity=".08"/><path d="M${width * .84} 0L${width} 0L${width} ${height * .63}Z" fill="${c}" opacity=".16"/>`
      : category.motif === "fire"
        ? `<path d="M0 ${height}Q${width * .18} ${height * .62} ${width * .36} ${height}T${width * .72} ${height}T${width} ${height * .82}V${height}Z" fill="${c}" opacity=".22"/>`
        : `<path d="M0 ${height * .82}Q${width * .22} ${height * .65} ${width * .48} ${height * .84}T${width} ${height * .72}V${height}H0Z" fill="${c}" opacity=".14"/>`;

  const subline = safeSecond
    ? `<text x="600" y="${textY + 82}" text-anchor="middle" fill="#ffffff" fill-opacity=".88" font-family="Arial, sans-serif" font-size="32" letter-spacing="5">${safeSecond}</text>`
    : "";
  const label = `${category.en} · ${template.en}`;
  const imageClip = `<clipPath id="photo-window"><rect x="${width * .12}" y="${height * .13}" width="${width * .76}" height="${height * .58}" rx="24"/></clipPath>`;
  const photoLayer = image
    ? `<image href="${image}" x="${width * .12}" y="${height * .13}" width="${width * .76}" height="${height * .58}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo-window)"/><rect x="${width * .12}" y="${height * .13}" width="${width * .76}" height="${height * .58}" rx="24" fill="#08101c" opacity=".16"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient><linearGradient id="type" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="${c}"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>${imageClip}</defs><rect width="1200" height="${height}" fill="url(#bg)"/><circle cx="600" cy="${height * .5}" r="${radius * 1.25}" fill="${c}" opacity=".12" filter="url(#soft)"/>${pattern}${photoLayer}${decorations}<rect x="${width * .07}" y="${height * .1}" width="${width * .86}" height="${height * .8}" rx="28" fill="#08101c" opacity="${image ? ".08" : ".22"}"/><text x="600" y="${textY}" text-anchor="middle" fill="url(#type)" stroke="#10101a" stroke-opacity=".48" stroke-width="3" paint-order="stroke" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900" letter-spacing="2">${safeMain}</text>${subline}<text x="600" y="${height - 48}" text-anchor="middle" fill="#ffffff" fill-opacity=".72" font-family="Arial, sans-serif" font-size="15" letter-spacing="5">${escapeXml(label.toUpperCase())}</text></svg>`;
}

module.exports = { catalog, findDesign, renderDesignSvg };
