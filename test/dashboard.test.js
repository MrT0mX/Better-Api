const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const ejs = require("ejs");

test("dashboard renders Bengali controls and no legacy scripts", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "view", "docs.ejs"),
    {
      username: "MrTomX",
      verified: true,
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
  assert.match(html, /id="ai-playground"/);
  assert.match(html, /\/js\/docs\/ai\.js/);
  assert.match(html, /API অনুরোধ চালান/);
  assert.doesNotMatch(html, /\/js\/menu\.js/);
  assert.doesNotMatch(html, /jquery\.easing/);
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
