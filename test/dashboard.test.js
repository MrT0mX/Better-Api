const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ejs = require("ejs");
const { JSDOM } = require("jsdom");

test("dashboard renders Bengali controls and no legacy scripts", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "docs.ejs"),
    {
      username: "MrTomX",
      verified: true,
      isAdmin: true,
      apikey: "test-key",
      limit: 20,
      RequestToday: 3,
      totalUsers: 5,
      success_messages: "",
      error_messages: "",
    }
  );

  assert.match(html, /<html lang="bn">/);
  assert.match(html, /id="endpoint-grid"/);
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /id="docs-language"/);
  assert.match(html, /value="en">English/);
  assert.match(html, /id="ai-playground"/);
  assert.match(html, /ADMIN · Full API quota/);
  assert.match(html, /href="\/admin\/settings"/);
  assert.match(html, /\/js\/docs\/ai\.js/);
  assert.match(html, /Guest Text Effects/);
  assert.match(html, /SVG Text Effect \(Guest\)/);
  assert.match(html, /api\/creative\/logo\/render/);
  assert.match(html, /api\/creative\/animation\/render/);
  assert.doesNotMatch(html, /api\/textpro\/transformer/);
  assert.match(html, /API অনুরোধ চালান/);
  assert.doesNotMatch(html, /\/js\/menu\.js/);
  assert.doesNotMatch(html, /jquery\.easing/);
});

test("dashboard language and theme controls apply and persist their settings", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "docs.ejs"),
    {
      username: "MrTomX",
      verified: true,
      isAdmin: false,
      apikey: "test-key",
      limit: 20,
      RequestToday: 3,
      totalUsers: 5,
      success_messages: "",
      error_messages: "",
    }
  );
  const dom = new JSDOM(html, { url: "http://localhost/docs", runScripts: "outside-only" });
  const { window } = dom;
  window.localStorage.setItem("site-language", "bn");
  window.localStorage.setItem("site-theme", "light");
  window.matchMedia = () => ({ matches: false });
  window.setInterval = () => 0;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.fetch = async (url) => ({
    ok: true,
    status: 200,
    json: async () => String(url).includes("/api/ai/providers")
      ? { providers: [] }
      : { status: "ok", database: "connected" },
  });

  window.eval(fs.readFileSync(path.join(__dirname, "..", "public", "js", "docs", "script.js"), "utf8"));
  window.eval(fs.readFileSync(path.join(__dirname, "..", "public", "js", "docs", "ai.js"), "utf8"));

  assert.equal(window.document.documentElement.lang, "bn");
  assert.equal(window.document.documentElement.dataset.theme, "light");
  assert.equal(window.document.querySelector(".dashboard-heading .title").textContent, "স্বাগতম, MrTomX");

  const languageSelect = window.document.getElementById("docs-language");
  languageSelect.value = "en";
  languageSelect.dispatchEvent(new window.Event("change"));
  assert.equal(window.document.documentElement.lang, "en");
  assert.equal(window.document.querySelector(".dashboard-heading .title").textContent, "Welcome, MrTomX");
  assert.equal(window.document.querySelector("#endpoint-title").textContent, "All endpoints");
  assert.equal(window.localStorage.getItem("site-language"), "en");

  window.document.getElementById("theme-toggle").click();
  assert.equal(window.document.documentElement.dataset.theme, "dark");
  assert.equal(window.localStorage.getItem("site-theme"), "dark");

  languageSelect.value = "bn";
  languageSelect.dispatchEvent(new window.Event("change"));
  assert.equal(window.document.documentElement.lang, "bn");
  assert.equal(window.document.querySelector(".dashboard-heading .title").textContent, "স্বাগতম, MrTomX");
  assert.equal(window.document.querySelector("#endpoint-title").textContent, "সব এন্ডপয়েন্ট");
  dom.window.close();
});

test("guest effects page provides public styles and keeps AI sign-in gated", async () => {
  const html = await ejs.renderFile(path.join(__dirname, "..", "view", "effects.ejs"));

  assert.match(html, /id="style-groups"/);
  assert.match(html, /id="download-effect"/);
  assert.match(html, /data-i18n="guestAiTitle"/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /\/api\/text-effects\/render/);
});

test("login accepts username or email", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "login.ejs"),
    {
      csrfToken: "test-csrf",
      recaptcha: "",
      error: "",
      error_messages: "",
      success_messages: "",
    }
  );
  assert.match(html, /Username or email/);
  assert.match(html, /type="text"[\s\S]*name="email"/);
  assert.match(html, /autocomplete="username"/);
});

test("admin settings template never reflects saved secret values", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "admin-settings.ejs"),
    {
      csrfToken: "test-csrf",
      encryptionReady: true,
      message: "",
      groups: [{
        title: "AI",
        fields: [{
          key: "GEMINI_API_KEY",
          label: "Google Gemini",
          hint: "Server API key.",
          secret: true,
          configured: true,
          source: "database",
          type: "password",
        }],
      }],
    }
  );

  assert.match(html, /name="GEMINI_API_KEY"/);
  assert.match(html, /সংরক্ষিত · auto-test নেই/);
  assert.doesNotMatch(html, /value="secret/);
  assert.match(html, /autocomplete="new-password"/);
  assert.match(html, /MongoDB URI/);
});

