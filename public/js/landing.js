(() => {
  const translations = {
    bn: {
      features: "সুবিধা", about: "সম্পর্কে", login: "লগইন", eyebrow: "ডেভেলপারদের জন্য তৈরি",
      greeting: "আসসালামু আলাইকুম", headline: "আপনার পরের আইডিয়া,<br /><span>এখান থেকেই শুরু।</span>",
      description: "এক জায়গায় দরকারি API, সহজ ইন্টিগ্রেশন এবং আপনার নিজের AI provider key দিয়ে AI tools চালানোর সুবিধা।",
      getStarted: "শুরু করুন", tryApi: "API পরীক্ষা", region: "ব্রাউজারের অঞ্চল শনাক্ত হচ্ছে",
      checking: "সার্ভিস পরীক্ষা হচ্ছে", responseReady: "সার্ভার রেসপন্সের উদাহরণ",
      toolkit: "আপনার টুলকিট", featuresTitle: "একটি প্ল্যাটফর্ম, অনেক সম্ভাবনা",
      featuresDescription: "প্রয়োজনীয় টুলস দ্রুত খুঁজুন, পরীক্ষা করুন, তারপর নিজের প্রজেক্টে ব্যবহার করুন।",
      featureApi: "সহজ API access", featureApiDesc: "ডকুমেন্টেশন থেকে endpoint দেখুন এবং নিজের API key দিয়ে request পরীক্ষা করুন।",
      explore: "এক্সপ্লোর করুন ↗", featureAi: "একাধিক AI provider",
      featureAiDesc: "OpenAI, Gemini, Claude ও OpenRouter—নিজের server-side key configure করে ব্যবহার করুন।",
      providerSetup: "Provider setup ↗", featureDashboard: "নিজস্ব dashboard",
      featureDashboardDesc: "API usage, endpoint directory ও playground এক responsive জায়গায়।",
      openDashboard: "Dashboard খুলুন ↗", aiReady: "AI ইন্টিগ্রেশন",
      aiTitle: "আপনার provider key, আপনার নিয়ন্ত্রণে",
      aiDescription: "API key server-এর environment variable-এ রাখুন। Provider configure না থাকলে AI endpoint সেটিকে স্পষ্টভাবে জানাবে; গোপন key browser-এ পাঠানো হয় না।",
      builtBy: "নির্মাতা", aboutText: "ডেভেলপারদের জন্য তৈরি একটি API project। ওপেন সোর্স code, ব্যবহার নির্দেশনা ও attribution GitHub-এ দেখুন।",
      viewGithub: "GitHub দেখুন ↗", footer: "সবার জন্য তৈরি, ভালো ব্যবহারের জন্য।", account: "অ্যাকাউন্ট",
      serviceReady: "সার্ভিস সচল", serviceDown: "সার্ভিসে সমস্যা", countryPrefix: "ব্রাউজার অঞ্চল",
    },
    en: {
      features: "Features", about: "About", login: "Log in", eyebrow: "BUILT FOR DEVELOPERS",
      greeting: "WELCOME TO THE PLATFORM", headline: "Your next idea,<br /><span>starts right here.</span>",
      description: "Useful APIs, simple integrations, and AI tools powered by your own provider key—all in one place.",
      getStarted: "Get started", tryApi: "Try the API", region: "Detecting browser region",
      checking: "Checking service", responseReady: "Example server response",
      toolkit: "YOUR TOOLKIT", featuresTitle: "One platform, more possibilities",
      featuresDescription: "Find the tools you need, try them, then build them into your project.",
      featureApi: "Simple API access", featureApiDesc: "Browse endpoints and try requests with your own API key.",
      explore: "Explore ↗", featureAi: "Multiple AI providers",
      featureAiDesc: "Use OpenAI, Gemini, Claude, and OpenRouter with your server-side keys.",
      providerSetup: "Provider setup ↗", featureDashboard: "Your dashboard",
      featureDashboardDesc: "API usage, endpoint directory, and playground in one responsive workspace.",
      openDashboard: "Open dashboard ↗", aiReady: "AI INTEGRATION",
      aiTitle: "Your provider keys, under your control",
      aiDescription: "Store API keys in server environment variables. Unconfigured providers are reported clearly; secrets are never sent to the browser.",
      builtBy: "BUILT BY", aboutText: "An API project for developers. Find open-source code, usage guidance, and attribution on GitHub.",
      viewGithub: "View on GitHub ↗", footer: "Built for everyone. Use responsibly.", account: "Account",
      serviceReady: "Service online", serviceDown: "Service unavailable", countryPrefix: "Browser region",
    },
    hi: {
      features: "विशेषताएँ", about: "परिचय", login: "लॉग इन", eyebrow: "डेवलपर्स के लिए",
      greeting: "प्लेटफ़ॉर्म में आपका स्वागत है", headline: "आपका अगला आइडिया,<br /><span>यहीं से शुरू होता है।</span>",
      description: "ज़रूरी API, आसान इंटीग्रेशन और आपकी अपनी provider key से AI tools—सब एक जगह।",
      getStarted: "शुरू करें", tryApi: "API आज़माएँ", region: "ब्राउज़र क्षेत्र पता लगाया जा रहा है",
      checking: "सेवा जाँची जा रही है", responseReady: "सर्वर प्रतिक्रिया का उदाहरण",
      toolkit: "आपके टूल", featuresTitle: "एक प्लेटफ़ॉर्म, कई संभावनाएँ",
      featuresDescription: "ज़रूरी टूल खोजें, आज़माएँ और अपने प्रोजेक्ट में जोड़ें।",
      featureApi: "आसान API access", featureApiDesc: "Endpoints देखें और अपनी API key से requests आज़माएँ।",
      explore: "देखें ↗", featureAi: "कई AI providers",
      featureAiDesc: "अपनी server-side keys से OpenAI, Gemini, Claude और OpenRouter इस्तेमाल करें।",
      providerSetup: "Provider सेटअप ↗", featureDashboard: "आपका dashboard",
      featureDashboardDesc: "API usage, endpoints और playground एक responsive जगह पर।",
      openDashboard: "Dashboard खोलें ↗", aiReady: "AI इंटीग्रेशन",
      aiTitle: "आपकी provider key, आपके नियंत्रण में",
      aiDescription: "API keys को server environment variables में रखें। सेट न किए गए provider की सूचना दी जाएगी; key browser में नहीं भेजी जाती।",
      builtBy: "निर्माता", aboutText: "डेवलपर्स के लिए API project। Open-source code और attribution GitHub पर देखें।",
      viewGithub: "GitHub देखें ↗", footer: "सबके लिए बनाया गया। ज़िम्मेदारी से उपयोग करें।", account: "खाता",
      serviceReady: "सेवा चालू", serviceDown: "सेवा उपलब्ध नहीं", countryPrefix: "ब्राउज़र क्षेत्र",
    },
    id: {
      features: "Fitur", about: "Tentang", login: "Masuk", eyebrow: "DIBUAT UNTUK DEVELOPER",
      greeting: "SELAMAT DATANG", headline: "Ide berikutnya,<br /><span>dimulai di sini.</span>",
      description: "API praktis, integrasi mudah, dan AI dengan kunci provider milik Anda—semua di satu tempat.",
      getStarted: "Mulai", tryApi: "Coba API", region: "Mendeteksi wilayah browser",
      checking: "Memeriksa layanan", responseReady: "Contoh respons server",
      toolkit: "TOOLKIT ANDA", featuresTitle: "Satu platform, banyak kemungkinan",
      featuresDescription: "Temukan tool, coba, lalu gunakan di project Anda.",
      featureApi: "Akses API mudah", featureApiDesc: "Jelajahi endpoint dan coba request dengan API key Anda.",
      explore: "Jelajahi ↗", featureAi: "Berbagai provider AI",
      featureAiDesc: "Gunakan OpenAI, Gemini, Claude, dan OpenRouter dengan key server Anda.",
      providerSetup: "Pengaturan provider ↗", featureDashboard: "Dashboard Anda",
      featureDashboardDesc: "Penggunaan API, direktori endpoint, dan playground dalam satu tempat.",
      openDashboard: "Buka dashboard ↗", aiReady: "INTEGRASI AI",
      aiTitle: "Kunci provider Anda, kendali Anda",
      aiDescription: "Simpan key API di environment variable server. Provider yang belum dikonfigurasi akan diberi tahu; key tidak dikirim ke browser.",
      builtBy: "DIBUAT OLEH", aboutText: "Project API untuk developer. Lihat kode open-source dan atribusi di GitHub.",
      viewGithub: "Lihat GitHub ↗", footer: "Dibuat untuk semua. Gunakan dengan bijak.", account: "Akun",
      serviceReady: "Layanan aktif", serviceDown: "Layanan bermasalah", countryPrefix: "Wilayah browser",
    },
    ar: {
      features: "الميزات", about: "حول", login: "تسجيل الدخول", eyebrow: "مصمم للمطورين",
      greeting: "مرحبًا بك", headline: "فكرتك القادمة،<br /><span>تبدأ من هنا.</span>",
      description: "واجهات API مفيدة وتكامل بسيط وأدوات ذكاء اصطناعي بمفتاحك الخاص، في مكان واحد.",
      getStarted: "ابدأ الآن", tryApi: "جرّب API", region: "جارٍ تحديد منطقة المتصفح",
      checking: "جارٍ فحص الخدمة", responseReady: "مثال على استجابة الخادم",
      toolkit: "أدواتك", featuresTitle: "منصة واحدة وإمكانات عديدة",
      featuresDescription: "اعثر على الأدوات وجربها ثم استخدمها في مشروعك.",
      featureApi: "وصول سهل إلى API", featureApiDesc: "استعرض نقاط النهاية وجرب الطلبات بمفتاحك.",
      explore: "استكشف ↗", featureAi: "عدة مزودي ذكاء اصطناعي",
      featureAiDesc: "استخدم OpenAI وGemini وClaude وOpenRouter بمفاتيح الخادم الخاصة بك.",
      providerSetup: "إعداد المزود ↗", featureDashboard: "لوحة التحكم",
      featureDashboardDesc: "الاستخدام ونقاط النهاية وبيئة التجربة في مساحة واحدة.",
      openDashboard: "افتح لوحة التحكم ↗", aiReady: "تكامل الذكاء الاصطناعي",
      aiTitle: "مفاتيح المزود تحت سيطرتك",
      aiDescription: "احفظ مفاتيح API في متغيرات بيئة الخادم. سيظهر تنبيه للمزود غير المُعد، ولا تُرسل المفاتيح إلى المتصفح.",
      builtBy: "من تطوير", aboutText: "مشروع API للمطورين. اعرض الشيفرة المفتوحة والإسناد على GitHub.",
      viewGithub: "عرض GitHub ↗", footer: "للجميع، استخدمه بمسؤولية.", account: "الحساب",
      serviceReady: "الخدمة متاحة", serviceDown: "الخدمة غير متاحة", countryPrefix: "منطقة المتصفح",
    },
  };

  const supported = Object.keys(translations);
  const selector = document.querySelector("#language-switch");
  const saved = localStorage.getItem("site-language") || "auto";
  const browserLanguage = (navigator.languages || [navigator.language]).map((value) =>
    value.split("-")[0].toLowerCase()
  ).find((value) => supported.includes(value)) || "en";

  function applyLanguage(requested) {
    const language = requested === "auto" ? browserLanguage : supported.includes(requested) ? requested : "en";
    const dictionary = translations[language];
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = dictionary[element.dataset.i18n];
      if (value) element.innerHTML = value;
    });
    if (selector) selector.value = requested;
    localStorage.setItem("site-language", requested);
  }

  let serviceState = null;

  function updateServiceLabel() {
    if (!serviceState) return;
    document.querySelector("#service-status").textContent =
      translations[document.documentElement.lang][serviceState];
  }

  applyLanguage(saved);

  const storedTheme = localStorage.getItem("site-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.body.dataset.theme = storedTheme || preferredTheme;
  document.querySelector("#theme-switch")?.addEventListener("click", () => {
    const theme = document.body.dataset.theme === "light" ? "dark" : "light";
    document.body.dataset.theme = theme;
    localStorage.setItem("site-theme", theme);
  });

  const timeElement = document.querySelector("#local-clock");
  const regionElement = document.querySelector("#browser-region");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const regionCode = navigator.language?.split("-")[1]?.toUpperCase();
  let region = timezone || "local browser";
  if (regionCode && typeof Intl.DisplayNames === "function") {
    region = new Intl.DisplayNames([navigator.language], { type: "region" }).of(regionCode) || region;
  }
  function updateRegionLabel() {
    regionElement.textContent = `${translations[document.documentElement.lang].countryPrefix}: ${region} · ${timezone || "local time"}`;
  }
  updateRegionLabel();
  selector?.addEventListener("change", () => {
    applyLanguage(selector.value);
    updateRegionLabel();
    updateServiceLabel();
  });
  function updateClock() {
    timeElement.textContent = new Intl.DateTimeFormat(document.documentElement.lang, {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: timezone,
    }).format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 1000);
  document.querySelector("#year").textContent = new Date().getFullYear();

  fetch("/healthz", { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error("Service health request failed");
      return response.json();
    })
    .then((health) => {
      serviceState = health.status === "ok" ? "serviceReady" : "serviceDown";
      updateServiceLabel();
    })
    .catch(() => {
      serviceState = "serviceDown";
      updateServiceLabel();
    });
})();
