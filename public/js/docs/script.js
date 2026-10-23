const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const sidebarToggle = document.querySelector(".toggle-sidebar");
const allDropdown = document.querySelectorAll("#sidebar .side-dropdown");
const allDividers = document.querySelectorAll("#sidebar .divider");
const searchForm = document.getElementById("api-search-form");
const searchInput = document.getElementById("api-search");
const endpointItems = [...document.querySelectorAll("#sidebar .side-dropdown li")];
const endpointGrid = document.getElementById("endpoint-grid");
const endpointCount = document.getElementById("endpoint-count");
const emptySearch = document.getElementById("empty-search");
const playground = document.getElementById("api-playground");
const apiUrlInput = document.getElementById("api-url");
const apiKeyInput = document.getElementById("api-key-value");
const apiResponse = document.getElementById("api-response");
const responseMeta = document.getElementById("response-meta");
const responseMessage = document.getElementById("response-message");
const serviceState = document.getElementById("service-state");
const profile = document.querySelector("nav .profile");
const profileButton = profile.querySelector(".profile-trigger");
const profileMenu = profile.querySelector(".profile-link");

const messages = {
  bn: {
    copyKey: "কপি",
    copied: "কপি হয়েছে",
    copyFailed: "কপি করা যায়নি",
    ready: "প্রস্তুত",
    sending: "অনুরোধ পাঠানো হচ্ছে",
    succeeded: "অনুরোধ সফল",
    failed: "অনুরোধ ব্যর্থ",
    timeout: "১৫ সেকেন্ডে উত্তর আসেনি। আবার চেষ্টা করুন।",
    onlyLocal: "নিরাপত্তার জন্য শুধু এই API সার্ভারে অনুরোধ পাঠানো যাবে।",
    count: (visible, total, query) => query ? `${visible} / ${total}টি এন্ডপয়েন্ট` : `${total}টি এন্ডপয়েন্ট`,
  },
  en: {
    copyKey: "Copy",
    copied: "Copied",
    copyFailed: "Copy failed",
    ready: "Ready",
    sending: "Sending request",
    succeeded: "Request succeeded",
    failed: "Request failed",
    timeout: "No response after 15 seconds. Please try again.",
    onlyLocal: "For security, requests can only be sent to this API server.",
    count: (visible, total, query) => query ? `${visible} / ${total} endpoints` : `${total} endpoints`,
  },
};