test("admin credential fields offer direct official provider links", async () => {
  const { buildFields } = require("../routes/admin-settings");
  const fields = buildFields([]).flatMap((group) => group.fields);
  const gemini = fields.find((field) => field.key === "GEMINI_API_KEY");
  const recaptcha = fields.find((field) => field.key === "recaptcha_key_1");
  assert.equal(gemini.sourceUrl, "https://aistudio.google.com/apikey");
  assert.equal(recaptcha.sourceUrl, "https://www.google.com/recaptcha/admin");

  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "admin-settings.ejs"),
    {
      csrfToken: "test-csrf",
      encryptionReady: true,
      message: "",
      groups: [{
        title: "AI",
        fields: [{
          ...gemini,
          configured: false,
          source: "missing",
        }],
      }],
    }
  );
  assert.match(html, /href="https:\/\/aistudio\.google\.com\/apikey" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /Google AI Studio-তে API key নিন/);
});

test("admin settings render automatic connection diagnostics and only real test actions", async () => {
  const { buildFields } = require("../routes/admin-settings");
  const fields = buildFields([
    { key: "OPENAI_API_KEY", secret: true, configured: true, source: "environment" },
    { key: "CUTTLY_API_KEYS", secret: true, configured: true, source: "environment" },
    { key: "recaptcha_key_1", secret: false, configured: true, source: "environment" },
    { key: "sendemail", secret: false, configured: true, source: "environment" },
    { key: "sendpwmail", secret: true, configured: true, source: "environment" },
  ]).flatMap((group) => group.fields);

  assert.equal(fields.find((field) => field.key === "OPENAI_API_KEY").testable, true);
  assert.equal(fields.find((field) => field.key === "sendemail").testable, true);
  assert.equal(fields.find((field) => field.key === "CUTTLY_API_KEYS").testable, false);
  assert.equal(fields.find((field) => field.key === "recaptcha_key_1").testable, false);
  assert.equal(fields.find((field) => field.key === "sendpwmail").testable, false);

  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "admin-settings.ejs"),
    { csrfToken: "test-csrf", encryptionReady: true, message: "", groups: [], usage: [], audit: [] }
  );
  assert.match(html, /id="run-connection-tests"/);
  assert.match(html, /data-health="database"/);
  assert.match(html, /data-health="encryption"/);
});

test("admin settings automatically runs credential checks and lights successful connections green", async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <input name="_csrf" value="test-csrf" />
    <div id="connection-overview" data-encryption-ready="true">
      <i id="connection-overview-light"></i><strong id="connection-summary"></strong><span id="connection-checked-at"></span>
    </div>
    <div data-health="database"><i class="status-light"></i><strong></strong></div>
    <div data-health="encryption"><i class="status-light"></i><strong></strong></div>
    <button id="run-connection-tests"></button>
    <button class="check-credential" data-key="OPENAI_API_KEY"></button>
    <span data-status-for="OPENAI_API_KEY" data-configured="true"><i class="status-light"></i><span></span></span>
    <span data-result-for="OPENAI_API_KEY"></span>
  </body></html>`, { url: "http://localhost/admin/settings", runScripts: "outside-only" });
  const { window } = dom;
  window.matchMedia = () => ({ matches: false });
  window.setInterval = () => 0;
  window.fetch = async (url) => ({
    ok: true,
    status: 200,
    json: async () => String(url).includes("/healthz")
      ? { status: "ok", database: "connected" }
      : {
        checks: [{ key: "OPENAI_API_KEY", status: "ok", message: "Provider is reachable." }],
        checkedAt: "2026-01-01T00:00:00.000Z",
        encryptionReady: true,
      },
  });

  window.eval(fs.readFileSync(path.join(__dirname, "..", "public", "js", "admin-settings.js"), "utf8"));
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(window.document.querySelector("#connection-overview").dataset.status, "ok");
  assert.equal(window.document.querySelector("#connection-summary").textContent, "1টি connection সচল");
  assert.equal(window.document.querySelector('[data-status-for="OPENAI_API_KEY"] .status-light').classList.contains("status-ok"), true);
  assert.equal(window.document.querySelector('[data-health="database"] strong').textContent, "Connected");
  assert.equal(window.document.querySelector('[data-health="encryption"] strong').textContent, "Ready");
  dom.window.close();
});

test("not-found page renders a Bengali recovery link", async () => {
  const html = await ejs.renderFile(path.join(__dirname, "..", "view", "404.ejs"));

  assert.match(html, /<html lang="bn">/);
  assert.match(html, /পাতাটি খুঁজে পাওয়া যায়নি/);
  assert.match(html, /হোমে ফিরে যান/);
});

test("home page renders multilingual controls and browser-local context hooks", async () => {
  const html = await ejs.renderFile(path.join(__dirname, "..", "view", "home.ejs"));

  assert.match(html, /id="language-switch"/);
  assert.match(html, /value="ar"/);
  assert.match(html, /id="local-clock"/);
  assert.match(html, /id="browser-region"/);
  assert.match(html, /id="theme-switch"/);
  assert.match(html, /\/js\/landing\.js/);
});
