(() => {
  const categories = [
    { id: "panorama", icon: "◉", bn: "৩৬০° প্যানোরামা", en: "360° Panorama", descBn: "চারপাশ ঘুরে দেখা যায় এমন panorama", descEn: "Explore a wide panoramic scene", ratio: [1600, 800], motif: "horizon", templates: [
      { id: "blue-hour", bn: "নীল সন্ধ্যা", en: "Blue Hour", colors: ["#102443", "#247c93", "#e89469"] },
      { id: "golden-orbit", bn: "সোনালি দিগন্ত", en: "Golden Horizon", colors: ["#43264d", "#ee8651", "#ffd06f"] },
      { id: "night-orbit", bn: "নক্ষত্র রাত", en: "Star Orbit", colors: ["#101336", "#313a78", "#8b73ae"] },
    ] },
    { id: "frames", icon: "▣", bn: "ফটো ফ্রেম", en: "Photo Frames", descBn: "ছবির জন্য ফুল, গ্যালারি ও মিনিমাল ফ্রেম", descEn: "Botanical, gallery and clean photo frames", ratio: [1000, 1000], motif: "frame", templates: [
      { id: "botanical", bn: "বোটানিক্যাল", en: "Botanical", colors: ["#14251f", "#49765c", "#d3bd81"] },
      { id: "gallery", bn: "গ্যালারি কার্ড", en: "Gallery Card", colors: ["#20263a", "#596a91", "#d5d7e1"] },
      { id: "sunlit", bn: "রোদেলা জানালা", en: "Sunlit Window", colors: ["#754936", "#d69a61", "#f1d2a0"] },
    ] },
    { id: "birthday", icon: "✳", bn: "জন্মদিন", en: "Birthday Frames", descBn: "কনফেটি, কেক ও শুভেচ্ছা কার্ড", descEn: "Confetti, candles and birthday cards", ratio: [1000, 1200], motif: "confetti", templates: [
      { id: "confetti-pop", bn: "কনফেটি পপ", en: "Confetti Pop", colors: ["#302052", "#853f8d", "#ffbb65"] },
      { id: "candlelight", bn: "ক্যান্ডেল গ্লো", en: "Candle Glow", colors: ["#392234", "#a44d67", "#ffd07c"] },
      { id: "party-paper", bn: "পার্টি পেপার", en: "Party Paper", colors: ["#173a4d", "#297e87", "#74d1bb"] },
    ] },
    { id: "romance", icon: "♡", bn: "ভালোবাসা", en: "Love & Romance", descBn: "হার্ট, ফুল ও চিঠির নকশা", descEn: "Heart, flower and handwritten-note designs", ratio: [1000, 1200], motif: "hearts", templates: [
      { id: "rose-letter", bn: "রোজ লেটার", en: "Rose Letter", colors: ["#3d1e32", "#a6486b", "#f3b7a3"] },
      { id: "heart-bloom", bn: "হার্ট ব্লুম", en: "Heart Bloom", colors: ["#46244c", "#c45d91", "#ffbdcb"] },
      { id: "soft-memory", bn: "সফট মেমোরি", en: "Soft Memory", colors: ["#3c354d", "#947c9e", "#efc5b4"] },
    ] },
    { id: "burning", icon: "♨", bn: "আগুনের ছোঁয়া", en: "Burning Effects", descBn: "এমবার, আগুনের আলো ও উষ্ণ টোন", descEn: "Embers, firelight and warm compositions", ratio: [1200, 900], motif: "fire", templates: [
      { id: "ember-edge", bn: "এমবার এজ", en: "Ember Edge", colors: ["#1d1116", "#72271e", "#ff9b3f"] },
      { id: "solar-flare", bn: "সোলার ফ্লেয়ার", en: "Solar Flare", colors: ["#2a1222", "#b33128", "#ffc35b"] },
      { id: "warm-ash", bn: "ওয়ার্ম অ্যাশ", en: "Warm Ash", colors: ["#17171c", "#61413a", "#ca7651"] },
    ] },
    { id: "glass", icon: "◇", bn: "গ্লাস ও প্রিজম", en: "Glass Effects", descBn: "ফ্রস্টেড, প্রিজম ও আলো ভাঙার নকশা", descEn: "Frosted glass, prisms and refracted light", ratio: [1000, 1000], motif: "glass", templates: [
      { id: "prism-pane", bn: "প্রিজম পেইন", en: "Prism Pane", colors: ["#122d48", "#347d91", "#bf98de"] },
      { id: "frosted", bn: "ফ্রস্টেড গ্লাস", en: "Frosted Glass", colors: ["#243b56", "#6299a9", "#d1e6e3"] },
      { id: "rain-glass", bn: "রেইন গ্লাস", en: "Rain Glass", colors: ["#152137", "#455877", "#99bdd4"] },
    ] },
    { id: "winter", icon: "❄", bn: "শীত ও উৎসব", en: "Winter & Holidays", descBn: "তুষার, আলো ও উৎসবের কার্ড", descEn: "Snowfall, lights and seasonal cards", ratio: [1000, 1200], motif: "snow", templates: [
      { id: "alpine-glow", bn: "আল্পাইন গ্লো", en: "Alpine Glow", colors: ["#132942", "#39718a", "#d5d9e8"] },
      { id: "winter-post", bn: "উইন্টার পোস্ট", en: "Winter Post", colors: ["#173549", "#4d7884", "#edf0dc"] },
      { id: "festive-night", bn: "ফেস্টিভ নাইট", en: "Festive Night", colors: ["#251c47", "#8d405a", "#f0bd75"] },
    ] },
    { id: "art", icon: "▧", bn: "আর্ট ফিল্টার", en: "Art Effects", descBn: "স্কেচ, হাফটোন ও রঙের রূপান্তর", descEn: "Sketch, halftone and color treatments", ratio: [1000, 1000], motif: "art", templates: [
      { id: "ink-sketch", bn: "ইঙ্ক স্কেচ", en: "Ink Sketch", colors: ["#202732", "#617083", "#e2d8c6"], filter: "grayscale(1) contrast(1.35)" },
      { id: "sunset-print", bn: "সানসেট প্রিন্ট", en: "Sunset Print", colors: ["#572c59", "#dc665f", "#ffcf72"], filter: "saturate(.8) sepia(.22)" },
      { id: "cool-duotone", bn: "কুল ডুওটোন", en: "Cool Duotone", colors: ["#142c54", "#376ca1", "#9be0db"], filter: "grayscale(.5) hue-rotate(165deg) saturate(1.4)" },
    ] },
    { id: "text", icon: "Aa", bn: "লোগো ও টেক্সট", en: "Logo & Text", descBn: "ক্রোম, নিয়ন ও এমবসড লেখা", descEn: "Chrome, neon and embossed typography", ratio: [1200, 840], motif: "type", templates: [
      { id: "chrome-type", bn: "ক্রোম টাইপ", en: "Chrome Type", colors: ["#17202d", "#52637a", "#e7f1ff"] },
      { id: "neon-orbit", bn: "নিয়ন অরবিট", en: "Neon Orbit", colors: ["#11112b", "#553a87", "#55e6d2"] },
      { id: "gold-press", bn: "গোল্ড প্রেস", en: "Gold Press", colors: ["#281b17", "#865126", "#f3d28c"] },
    ] },
    { id: "fps", icon: "⌖", bn: "FPS গেম", en: "FPS Arena", descBn: "ট্যাকটিক্যাল ফ্রেম, HUD ও অ্যাভাটার কার্ড", descEn: "Tactical frames, HUD and avatar cards", ratio: [1200, 1000], motif: "hud", templates: [
      { id: "tactical-grid", bn: "ট্যাকটিক্যাল গ্রিড", en: "Tactical Grid", colors: ["#101c26", "#275a5c", "#a8ce83"] },
      { id: "neon-crosshair", bn: "নিয়ন ক্রসহেয়ার", en: "Neon Crosshair", colors: ["#111b35", "#285b89", "#4ce4dc"] },
      { id: "arena-plate", bn: "এরিনা প্লেট", en: "Arena Plate", colors: ["#281b28", "#78384f", "#e79d5d"] },
    ] },
    { id: "fantasy", icon: "✧", bn: "ফ্যান্টাসি র‍্যাঙ্ক", en: "Fantasy Rank", descBn: "অরিজিনাল ক্রেস্ট, র‍্যাঙ্ক ও লোডিং কার্ড", descEn: "Original crests, rank badges and loading cards", ratio: [1000, 1200], motif: "crest", templates: [
      { id: "arcane-crest", bn: "আর্কেন ক্রেস্ট", en: "Arcane Crest", colors: ["#211b46", "#534b9a", "#d4b6ff"] },
      { id: "solar-rank", bn: "সোলার র‍্যাঙ্ক", en: "Solar Rank", colors: ["#36223e", "#a65b62", "#f2c27a"] },
      { id: "moon-guard", bn: "মুন গার্ড", en: "Moon Guard", colors: ["#182644", "#526b9d", "#a9d9eb"] },
    ] },
    { id: "manga", icon: "▤", bn: "মাঙ্গা ও কমিক", en: "Manga & Comics", descBn: "স্পিড লাইন, প্যানেল ও ইঙ্ক টোন", descEn: "Speed lines, comic panels and ink tones", ratio: [1000, 1200], motif: "manga", templates: [
      { id: "speed-panel", bn: "স্পিড প্যানেল", en: "Speed Panel", colors: ["#241d35", "#7c426c", "#f0c3a8"] },
      { id: "ink-burst", bn: "ইঙ্ক বার্স্ট", en: "Ink Burst", colors: ["#1b2634", "#3f697d", "#b7d9dc"] },
      { id: "halftone-pop", bn: "হাফটোন পপ", en: "Halftone Pop", colors: ["#38224e", "#a44979", "#f3bf68"] },
    ] },
    { id: "banner", icon: "▰", bn: "ব্যানার ও কভার", en: "Banners & Covers", descBn: "চ্যানেল, প্রোফাইল ও ওয়াইড কভার", descEn: "Channel headers, profile and wide covers", ratio: [1500, 600], motif: "banner", templates: [
      { id: "aurora-cover", bn: "অরোরা কভার", en: "Aurora Cover", colors: ["#132241", "#385b8b", "#61d2c3"] },
      { id: "creator-deck", bn: "ক্রিয়েটর ডেক", en: "Creator Deck", colors: ["#241a3e", "#67458e", "#e27990"] },
      { id: "minimal-wave", bn: "মিনিমাল ওয়েভ", en: "Minimal Wave", colors: ["#123342", "#317b84", "#bad5ac"] },
    ] },
    { id: "game", icon: "✦", bn: "গেমিং ডিজাইন", en: "Game Designs", descBn: "অরিজিনাল লুট কার্ড, পোর্টাল ও অ্যাভাটার", descEn: "Original loot cards, portals and avatars", ratio: [1000, 1000], motif: "game", templates: [
      { id: "loot-card", bn: "লুট কার্ড", en: "Loot Card", colors: ["#1a2238", "#5165a1", "#e0b86a"] },
      { id: "portal-light", bn: "পোর্টাল লাইট", en: "Portal Light", colors: ["#181741", "#5b3d99", "#69c7ef"] },
      { id: "pixel-relic", bn: "পিক্সেল রেলিক", en: "Pixel Relic", colors: ["#182b2b", "#3c8468", "#d3d875"] },
    ] },
    { id: "other", icon: "✺", bn: "আরও ডিজাইন", en: "More Designs", descBn: "ডাবল এক্সপোজার, ভিন্টেজ ও হোলোগ্রাফিক", descEn: "Double exposure, vintage and holographic styles", ratio: [1200, 840], motif: "other", templates: [
      { id: "holo-sheen", bn: "হোলো শিন", en: "Holo Sheen", colors: ["#18233d", "#58528b", "#8ce4dc"] },
      { id: "paper-memory", bn: "পেপার মেমোরি", en: "Paper Memory", colors: ["#3c2c2b", "#9b6852", "#e8c69b"] },
      { id: "deep-double", bn: "ডিপ ডাবল", en: "Deep Double", colors: ["#141c32", "#335e69", "#bb7198"] },
    ] },
  ];

  const words = {
    bn: { home: "হোম", text: "Text Effects", localBadge: "নিজস্ব নকশা · ব্রাউজারেই তৈরি", kicker: "ORIGINAL CREATIVE TOOLS", hero1: "নিজের ছবি,", hero2: "নিজের সাজে.", heroCopy: "ফ্রেম, টেক্সট আর্ট, ব্যানার ও ভিজ্যুয়াল ইফেক্ট—সব নকশা নিজের মতো তৈরি করুন। আপনার ছবি ব্রাউজারের বাইরে পাঠানো হয় না।", stepOne: "01 / CATEGORY", chooseCategory: "ক্যাটাগরি বেছে নিন", stepTwo: "02 / TEMPLATE", chooseTemplate: "নিজস্ব টেমপ্লেট", stepThree: "03 / PERSONALIZE", personalize: "নিজের মতো সাজান", mainText: "মূল লেখা", subText: "দ্বিতীয় লাইন (ঐচ্ছিক)", uploadPhoto: "নিজের ছবি দিন (ঐচ্ছিক)", uploadHint: "ছবি এখানে রাখুন বা বেছে নিন", changeImage: "ছবি বদলান", removeImage: "ছবি সরান", photoAdjust: "ছবির framing", zoom: "জুম", positionX: "আড়াআড়ি অবস্থান", positionY: "উপর-নিচ অবস্থান", intensity: "ইফেক্টের মাত্রা", livePreview: "LIVE PREVIEW", downloadPng: "PNG ডাউনলোড", reset: "আবার শুরু", privateNote: "ছবি আপনার ডিভাইসেই থাকে", tipTitle: "নিজস্ব design system", tipCopy: "সব preview ব্রাউজারেই তৈরি হয়; বাইরের template service ব্যবহার হয় না।", libraryKicker: "THE DESIGN LIBRARY", libraryTitle: "সব ক্যাটাগরি এক জায়গায়", libraryCopy: "প্রতিটি ক্যাটাগরিতে নিজেদের editable template আছে।", footerNote: "নিজস্ব নকশা · local preview", panoramaHint: "ছবি টেনে panorama ঘোরান", ready: "ব্রাউজারে ডিজাইন তৈরি করতে প্রস্তুত।", photoLoaded: "ছবি যোগ হয়েছে। Preview আপনার ডিভাইসেই তৈরি হচ্ছে।", imageError: "ছবিটি খোলা যায়নি। JPG, PNG বা WEBP ব্যবহার করুন।", fileTooLarge: "ছবিটি ১২ MB-এর চেয়ে বড়। ছোট ছবি বেছে নিন।", downloading: "PNG তৈরি হচ্ছে…", downloaded: "PNG ডাউনলোড হয়েছে।", resetDone: "ডিজাইন reset হয়েছে।", photo: "ছবি যোগ করুন", select: "নির্বাচিত", template: "টেমপ্লেট", uploadTitle: "ছবি আপলোড", mainPlaceholder: "আপনার লেখা", subPlaceholder: "একটি ছোট বার্তা", seeAll: "এই নকশাটি নিন", private: "শুধু আপনার ব্রাউজারেই process হয়" },
    en: { home: "Home", text: "Text Effects", localBadge: "Original designs · rendered in browser", kicker: "ORIGINAL CREATIVE TOOLS", hero1: "Your photo,", hero2: "your own style.", heroCopy: "Build frames, text art, banners and visual effects with original designs. Your photos stay in your browser.", stepOne: "01 / CATEGORY", chooseCategory: "Choose a category", stepTwo: "02 / TEMPLATE", chooseTemplate: "Original templates", stepThree: "03 / PERSONALIZE", personalize: "Make it yours", mainText: "Main text", subText: "Second line (optional)", uploadPhoto: "Add your photo (optional)", uploadHint: "Drop a photo here or choose one", changeImage: "Change photo", removeImage: "Remove photo", photoAdjust: "Photo framing", zoom: "Zoom", positionX: "Horizontal position", positionY: "Vertical position", intensity: "Effect intensity", livePreview: "LIVE PREVIEW", downloadPng: "Download PNG", reset: "Reset design", privateNote: "Photo stays on your device", tipTitle: "Our own design system", tipCopy: "Every preview is drawn in your browser. No third-party template service is used.", libraryKicker: "THE DESIGN LIBRARY", libraryTitle: "All categories in one place", libraryCopy: "Each category includes editable original templates.", footerNote: "Original designs · local preview", panoramaHint: "Drag the image to rotate the panorama", ready: "Ready to create in your browser.", photoLoaded: "Photo added. Preview is rendered on your device.", imageError: "Could not open this image. Choose JPG, PNG or WEBP.", fileTooLarge: "This photo is over 12 MB. Choose a smaller image.", downloading: "Preparing PNG…", downloaded: "PNG downloaded.", resetDone: "Design reset.", photo: "Add a photo", select: "Selected", template: "template", uploadTitle: "Upload image", mainPlaceholder: "Your text", subPlaceholder: "A short message", seeAll: "Use this design", private: "Processed only in your browser" },
  };

  const $ = (selector) => document.querySelector(selector);
  const categoryList = $("#category-list");
  const templateList = $("#template-list");
  const library = $("#category-library");
  const canvas = $("#studio-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const textInput = $("#studio-text");
  const subTextInput = $("#studio-subtext");
  const imageInput = $("#studio-image");
  const uploadDrop = $("#upload-drop");
  const uploadCopy = $("#upload-copy");
  const removeImageButton = $("#remove-image");
  const status = $("#studio-status");
  const intensityInput = $("#studio-intensity");
  const intensityOutput = $("#intensity-value");
  const selectedCategoryTitle = $("#active-category-title");
  const canvasSize = $("#canvas-size");
  const panoramaHint = $("#panorama-hint");
  let language = localStorage.getItem("studio-language") || (navigator.language?.startsWith("bn") ? "bn" : "en");
  let currentCategory = categories[8];
  let currentTemplate = currentCategory.templates[0];
  let photo = null;
  let photoName = "";
  let renderTimer;
  let panoramaDragging = false;
  let panoramaX = 0;
  let panoramaOffset = 0;
  let photoZoom = 1;
  let photoFocusX = 0.5;
  let photoFocusY = 0.5;

  document.body.dataset.theme = localStorage.getItem("site-theme") || "dark";
  $("#studio-theme").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("site-theme", document.body.dataset.theme);
  });

  function t(key) { return words[language][key] || words.en[key] || key; }

  function applyLanguage(next) {
    language = next === "bn" ? "bn" : "en";
    document.documentElement.lang = language;
    $("#studio-language").value = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    textInput.placeholder = t("mainPlaceholder");
    subTextInput.placeholder = t("subPlaceholder");
    uploadCopy.textContent = photo ? t("changeImage") : t("uploadHint");
    renderCategories();
    renderTemplates();
    renderLibrary();
    redraw();
    localStorage.setItem("studio-language", language);
  }

  function addCategoryButton(category, compact = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${compact ? "library-card" : "category-button"}${currentCategory.id === category.id ? " active" : ""}`;
    button.setAttribute("aria-pressed", String(currentCategory.id === category.id));
    const icon = document.createElement("span");
    icon.className = "category-icon";
    icon.textContent = category.icon;
    const copy = document.createElement("span");
    copy.className = "category-copy";
    const name = document.createElement("strong");
    name.textContent = category[language];
    const detail = document.createElement("small");
    detail.textContent = category[language === "bn" ? "descBn" : "descEn"];
    copy.append(name, detail);
    button.append(icon, copy);
    button.addEventListener("click", () => selectCategory(category.id));
    return button;
  }

  function renderCategories() {
    categoryList.replaceChildren(...categories.map((category) => addCategoryButton(category)));
  }

  function renderLibrary() {
    library.replaceChildren(...categories.map((category) => addCategoryButton(category, true)));
  }

  function renderTemplates() {
    templateList.replaceChildren(...currentCategory.templates.map((template) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `template-button${currentTemplate.id === template.id ? " active" : ""}`;
      button.setAttribute("aria-pressed", String(currentTemplate.id === template.id));
      const swatch = document.createElement("span");
      swatch.className = `template-swatch motif-${currentCategory.motif}`;
      swatch.style.setProperty("--tone-a", template.colors[0]);
      swatch.style.setProperty("--tone-b", template.colors[1]);
      swatch.style.setProperty("--tone-c", template.colors[2]);
      const name = document.createElement("strong");
      name.textContent = template[language];
      const hint = document.createElement("small");
      hint.textContent = t("template");
      button.append(swatch, name, hint);
      button.addEventListener("click", () => {
        currentTemplate = template;
        renderTemplates();
        redraw();
      });
      return button;
    }));
  }

  function selectCategory(id) {
    currentCategory = categories.find((category) => category.id === id) || categories[8];
    currentTemplate = currentCategory.templates[0];
    panoramaOffset = 0;
    selectedCategoryTitle.textContent = currentCategory[language];
    canvas.width = currentCategory.ratio[0];
    canvas.height = currentCategory.ratio[1];
    canvasSize.textContent = `${canvas.width} × ${canvas.height}`;
    panoramaHint.hidden = currentCategory.id !== "panorama";
    renderCategories();
    renderTemplates();
    redraw();
  }

  function seededRandom(seed) {
    let state = seed || 1;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawHeart(x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * .3);
    ctx.bezierCurveTo(x - size * .7, y - size * .2, x - size * .5, y - size * .8, x, y - size * .35);
    ctx.bezierCurveTo(x + size * .5, y - size * .8, x + size * .7, y - size * .2, x, y + size * .3);
    ctx.fill();
    ctx.restore();
  }

  function drawSunburst(cx, cy, radius, rays, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let i = 0; i < rays; i += 1) {
      const a = i * Math.PI * 2 / rays;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a - .035) * radius, cy + Math.sin(a - .035) * radius);
      ctx.lineTo(cx + Math.cos(a + .035) * radius, cy + Math.sin(a + .035) * radius);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPattern(seed, alpha) {
    const random = seededRandom(seed);
    const w = canvas.width;
    const h = canvas.height;
    const motif = currentCategory.motif;
    ctx.save();
    ctx.globalAlpha = alpha * .5;
    if (["confetti", "snow", "hearts", "horizon", "crest", "other"].includes(motif)) {
      for (let i = 0; i < 46; i += 1) {
        const x = random() * w, y = random() * h, size = 2 + random() * (motif === "snow" ? 5 : 9);
        const color = currentTemplate.colors[Math.floor(random() * currentTemplate.colors.length)];
        if (motif === "hearts") drawHeart(x, y, size * 2.6, color, 1);
        else if (motif === "confetti") {
          ctx.save(); ctx.translate(x, y); ctx.rotate(random() * Math.PI); ctx.fillStyle = color; ctx.fillRect(-size / 2, -size * 1.7, size, size * 3.4); ctx.restore();
        } else {
          ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
          if (motif === "snow") { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x-size*2,y);ctx.lineTo(x+size*2,y);ctx.moveTo(x,y-size*2);ctx.lineTo(x,y+size*2);ctx.stroke(); }
        }
      }
    }
    if (motif === "manga") drawSunburst(w * .5, h * .5, Math.max(w, h) * .72, 42, currentTemplate.colors[2], .25);
    if (motif === "horizon") {
      const g = ctx.createLinearGradient(0, h * .46, 0, h);
      g.addColorStop(0, "rgba(9,16,35,0)"); g.addColorStop(1, "rgba(9,16,35,.7)");
      ctx.fillStyle = g; ctx.fillRect(0, h * .38, w, h * .62);
      ctx.fillStyle = `rgba(255,230,184,${.28 * alpha})`; ctx.beginPath(); ctx.arc(w * .54, h * .55, h * .11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(244,221,197,${.28 * alpha})`; ctx.lineWidth = 2;
      for (let i=0;i<5;i+=1){ctx.beginPath();ctx.moveTo(0,h*(.72+i*.055));ctx.bezierCurveTo(w*.3,h*(.65+i*.055),w*.65,h*(.79+i*.055),w,h*(.7+i*.055));ctx.stroke();}
    }
    if (motif === "hud" || motif === "banner") {
      ctx.strokeStyle = currentTemplate.colors[2]; ctx.lineWidth = 2;
      const pad = Math.min(w,h)*.055, length = Math.min(w,h)*.14;
      for(const [x,y,sx,sy] of [[pad,pad,1,1],[w-pad,pad,-1,1],[pad,h-pad,1,-1],[w-pad,h-pad,-1,-1]]){
        ctx.beginPath();ctx.moveTo(x,y+sy*length);ctx.lineTo(x,y);ctx.lineTo(x+sx*length,y);ctx.stroke();
      }
      if (motif === "hud") { ctx.beginPath();ctx.arc(w*.5,h*.5,Math.min(w,h)*.08,0,Math.PI*2);ctx.moveTo(w*.5-Math.min(w,h)*.14,h*.5);ctx.lineTo(w*.5+Math.min(w,h)*.14,h*.5);ctx.moveTo(w*.5,h*.5-Math.min(w,h)*.14);ctx.lineTo(w*.5,h*.5+Math.min(w,h)*.14);ctx.stroke(); }
    }
    if (motif === "game" || motif === "crest") {
      ctx.strokeStyle = `rgba(255,255,255,${.18 * alpha})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(w*.5,h*.16);ctx.lineTo(w*.78,h*.34);ctx.lineTo(w*.72,h*.68);ctx.lineTo(w*.5,h*.84);ctx.lineTo(w*.28,h*.68);ctx.lineTo(w*.22,h*.34);ctx.closePath();ctx.stroke();
    }
    if (motif === "glass") {
      for(let i=0;i<8;i+=1){const x=random()*w,y=random()*h,size=(.06+random()*.18)*Math.min(w,h);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size,y-size*.6);ctx.lineTo(x+size*.55,y+size);ctx.closePath();ctx.fillStyle=`rgba(211,244,255,${.025+random()*.055})`;ctx.fill();ctx.strokeStyle=`rgba(211,244,255,${.08*alpha})`;ctx.stroke();}
    }
    if (motif === "fire") {
      for(let i=0;i<28;i+=1){const x=random()*w,y=h*(.74+random()*.27),r=(.015+random()*.045)*w;ctx.fillStyle=`rgba(255,${80+Math.floor(random()*120)},${25+Math.floor(random()*35)},${.06+random()*.15})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
    }
    if (motif === "art") {
      ctx.fillStyle=`rgba(245,232,201,${.12*alpha})`;
      for(let y=10;y<h;y+=14) for(let x=10;x<w;x+=14){if(random()>.48)ctx.fillRect(x,y,1.5,1.5);}
    }
    ctx.restore();
  }

  function drawCover(image, x, y, width, height, offset = 0) {
    const sw = image.width || image.naturalWidth, sh = image.height || image.naturalHeight;
    if (!sw || !sh) return;
    const targetRatio = width / height;
    const sourceRatio = sw / sh;
    let sx = 0, sy = 0, sWidth = sw, sHeight = sh;
    if (sourceRatio > targetRatio) {
      sWidth = sh * targetRatio;
    } else {
      sHeight = sw / targetRatio;
    }
    sWidth /= photoZoom; sHeight /= photoZoom;
    sx = Math.max(0, Math.min(sw - sWidth, (sw - sWidth) * photoFocusX));
    sy = Math.max(0, Math.min(sh - sHeight, (sh - sHeight) * photoFocusY));
    if (currentCategory.id === "panorama") {
      const shift = ((offset % 1) + 1) % 1 * width;
      ctx.drawImage(image, sx, sy, sWidth, sHeight, x + shift, y, width, height);
      ctx.drawImage(image, sx, sy, sWidth, sHeight, x + shift - width, y, width, height);
    } else {
      ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
    }
  }

  function photoBox() {
    const w = canvas.width, h = canvas.height;
    if (currentCategory.id === "panorama") return { x: 0, y: 0, w, h };
    if (currentCategory.id === "banner") return { x: w * .05, y: h * .08, w: w * .9, h: h * .84 };
    if (["frames", "glass", "art", "game"].includes(currentCategory.id)) return { x: w * .13, y: h * .12, w: w * .74, h: h * .66 };
    if (["birthday", "romance", "winter", "fantasy", "manga"].includes(currentCategory.id)) return { x: w * .16, y: h * .10, w: w * .68, h: h * .58 };
    if (currentCategory.id === "fps") return { x: w * .10, y: h * .10, w: w * .80, h: h * .66 };
    return { x: w * .08, y: h * .08, w: w * .84, h: h * .72 };
  }

  function drawPhoto(alpha) {
    if (!photo) return;
    const box = photoBox();
    ctx.save();
    ctx.globalAlpha = .45 + alpha * .55;
    if (currentTemplate.filter) ctx.filter = `${currentTemplate.filter} brightness(${.82 + alpha * .18})`;
    else if (currentCategory.motif === "fire") ctx.filter = `saturate(${1 + alpha * .5}) sepia(${alpha * .22})`;
    else if (currentCategory.motif === "glass") ctx.filter = `saturate(${1 + alpha * .25}) contrast(1.08)`;
    else ctx.filter = "saturate(1.08) contrast(1.03)";
    roundRect(ctx, box.x, box.y, box.w, box.h, currentCategory.id === "panorama" ? 0 : Math.min(box.w, box.h) * .025);
    ctx.clip();
    drawCover(photo, box.x, box.y, box.w, box.h, panoramaOffset);
    const overlay = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
    overlay.addColorStop(0, `rgba(9,11,24,${.04 + alpha * .08})`);
    overlay.addColorStop(.62, "rgba(9,11,24,0)");
    overlay.addColorStop(1, `rgba(9,11,24,${.28 + alpha * .3})`);
    ctx.filter = "none";ctx.fillStyle=overlay;ctx.fillRect(box.x,box.y,box.w,box.h);
    ctx.restore();
    if (currentCategory.motif === "frame" || ["birthday", "romance", "winter", "glass", "fantasy", "game", "art"].includes(currentCategory.id)) {
      ctx.save();ctx.strokeStyle=currentTemplate.colors[2];ctx.globalAlpha=.38+alpha*.52;ctx.lineWidth=Math.max(3,canvas.width*.006);roundRect(ctx,box.x,box.y,box.w,box.h,Math.min(box.w,box.h)*.025);ctx.stroke();ctx.restore();
    }
  }

  function drawFireOverlay(alpha) {
    const w=canvas.width,h=canvas.height;ctx.save();ctx.globalCompositeOperation="screen";
    const glow=ctx.createLinearGradient(0,h*.58,0,h);glow.addColorStop(0,"rgba(244,75,23,0)");glow.addColorStop(.5,`rgba(255,87,27,${.12*alpha})`);glow.addColorStop(1,`rgba(255,184,67,${.46*alpha})`);ctx.fillStyle=glow;ctx.fillRect(0,h*.5,w,h*.5);
    for(let i=0;i<15;i+=1){const x=(i+.5)*w/15;const flameH=h*(.09+((i*29)%11)/100);ctx.beginPath();ctx.moveTo(x-16,h);ctx.quadraticCurveTo(x-5,h-flameH*.55,x,h-flameH);ctx.quadraticCurveTo(x+7,h-flameH*.48,x+17,h);ctx.closePath();ctx.fillStyle=i%2?`rgba(255,104,34,${.18*alpha})`:`rgba(255,194,81,${.16*alpha})`;ctx.fill();}
    ctx.restore();
  }

  function drawTextBlock(alpha) {
    const w=canvas.width,h=canvas.height;
    const main=textInput.value.trim() || (language === "bn" ? "আপনার লেখা" : "YOUR STORY");
    const secondary=subTextInput.value.trim();
    const bottom = ["frames","birthday","romance","winter","fantasy","manga"].includes(currentCategory.id);
    const y = currentCategory.id === "panorama" ? h*.84 : currentCategory.id === "banner" ? h*.56 : bottom ? h*.84 : h*.84;
    const maxWidth=w*(currentCategory.id === "panorama" ? .78 : .82);
    const fontFamily=currentCategory.id === "manga" ? "Impact, 'Arial Black', sans-serif" : currentCategory.id === "romance" || currentCategory.id === "winter" ? "Georgia, serif" : "'Manrope', 'Noto Sans Bengali', sans-serif";
    let size=Math.min(h*.105, w*.085, 98);
    if (currentCategory.id === "banner") size=Math.min(h*.19, 100);
    ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";ctx.globalAlpha=.72+alpha*.28;
    ctx.font=`900 ${size}px ${fontFamily}`;
    while(ctx.measureText(main).width>maxWidth && size>20){size-=2;ctx.font=`900 ${size}px ${fontFamily}`;}
    if (photo || currentCategory.id !== "text") {
      ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=20;ctx.shadowOffsetY=4;
      ctx.strokeStyle="rgba(8,12,26,.62)";ctx.lineWidth=Math.max(4,size*.13);ctx.strokeText(main,w/2,y,maxWidth);
      const textGradient=ctx.createLinearGradient(w*.25,y-size/2,w*.75,y+size/2);textGradient.addColorStop(0,currentTemplate.colors[2]);textGradient.addColorStop(1,"#fff5df");ctx.fillStyle=textGradient;ctx.fillText(main,w/2,y,maxWidth);
    } else {
      ctx.shadowColor=currentTemplate.colors[2];ctx.shadowBlur=26*alpha;ctx.fillStyle="#fff8e9";ctx.fillText(main,w/2,y,maxWidth);
      ctx.strokeStyle=`rgba(255,255,255,${.18*alpha})`;ctx.lineWidth=1.5;ctx.strokeText(main,w/2,y,maxWidth);
    }
    if(secondary){ctx.font=`600 ${Math.max(17,size*.28)}px ${fontFamily}`;ctx.shadowBlur=8*alpha;ctx.fillStyle="rgba(255,255,255,.88)";ctx.fillText(secondary,w/2,y+size*.72,maxWidth);}
    ctx.restore();
  }

  function drawFrame(alpha) {
    const w=canvas.width,h=canvas.height,motif=currentCategory.motif;
    if (["frame","confetti","hearts","snow","glass","crest","game","art"].includes(motif)) {
      ctx.save();ctx.globalAlpha=.36+alpha*.52;ctx.strokeStyle=currentTemplate.colors[2];ctx.lineWidth=Math.max(3,Math.min(w,h)*.008);ctx.strokeRect(w*.035,h*.035,w*.93,h*.93);
      const c=Math.min(w,h)*.08;ctx.lineWidth=Math.max(5,Math.min(w,h)*.015);
      for(const [x,y,sx,sy] of [[w*.05,h*.05,1,1],[w*.95,h*.05,-1,1],[w*.05,h*.95,1,-1],[w*.95,h*.95,-1,-1]]){ctx.beginPath();ctx.moveTo(x,y+sy*c);ctx.lineTo(x,y);ctx.lineTo(x+sx*c,y);ctx.stroke();}
      if(motif==="frame"||motif==="hearts"){drawHeart(w*.11,h*.12,Math.min(w,h)*.065,currentTemplate.colors[2],.8);drawHeart(w*.89,h*.12,Math.min(w,h)*.065,currentTemplate.colors[2],.8);drawHeart(w*.11,h*.88,Math.min(w,h)*.065,currentTemplate.colors[2],.8);drawHeart(w*.89,h*.88,Math.min(w,h)*.065,currentTemplate.colors[2],.8);}
      ctx.restore();
    }
    if(motif==="manga") {ctx.save();ctx.strokeStyle=`rgba(255,255,255,${.8*alpha})`;ctx.lineWidth=5;ctx.strokeRect(w*.045,h*.045,w*.91,h*.91);ctx.fillStyle=`rgba(255,255,255,${.12*alpha})`;ctx.fillRect(w*.05,h*.05,w*.9,h*.9);ctx.restore();}
    if(motif==="banner"){ctx.save();ctx.fillStyle=`rgba(7,12,26,${.22*alpha})`;ctx.beginPath();ctx.moveTo(w*.68,0);ctx.lineTo(w,0);ctx.lineTo(w,h);ctx.lineTo(w*.49,h);ctx.closePath();ctx.fill();ctx.restore();}
  }

  function redraw() {
    const w=canvas.width,h=canvas.height,alpha=Number(intensityInput.value)/100;
    const seed=Array.from(`${currentTemplate.id}:${textInput.value}`).reduce((sum,char)=>sum+char.charCodeAt(0),17);
    const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,currentTemplate.colors[0]);gradient.addColorStop(.56,currentTemplate.colors[1]);gradient.addColorStop(1,currentTemplate.colors[2]);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    const bloom=ctx.createRadialGradient(w*.5,h*.48,0,w*.5,h*.48,Math.max(w,h)*.72);bloom.addColorStop(0,`rgba(255,255,255,${.035+alpha*.07})`);bloom.addColorStop(1,"rgba(4,6,18,.55)");ctx.fillStyle=bloom;ctx.fillRect(0,0,w,h);
    if(currentCategory.motif==="manga") drawSunburst(w*.5,h*.45,Math.max(w,h)*.8,38,"#fff2d1",.08*alpha);
    if(photo) drawPhoto(alpha);
    drawPattern(seed,alpha);
    if(currentCategory.motif==="fire") drawFireOverlay(alpha);
    if(currentCategory.motif==="banner") {ctx.save();ctx.fillStyle="rgba(7,12,26,.34)";ctx.fillRect(0,0,w,h);ctx.restore();}
    drawFrame(alpha);
    drawTextBlock(alpha);
    if(photo){status.textContent=t("photoLoaded");uploadCopy.textContent=t("changeImage");removeImageButton.hidden=false;$("#photo-adjust").hidden=false;}
    else {status.textContent=t("ready");uploadCopy.textContent=t("uploadHint");removeImageButton.hidden=true;$("#photo-adjust").hidden=true;}
    intensityOutput.value=`${Math.round(alpha*100)}%`;
    $("#zoom-value").value=`${Math.round(photoZoom*100)}%`;
  }

  function scheduleDraw() { window.clearTimeout(renderTimer); renderTimer=window.setTimeout(redraw,110); }

  imageInput.addEventListener("change", async () => {
    const file=imageInput.files?.[0];if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){status.textContent=t("imageError");imageInput.value="";return;}
    if(file.size>12*1024*1024){status.textContent=t("fileTooLarge");imageInput.value="";return;}
    try{const next=await createImageBitmap(file);photo?.close?.();photo=next;photoName=file.name.replace(/\.[^.]+$/,"" );photoZoom=1;photoFocusX=.5;photoFocusY=.5;$("#photo-zoom").value="100";$("#photo-x").value="50";$("#photo-y").value="50";redraw();}
    catch{status.textContent=t("imageError");}
  });

  removeImageButton.addEventListener("click",()=>{photo?.close?.();photo=null;photoName="";imageInput.value="";panoramaOffset=0;photoZoom=1;redraw();});
  uploadDrop.addEventListener("dragover",(event)=>{event.preventDefault();uploadDrop.classList.add("dragging");});
  uploadDrop.addEventListener("dragleave",()=>uploadDrop.classList.remove("dragging"));
  uploadDrop.addEventListener("drop",(event)=>{event.preventDefault();uploadDrop.classList.remove("dragging");const file=event.dataTransfer.files?.[0];if(file){const transfer=new DataTransfer();transfer.items.add(file);imageInput.files=transfer.files;imageInput.dispatchEvent(new Event("change",{bubbles:true}));}});
  textInput.addEventListener("input",scheduleDraw);subTextInput.addEventListener("input",scheduleDraw);intensityInput.addEventListener("input",scheduleDraw);
  $("#photo-zoom").addEventListener("input",(event)=>{photoZoom=Number(event.target.value)/100;scheduleDraw();});
  $("#photo-x").addEventListener("input",(event)=>{photoFocusX=Number(event.target.value)/100;scheduleDraw();});
  $("#photo-y").addEventListener("input",(event)=>{photoFocusY=Number(event.target.value)/100;scheduleDraw();});

  const stage=$("#canvas-stage");
  stage.addEventListener("pointerdown",(event)=>{if(currentCategory.id!=="panorama"||!photo)return;panoramaDragging=true;panoramaX=event.clientX;stage.setPointerCapture(event.pointerId);});
  stage.addEventListener("pointermove",(event)=>{if(!panoramaDragging)return;const dx=event.clientX-panoramaX;panoramaX=event.clientX;panoramaOffset=(panoramaOffset-dx/Math.max(1,stage.clientWidth))%1;redraw();});
  stage.addEventListener("pointerup",()=>{panoramaDragging=false;});
  stage.addEventListener("pointercancel",()=>{panoramaDragging=false;});

  $("#download-png").addEventListener("click",()=>{
    status.textContent=t("downloading");
    canvas.toBlob((blob)=>{
      if(!blob){status.textContent=t("imageError");return;}
      const url=URL.createObjectURL(blob),anchor=document.createElement("a");
      const slug=(photoName||currentTemplate.id).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,"");
      anchor.href=url;anchor.download=`${currentCategory.id}-${slug||"design"}.png`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=t("downloaded");
    },"image/png");
  });

  $("#reset-design").addEventListener("click",()=>{
    photo?.close?.();photo=null;photoName="";imageInput.value="";textInput.value="YOUR STORY";subTextInput.value="";intensityInput.value="70";panoramaOffset=0;photoZoom=1;photoFocusX=.5;photoFocusY=.5;$("#photo-zoom").value="100";$("#photo-x").value="50";$("#photo-y").value="50";selectCategory("text");status.textContent=t("resetDone");
  });
  $("#studio-language").addEventListener("change",(event)=>applyLanguage(event.target.value));
  $("#studio-year").textContent=new Date().getFullYear();
  renderCategories();renderLibrary();selectCategory(currentCategory.id);applyLanguage(language);
})();