let currentLanguage = "bn";
const translations = {
  "MrTomXxX API ড্যাশবোর্ড—API key, endpoint ও usage এক জায়গায় পরিচালনা করুন।": "MrTomXxX API dashboard—manage your API key, endpoints, and usage in one place.",
  "হোম": "Home",
  "ড্যাশবোর্ড": "Dashboard",
  "API বিভাগ": "API Categories",
  "ডাউনলোডার": "Downloaders",
  "তথ্য": "Information",
  "প্রোফাইল তথ্য": "Profile information",
  "টুলস": "Tools",
  "ইসলামিক": "Islamic",
  "টেক্সট ডিজাইন": "Text Design",
  "টেক্সট থেকে অডিও": "Text to Audio",
  "সার্চ": "Search",
  "র‍্যান্ডম ছবি": "Random Images",
  "গেম": "Games",
  "ছবি সম্পাদনা": "Image Editing",
  "লিংক ছোট করুন": "URL Shortener",
  "যোগাযোগ": "Contact",
  "মেনু খুলুন": "Open menu",
  "মেনু বন্ধ করুন": "Close menu",
  "ভাষা নির্বাচন": "Choose language",
  "API এন্ডপয়েন্ট খুঁজুন...": "Search API endpoints...",
  "API এন্ডপয়েন্ট খুঁজুন": "Search API endpoints",
  "থিম বদলান": "Change theme",
  "ডার্ক থিম চালু করুন": "Switch to dark theme",
  "লাইট থিম চালু করুন": "Switch to light theme",
  "অ্যাকাউন্ট মেনু খুলুন": "Open account menu",
  "লগআউট": "Log out",
  "আপনার API কর্মক্ষেত্র": "Your API workspace",
  "স্বাগতম,": "Welcome,",
  "এপিআই, ব্যবহার ও অ্যাকাউন্ট—সবকিছু এক জায়গায়।": "Manage your API, usage, and account in one place.",
  "এন্ডপয়েন্ট দেখুন": "Browse endpoints",
  "সার্ভিস পরীক্ষা হচ্ছে": "Checking service",
  "API ও ডেটাবেস সচল": "API and database online",
  "API সচল · ডেটাবেস সংযোগ নেই": "API online · database disconnected",
  "সার্ভিসে সমস্যা": "Service issue",
  "সার্ভারে সংযোগ নেই": "Cannot connect to server",
  "সার্ভিসের অবস্থা আবার পরীক্ষা করুন": "Check service status again",
  "আবার পরীক্ষা করুন": "Check again",
  "মনোযোগ: API ব্যবহার করতে আগে আপনার ইমেইল যাচাই করুন।": "Please verify your email before using the API.",
  "যাচাইকরণ ইমেইল পাঠান": "Send verification email",
  "সফল:": "Success:",
  "সমস্যা:": "Error:",
  "অ্যাকাউন্টের পরিসংখ্যান": "Account statistics",
  "মোট API ব্যবহারকারী": "Total API users",
  "আজকের মোট অনুরোধ": "Total requests today",
  "আপনার বাকি অনুরোধ": "Your remaining requests",
  "সীমাহীন": "Unlimited",
  "অ্যাকাউন্ট যাচাই": "Account verification",
  "যাচাইকৃত": "Verified",
  "বাকি": "Pending",
  "API টুলস": "API tools",
  "নিরাপদ পরিচিতি": "Secure credentials",
  "আপনার API key": "Your API key",
  "API key দেখান": "Show API key",
  "API key লুকান": "Hide API key",
  "কপি": "Copy",
  "API key গোপন রাখুন—এটি আপনার অ্যাকাউন্টের পরিচয়।": "Keep your API key private—it identifies your account.",
  "দ্রুত পরীক্ষা": "Quick test",
  "API অনুরোধ চালান": "Run an API request",
  "এন্ডপয়েন্টের পথ ও প্যারামিটার": "Endpoint path and parameters",
  "চালান": "Run",
  "পাশের তালিকা থেকে এন্ডপয়েন্ট বাছুন অথবা `/test` দিয়ে শুরু করুন।": "Choose an endpoint from the list or start with `/test`.",
  "সার্ভারের উত্তর": "Server response",
  "প্রস্তুত": "Ready",
  "এন্ডপয়েন্ট চালালে উত্তর এখানে দেখাবে।": "The response will appear here after you run an endpoint.",
  "cURL কপি": "Copy cURL",
  "এন্ডপয়েন্ট নির্বাচন করে চালান।": "Select and run an endpoint.",
  "সার্ভারের উত্তর অপেক্ষা করা হচ্ছে…": "Waiting for the server response…",
  "লোড হচ্ছে…": "Loading…",
  "বাইনারি উত্তর:": "Binary response:",
  "উত্তর সংক্ষিপ্ত করা হয়েছে": "Response was shortened",
  "cURL কমান্ড কপি হয়েছে।": "cURL command copied.",
  "Provider পরীক্ষা হচ্ছে…": "Checking provider…",
  "AI chat ও teaching agent": "AI chat and teaching agent",
  "নিজের server-configured provider দিয়ে প্রশ্ন করুন বা শেখার অনুশীলন করুন।": "Ask questions or practice learning with a provider configured on your server.",
  "API লাইব্রেরি": "API library",
  "সব এন্ডপয়েন্ট": "All endpoints",
  "যেকোনো এন্ডপয়েন্টে ক্লিক করলে সেটি পরীক্ষার ঘরে যোগ হবে।": "Click an endpoint to add it to the API tester.",
  "এন্ডপয়েন্ট গণনা হচ্ছে…": "Counting endpoints…",
  "কোনো এন্ডপয়েন্ট পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।": "No endpoints found. Try another search.",
  "সাধারণ chat": "General chat",
  "শেখার সহায়ক": "Learning assistant",
  "আপনার প্রশ্ন": "Your question",
  "কোনো বিষয় সহজভাবে বুঝিয়ে বলুন...": "Explain a topic in simple terms...",
  "এই request আপনার API key quota থেকে ১টি ব্যবহার করবে। AI provider key server-এ configure করা থাকতে হবে।": "This request uses one unit from your API key quota. An AI provider key must be configured on the server.",
  "পাঠান": "Send",
  "AI response এখানে দেখাবে।": "The AI response will appear here.",
};

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const languageSelect = document.getElementById("docs-language");

