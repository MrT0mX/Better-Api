(() => {
  const translations = {
    bn: {
      home: "হোম", login: "লগইন", guestFree: "অতিথি মোড · বিনামূল্যে ব্যবহার করুন",
      originalStyles: "মৌলিক text styles", effectsHeading: "আপনার লেখায় দিন", effectsAccent: "নিজস্ব visual touch.",
      effectsIntro: "লেখা লিখুন, একটি effect বেছে নিন, সাথে সাথে preview দেখুন এবং SVG হিসেবে download করুন। কোনো account লাগবে না।",
      guestAiTitle: "AI tools account-এর জন্য",
      guestAiCopy: "Guest mode-এ AI বন্ধ। Login করে verified account-এর quota দিয়ে AI chat ও teaching agent চালান।",
      unlockAi: "Login করে unlock করুন ↗", editorTitle: "আপনার ডিজাইন তৈরি করুন", freeLabel: "বিনামূল্যে",
      textLabel: "মূল লেখা", subtitleLabel: "দ্বিতীয় লাইন", optional: "(ঐচ্ছিক)",
      chooseStyle: "একটি style বেছে নিন। প্রতি মিনিটে সর্বোচ্চ ৩০টি guest preview।",
      previewReady: "Preview প্রস্তুত। SVG download করতে পারেন।",
      textRequired: "লেখা লিখুন, তারপর preview তৈরি হবে।",
      previewFailed: "Preview তৈরি হয়নি। লেখা ছোট করে আবার চেষ্টা করুন।",
      downloadSvg: "SVG download", preview: "LIVE PREVIEW", previewPlaceholder: "আপনার effect preview এখানে দেখা যাবে",
      libraryTitle: "আপনার mood বেছে নিন", apiTitle: "আপনার app-এ text effect API",
      apiCopy: "Guest preview endpoint-এ account লাগে না, তবে অপব্যবহার ঠেকাতে rate-limited।",
      styleApi: "সব style দেখুন ↗", guestLimit: "Guest preview: ৩০টি / মিনিট",
    },
    en: {
      home: "Home", login: "Log in", guestFree: "GUEST MODE · FREE TO TRY",
      originalStyles: "ORIGINAL TEXT STYLES", effectsHeading: "Give your words", effectsAccent: "a visual signature.",
      effectsIntro: "Type a phrase, choose an effect, preview it live, and download it as SVG. No account required.",
      guestAiTitle: "AI tools are for accounts",
      guestAiCopy: "AI is locked in guest mode. Log in with a verified account to use AI chat and the teaching agent from your account quota.",
      unlockAi: "Log in to unlock ↗", editorTitle: "Create your design", freeLabel: "FREE",
      textLabel: "Main text", subtitleLabel: "Second line", optional: "(optional)",
      chooseStyle: "Choose a style. Guest previews are limited to 30 requests per minute.",
      previewReady: "Preview ready. You can download the SVG.",
      textRequired: "Enter some text to create a preview.",
      previewFailed: "Preview failed. Shorten your text and try again.",
      downloadSvg: "Download SVG", preview: "LIVE PREVIEW", previewPlaceholder: "Your effect preview will appear here",
      libraryTitle: "Choose your mood", apiTitle: "Text-effect API for your app",
      apiCopy: "Guest preview endpoints need no account and are rate-limited to prevent abuse.",
      styleApi: "Browse all styles ↗", guestLimit: "Guest previews: 30 / minute",
    },
  };

  const form = document.querySelector("#effect-form");
  const textInput = document.querySelector("#effect-text");
  const secondLineInput = document.querySelector("#effect-text2");
  const image = document.querySelector("#effect-preview");
  const placeholder = document.querySelector("#preview-placeholder");
  const selectedName = document.querySelector("#selected-effect");
  const message = document.querySelector("#effect-message");
  const downloadButton = document.querySelector("#download-effect");
  const cards = [...document.querySelectorAll(".style-card")];
  let selectedEffect = "neon";
  let timer;
  let previewUrl = "";

  const languageSelect = document.querySelector("#effects-language");
  const preferredLanguage = localStorage.getItem("site-language") || "auto";
  const language = preferredLanguage === "auto"
    ? (navigator.language?.startsWith("bn") ? "bn" : "en")
    : preferredLanguage === "bn" ? "bn" : "en";

  function applyLanguage(value) {
    const selected = value === "bn" ? "bn" : "en";
    document.documentElement.lang = selected;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const translated = translations[selected][element.dataset.i18n];
      if (translated) element.textContent = translated;
    });
    textInput.placeholder = selected === "bn" ? "আপনার লেখা..." : "Your text...";
    secondLineInput.placeholder = selected === "bn" ? "Subtitle" : "Subtitle";
    if (downloadButton && !downloadButton.disabled) {
      message.textContent = translations[selected].previewReady;
    }
    if (languageSelect) languageSelect.value = selected;
    localStorage.setItem("effects-language", selected);
  }

  const savedLanguage = localStorage.getItem("effects-language");
  applyLanguage(savedLanguage || language);
  languageSelect?.addEventListener("change", () => applyLanguage(languageSelect.value));

  document.body.dataset.theme = localStorage.getItem("site-theme") ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.querySelector("#effects-theme")?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("site-theme", nextTheme);
  });

  function makePreviewUrl() {
    const params = new URLSearchParams({
      text: textInput.value.trim(),
      effect: selectedEffect,
    });
    if (secondLineInput.value.trim()) params.set("text2", secondLineInput.value.trim());
    return `/api/text-effects/render?${params}`;
  }

  function updatePreview() {
    if (!textInput.value.trim()) {
      image.hidden = true;
      placeholder.hidden = false;
      downloadButton.disabled = true;
      message.textContent = translations[document.documentElement.lang].textRequired;
      return;
    }
    previewUrl = makePreviewUrl();
    image.hidden = false;
    placeholder.hidden = true;
    downloadButton.disabled = true;
    image.src = previewUrl;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((entry) => entry.classList.toggle("active", entry === card));
      selectedEffect = card.dataset.effect;
      selectedName.textContent = card.querySelector("span:last-child").firstChild.textContent.trim().toUpperCase();
      updatePreview();
    });
  });

  image.addEventListener("load", () => {
    downloadButton.disabled = false;
    message.textContent = translations[document.documentElement.lang].previewReady;
  });
  image.addEventListener("error", () => {
    downloadButton.disabled = true;
    message.textContent = translations[document.documentElement.lang].previewFailed;
  });
  form.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(updatePreview, 450);
  });
  form.addEventListener("submit", (event) => event.preventDefault());

  downloadButton.addEventListener("click", async () => {
    downloadButton.disabled = true;
    try {
      const result = await fetch(previewUrl);
      if (!result.ok) {
        const body = await result.json().catch(() => ({}));
        throw new Error(body.message || "SVG download failed.");
      }
      const url = URL.createObjectURL(await result.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${selectedEffect}-text.svg`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      message.textContent = error.message || "Download করা যায়নি।";
    } finally {
      downloadButton.disabled = false;
    }
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
  updatePreview();
})();
