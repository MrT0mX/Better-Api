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
  copyKey: "কপি",
  copied: "কপি হয়েছে",
  copyFailed: "কপি করা যায়নি",
  ready: "প্রস্তুত",
  sending: "অনুরোধ পাঠানো হচ্ছে",
  succeeded: "অনুরোধ সফল",
  failed: "অনুরোধ ব্যর্থ",
  timeout: "১৫ সেকেন্ডে উত্তর আসেনি। আবার চেষ্টা করুন।",
  offline: "সার্ভারে সংযোগ করা যাচ্ছে না।",
  onlyLocal: "নিরাপত্তার জন্য শুধু এই API সার্ভারে অনুরোধ পাঠানো যাবে।",
};

function setSidebarOpen(open) {
  sidebar.classList.toggle("mobile-open", open);
  sidebarToggle.innerHTML = `<i class="bx ${open ? "bx-x" : "bx-menu"}"></i>`;
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "মেনু বন্ধ করুন" : "মেনু খুলুন");
}

function updateDividers() {
  const collapsed = sidebar.classList.contains("hide");
  allDividers.forEach((divider) => {
    divider.textContent = collapsed ? "·" : divider.dataset.text;
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
    button.dataset.search = `${anchor.textContent} ${path} ${category}`.toLocaleLowerCase("bn");

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
      responseMessage.textContent = `"${anchor.textContent.trim()}" চালানোর জন্য প্রস্তুত।`;
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
  endpointCount.textContent = searchInput.value.trim()
    ? `${visibleCount} / ${totalCount}টি এন্ডপয়েন্ট`
    : `${totalCount}টি এন্ডপয়েন্ট`;
  emptySearch.hidden = visibleCount > 0;
}

searchForm.addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("bn");

  endpointItems.forEach((item) => {
    item.classList.toggle("api-empty", Boolean(query) &&
      !item.textContent.toLocaleLowerCase("bn").includes(query));
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
  toggle.setAttribute("aria-label", light ? "ডার্ক থিম চালু করুন" : "লাইট থিম চালু করুন");
  toggle.title = light ? "ডার্ক থিম" : "লাইট থিম";
}

let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("api-dashboard-theme") || savedTheme;
} catch {
  // The dashboard defaults to dark mode if browser storage is unavailable.
}
setTheme(savedTheme === "light" ? "light" : "dark");
document.getElementById("theme-toggle").addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  setTheme(nextTheme);
  try {
    localStorage.setItem("api-dashboard-theme", nextTheme);
  } catch {
    // Theme switching remains available for the current page.
  }
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
  label.textContent = await copyText(apiKeyInput.value) ? messages.copied : messages.copyFailed;
  window.setTimeout(() => { label.textContent = messages.copyKey; }, 1800);
});

function getRequestUrl() {
  const input = apiUrlInput.value.trim();
  if (!input.startsWith("/") || input.startsWith("//")) {
    throw new Error(messages.onlyLocal);
  }

  const url = new URL(input, window.location.origin);
  if (url.origin !== window.location.origin) throw new Error(messages.onlyLocal);
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
      ? "cURL কমান্ড কপি হয়েছে।"
      : messages.copyFailed;
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
  responseMeta.textContent = messages.sending;
  responseMessage.textContent = "সার্ভারের উত্তর অপেক্ষা করা হচ্ছে…";
  apiResponse.textContent = "লোড হচ্ছে…";
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
      apiResponse.textContent = `${response.status} ${response.statusText}\nবাইনারি উত্তর: ${contentType}`;
      apiResponse.dataset.state = response.ok ? "success" : "error";
      responseMessage.textContent = response.ok ? messages.succeeded : messages.failed;
      return;
    }

    const body = await response.text();
    let result = body || "(খালি উত্তর)";
    let hasApiError = false;
    try {
      const parsed = JSON.parse(body);
      result = JSON.stringify(parsed, null, 2);
      hasApiError = parsed?.status === false;
    } catch {
      // Non-JSON endpoints can return plain text.
    }
    apiResponse.textContent = result.length > 8000
      ? `${result.slice(0, 8000)}\n… উত্তর সংক্ষিপ্ত করা হয়েছে`
      : result;
    const success = response.ok && !hasApiError;
    apiResponse.dataset.state = success ? "success" : "error";
    responseMessage.textContent = success ? messages.succeeded : messages.failed;
    if (hasApiError && response.status < 400) responseMeta.textContent += " · API error";
  } catch (error) {
    const timedOut = error.name === "AbortError";
    responseMeta.textContent = messages.failed;
    responseMessage.textContent = timedOut ? messages.timeout : error.message;
    apiResponse.textContent = timedOut ? messages.timeout : error.message;
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
      ? "API ও ডেটাবেস সচল"
      : health.database === "disconnected"
        ? "API সচল · ডেটাবেস সংযোগ নেই"
        : "সার্ভিসে সমস্যা";
  } catch {
    serviceState.dataset.state = "degraded";
    label.textContent = "সার্ভারে সংযোগ নেই";
  }
}

document.getElementById("refresh-health").addEventListener("click", updateServiceState);
buildEndpointDirectory();
updateServiceState();
window.setInterval(updateServiceState, 30000);
