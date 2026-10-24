const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { buildPagesSite } = require("../scripts/build-github-pages");

test("GitHub Pages build creates static routes wired to the remote API", (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "better-api-pages-"));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));

  buildPagesSite(output, {
    apiBaseUrl: "https://better-api.example.com",
    pagesBasePath: "/Better-Api/",
  });
  const home = fs.readFileSync(path.join(output, "index.html"), "utf8");
  const effects = fs.readFileSync(path.join(output, "effects", "index.html"), "utf8");
  const apiConfig = fs.readFileSync(path.join(output, "js", "api-base.js"), "utf8");
  assert.match(home, /href="https:\/\/better-api\.example\.com\/login"/);
  assert.match(home, /href="\/Better-Api\/effects\/"/);
  assert.match(effects, /href="https:\/\/better-api\.example\.com\/api\/text-effects\/styles"/);
  assert.match(apiConfig, /https:\/\/better-api\.example\.com/);
  assert.equal(fs.existsSync(path.join(output, "css", "effects.css")), true);
  assert.equal(fs.existsSync(path.join(output, ".nojekyll")), true);
});

test("GitHub Pages build refuses insecure remote API URLs and invalid base paths", (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "better-api-pages-invalid-"));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));

  assert.throws(
    () => buildPagesSite(output, {
      apiBaseUrl: "http://public-api.example.com",
      pagesBasePath: "/Better-Api/",
    }),
    /must use HTTPS/
  );
  assert.throws(
    () => buildPagesSite(output, {
      apiBaseUrl: "https://better-api.example.com",
      pagesBasePath: "/../",
    }),
    /safe path characters/
  );
});