function applyLanguage(preference) {
  const selected = preference === "auto"
    ? (navigator.language?.toLowerCase().startsWith("bn") ? "bn" : "en")
    : preference === "en" ? "en" : "bn";
  currentLanguage = selected;
  document.documentElement.lang = selected;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    if (selected === "bn") {
      node.nodeValue = original;
      continue;
    }
    const key = original.trim().replace(/\s+/g, " ");
    const dynamicPrefix = ["স্বাগতম,", "সফল:", "সমস্যা:"].find((prefix) => key.startsWith(prefix));
    const translated = translations[key] || (dynamicPrefix
      ? `${translations[dynamicPrefix]}${key.slice(dynamicPrefix.length)}`
      : null);
    if (translated) {
      const leading = original.match(/^\s*/)?.[0] || "";
      const trailing = original.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leading}${translated}${trailing}`;
    }
  }

  document.querySelectorAll("[aria-label], [title], [placeholder], [data-text], meta[name='description']").forEach((element) => {
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = new Map();
      originalAttributes.set(element, saved);
    }
    ["aria-label", "title", "placeholder", "data-text", "content"].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      if (!saved.has(attribute)) saved.set(attribute, element.getAttribute(attribute));
      const original = saved.get(attribute);
      element.setAttribute(attribute, selected === "bn" ? original : translations[original] || original);
    });
  });

  if (languageSelect) languageSelect.value = preference;
  try {
    localStorage.setItem("site-language", preference);
  } catch {
    // Language switching remains available for the current page.
  }
  document.dispatchEvent(new CustomEvent("docs:languagechange", {
    detail: { language: selected },
  }));
  buildEndpointDirectory();
  updateDividers();
  searchInput.dispatchEvent(new Event("input"));
}

languageSelect?.addEventListener("change", () => applyLanguage(languageSelect.value));

function setSidebarOpen(open) {
  sidebar.classList.toggle("mobile-open", open);
  sidebarToggle.innerHTML = `<i class="bx ${open ? "bx-x" : "bx-menu"}"></i>`;
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", currentLanguage === "bn"
    ? open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"
    : open ? "Close menu" : "Open menu");
}

function updateDividers() {
  const collapsed = sidebar.classList.contains("hide");
  allDividers.forEach((divider) => {
    divider.textContent = collapsed ? "·" : translations[divider.dataset.text] && currentLanguage === "en"
      ? translations[divider.dataset.text]
      : divider.dataset.text;
  });
}

sidebarToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  if (window.matchMedia("(max-width: 768px)").matches) {
    setSidebarOpen(!sidebar.classList.contains("mobile-open"));
    return;
  }

  sidebar.classList.toggle("hide");
  updateDividers();
  try {
    localStorage.setItem("api-sidebar-collapsed", String(sidebar.classList.contains("hide")));
  } catch {
    // The sidebar still works if browser storage is unavailable.
  }
});

try {
  if (localStorage.getItem("api-sidebar-collapsed") === "true" &&
      !window.matchMedia("(max-width: 768px)").matches) {
    sidebar.classList.add("hide");
  }
} catch {
  // The sidebar defaults to expanded if browser storage is unavailable.
}
updateDividers();

allDropdown.forEach((dropdown) => {
  const trigger = dropdown.parentElement.querySelector(":scope > a");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const shouldOpen = !dropdown.classList.contains("show");
    allDropdown.forEach((item) => {
      item.classList.remove("show");
      item.parentElement.querySelector(":scope > a").classList.remove("active");
      item.parentElement.querySelector(":scope > a").setAttribute("aria-expanded", "false");
    });
    if (shouldOpen) {
      dropdown.classList.add("show");
      trigger.classList.add("active");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
  trigger.setAttribute("aria-expanded", "false");
});

function endpointPath(anchor) {
  try {
    const url = new URL(anchor.getAttribute("href"), window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) return null;
    url.searchParams.delete("apikey");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function buildEndpointDirectory() {
  const fragment = document.createDocumentFragment();

  endpointItems.forEach((item) => {
    const anchor = item.querySelector("a");
    const path = endpointPath(anchor);
    if (!path) return;

    const category = item.parentElement.parentElement.querySelector(":scope > a")
      .textContent.trim();
    const button = document.createElement("button");
    button.className = "endpoint-card";
    button.type = "button";
    button.dataset.search = `${anchor.textContent} ${path} ${category}`.toLocaleLowerCase(currentLanguage);

    const title = document.createElement("span");
    title.className = "endpoint-card-title";
    title.textContent = anchor.textContent.trim();
    const group = document.createElement("span");
    group.className = "endpoint-card-category";
    group.textContent = category;
    const code = document.createElement("code");
    code.textContent = path;
    button.append(title, group, code);
    button.addEventListener("click", () => {
      apiUrlInput.value = path;
      document.getElementById("api-playground").scrollIntoView({ behavior: "smooth", block: "center" });
      apiUrlInput.focus({ preventScroll: true });
      responseMessage.textContent = currentLanguage === "bn"
        ? `"${anchor.textContent.trim()}" চালানোর জন্য প্রস্তুত।`
        : `"${anchor.textContent.trim()}" is ready to run.`;
      setSidebarOpen(false);
    });
    fragment.append(button);
  });

  endpointGrid.replaceChildren(fragment);
  refreshEndpointCount();
}

function refreshEndpointCount() {
  const visibleCount = endpointGrid.querySelectorAll(".endpoint-card:not(.api-empty)").length;
  const totalCount = endpointGrid.querySelectorAll(".endpoint-card").length;
  endpointCount.textContent = messages[currentLanguage].count(
    visibleCount,
    totalCount,
    searchInput.value.trim()
  );
  emptySearch.hidden = visibleCount > 0;
}

searchForm.addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase(currentLanguage);

  endpointItems.forEach((item) => {
    item.classList.toggle("api-empty", Boolean(query) &&
      !item.textContent.toLocaleLowerCase(currentLanguage).includes(query));
  });

  document.querySelectorAll("#sidebar .side-dropdown").forEach((dropdown) => {
    const category = dropdown.parentElement;
    const hasMatch = [...dropdown.children].some((item) => !item.classList.contains("api-empty"));
    category.classList.toggle("api-empty", Boolean(query) && !hasMatch);
    if (query && hasMatch) {
      dropdown.classList.add("show");
      const trigger = category.querySelector(":scope > a");
      trigger.classList.add("active");
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  endpointGrid.querySelectorAll(".endpoint-card").forEach((card) => {
    card.classList.toggle("api-empty", Boolean(query) && !card.dataset.search.includes(query));
  });
  refreshEndpointCount();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") {
    setSidebarOpen(false);
    profileMenu.classList.remove("show");
    profileButton.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  if (window.matchMedia("(max-width: 768px)").matches &&
      sidebar.classList.contains("mobile-open") &&
      !sidebar.contains(event.target) &&
      !sidebarToggle.contains(event.target)) {
    setSidebarOpen(false);
  }
  if (!profile.contains(event.target)) {
    profileMenu.classList.remove("show");
    profileButton.setAttribute("aria-expanded", "false");
  }
});

profileButton.addEventListener("click", () => {
  const open = profileMenu.classList.toggle("show");
  profileButton.setAttribute("aria-expanded", String(open));
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById("theme-toggle");
  const light = theme === "light";
  toggle.innerHTML = `<i class="bx ${light ? "bx-moon" : "bx-sun"}"></i>`;
  toggle.setAttribute("aria-label", currentLanguage === "bn"
    ? light ? "ডার্ক থিম চালু করুন" : "লাইট থিম চালু করুন"
    : light ? "Switch to dark theme" : "Switch to light theme");
  toggle.title = toggle.getAttribute("aria-label");
}

let savedTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
try {
  savedTheme = localStorage.getItem("site-theme") || savedTheme;
} catch {
  // The dashboard follows the system theme if browser storage is unavailable.
}
setTheme(savedTheme === "light" ? "light" : "dark");
let savedLanguage = "auto";
try {
  const preference = localStorage.getItem("site-language");
  if (preference === "bn" || preference === "en" || preference === "auto") {
    savedLanguage = preference;
  }
} catch {
  // Language selection defaults to the browser language if storage is unavailable.
}
applyLanguage(savedLanguage);
document.getElementById("theme-toggle").addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  setTheme(nextTheme);
  try {
    localStorage.setItem("site-theme", nextTheme);
  } catch {
    // Theme switching remains available for the current page.
  }
});
languageSelect?.addEventListener("change", () => {
  setTheme(document.documentElement.dataset.theme);
});

document.getElementById("toggle-api-key").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const showKey = apiKeyInput.type === "password";
  apiKeyInput.type = showKey ? "text" : "password";
  button.innerHTML = `<i class="bx ${showKey ? "bx-hide" : "bx-show"}"></i>`;
  button.setAttribute("aria-label", showKey ? "API key লুকান" : "API key দেখান");
  button.title = showKey ? "API key লুকান" : "API key দেখান";
});

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

document.getElementById("copy-api-key").addEventListener("click", async (event) => {
  const label = event.currentTarget.querySelector("span");
  label.textContent = await copyText(apiKeyInput.value)
    ? messages[currentLanguage].copied
    : messages[currentLanguage].copyFailed;
  window.setTimeout(() => { label.textContent = messages[currentLanguage].copyKey; }, 1800);
});

function getRequestUrl() {
  const input = apiUrlInput.value.trim();
  if (!input.startsWith("/") || input.startsWith("//")) {
    throw new Error(messages[currentLanguage].onlyLocal);
  }

  const url = new URL(input, window.location.origin);
  if (url.origin !== window.location.origin) throw new Error(messages[currentLanguage].onlyLocal);
  if (url.pathname.startsWith("/api/") && !url.searchParams.has("apikey")) {
    url.searchParams.set("apikey", apiKeyInput.value);
  }
  return url;
}

document.getElementById("copy-curl").addEventListener("click", async () => {
  try {
    const url = getRequestUrl();
    const command = `curl -sS '${url.toString().replaceAll("'", "'\\''")}'`;
    responseMessage.textContent = await copyText(command)
        ? currentLanguage === "bn" ? "cURL কমান্ড কপি হয়েছে।" : "cURL command copied."
      : messages[currentLanguage].copyFailed;
  } catch (error) {
    responseMessage.textContent = error.message;
  }
});

playground.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = playground.querySelector("button[type='submit']");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  button.disabled = true;
  responseMeta.textContent = messages[currentLanguage].sending;
  responseMessage.textContent = currentLanguage === "bn"
    ? "সার্ভারের উত্তর অপেক্ষা করা হচ্ছে…"
    : "Waiting for the server response…";
  apiResponse.textContent = currentLanguage === "bn" ? "লোড হচ্ছে…" : "Loading…";
  apiResponse.dataset.state = "loading";

  try {
    const url = getRequestUrl();
    const startedAt = performance.now();
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json, text/plain, */*" },
    });
    const elapsed = Math.round(performance.now() - startedAt);
    const contentType = response.headers.get("content-type") || "";
    responseMeta.textContent = `${response.status} · ${elapsed} ms`;

    if (/^(image|video|audio)\//i.test(contentType)) {
      apiResponse.textContent = currentLanguage === "bn"
        ? `${response.status} ${response.statusText}\nবাইনারি উত্তর: ${contentType}`
        : `${response.status} ${response.statusText}\nBinary response: ${contentType}`;
      apiResponse.dataset.state = response.ok ? "success" : "error";
      responseMessage.textContent = response.ok
        ? messages[currentLanguage].succeeded
        : messages[currentLanguage].failed;
      return;
    }

    const body = await response.text();
    let result = body || (currentLanguage === "bn" ? "(খালি উত্তর)" : "(empty response)");
    let hasApiError = false;
    try {
      const parsed = JSON.parse(body);
      result = JSON.stringify(parsed, null, 2);
      hasApiError = parsed?.status === false;
    } catch {
      // Non-JSON endpoints can return plain text.
    }
    apiResponse.textContent = result.length > 8000
      ? `${result.slice(0, 8000)}\n… ${currentLanguage === "bn" ? "উত্তর সংক্ষিপ্ত করা হয়েছে" : "Response was shortened"}`
      : result;
    const success = response.ok && !hasApiError;
    apiResponse.dataset.state = success ? "success" : "error";
    responseMessage.textContent = success
      ? messages[currentLanguage].succeeded
      : messages[currentLanguage].failed;
    if (hasApiError && response.status < 400) responseMeta.textContent += " · API error";
  } catch (error) {
    const timedOut = error.name === "AbortError";
    responseMeta.textContent = messages[currentLanguage].failed;
    responseMessage.textContent = timedOut ? messages[currentLanguage].timeout : error.message;
    apiResponse.textContent = timedOut ? messages[currentLanguage].timeout : error.message;
    apiResponse.dataset.state = "error";
  } finally {
    window.clearTimeout(timeout);
    button.disabled = false;
  }
});

async function updateServiceState() {
  const label = serviceState.querySelector(".state-label");
  try {
    const response = await fetch(serviceState.dataset.healthUrl, {
      cache: "no-store",
      credentials: "same-origin",
    });
    const health = await response.json();
    const online = response.ok && health.status === "ok";
    serviceState.dataset.state = online ? "ok" : "degraded";
    label.textContent = online
      ? currentLanguage === "bn" ? "API ও ডেটাবেস সচল" : "API and database online"
      : health.database === "disconnected"
        ? currentLanguage === "bn" ? "API সচল · ডেটাবেস সংযোগ নেই" : "API online · database disconnected"
        : currentLanguage === "bn" ? "সার্ভিসে সমস্যা" : "Service issue";
  } catch {
    serviceState.dataset.state = "degraded";
    label.textContent = currentLanguage === "bn" ? "সার্ভারে সংযোগ নেই" : "Cannot connect to server";
  }
}

document.getElementById("refresh-health").addEventListener("click", updateServiceState);
buildEndpointDirectory();
updateServiceState();
window.setInterval(updateServiceState, 30000);
