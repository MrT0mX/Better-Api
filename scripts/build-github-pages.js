const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "dist");

function validateInputs(options) {
  const apiBaseUrl = String(options.apiBaseUrl || "").replace(/\/+$/, "");
  const pagesBasePath = options.pagesBasePath || "/Better-Api/";
  let apiUrl;
  try {
    apiUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("Set API_BASE_URL to the deployed Render or Railway HTTPS URL.");
  }
  if (apiUrl.protocol !== "https:" && apiUrl.hostname !== "localhost" && apiUrl.hostname !== "127.0.0.1") {
    throw new Error("API_BASE_URL must use HTTPS outside local development.");
  }
  const segments = pagesBasePath.split("/").filter(Boolean);
  if (!/^\/(?:[a-zA-Z0-9._~-]+\/)*$/.test(pagesBasePath) ||
      segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("GITHUB_PAGES_BASE_PATH must start and end with / and contain only safe path characters.");
  }
  return { apiBaseUrl, pagesBasePath };
}

function buildHtml(pageName, { apiBaseUrl, pagesBasePath }) {
  let html = fs.readFileSync(path.join(root, "view", pageName), "utf8");
  html = html
    .replace(/href="\/css\//g, `href="${pagesBasePath}css/`)
    .replace(/src="\/js\//g, `src="${pagesBasePath}js/`)
    .replace(/href="\/favicon\.ico"/g, `href="${pagesBasePath}favicon.ico"`)
    .replace(/href="\/effects"/g, `href="${pagesBasePath}effects/"`)
    .replace(/href="\/"/g, `href="${pagesBasePath}"`)
    .replace(/href="\/login"/g, `href="${apiBaseUrl}/login"`)
    .replace(/href="\/test"/g, `href="${apiBaseUrl}/test"`)
    .replace(/href="\/api\//g, `href="${apiBaseUrl}/api/`)
    .replace("</head>", `<script src="${pagesBasePath}js/api-base.js"></script>\n  </head>`);
  return html;
}

function buildPagesSite(output = outputDirectory, options = {}) {
  const config = validateInputs({
    apiBaseUrl: options.apiBaseUrl || process.env.API_BASE_URL,
    pagesBasePath: options.pagesBasePath || process.env.GITHUB_PAGES_BASE_PATH,
  });
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(output, "effects"), { recursive: true });
  fs.mkdirSync(path.join(output, "css"), { recursive: true });
  fs.mkdirSync(path.join(output, "js"), { recursive: true });

  fs.writeFileSync(path.join(output, "index.html"), buildHtml("home.ejs", config));
  fs.writeFileSync(path.join(output, "effects", "index.html"), buildHtml("effects.ejs", config));
  for (const name of ["landing.css", "effects.css"]) {
    fs.copyFileSync(path.join(root, "public", "css", name), path.join(output, "css", name));
  }
  for (const name of ["landing.js", "effects.js"]) {
    fs.copyFileSync(path.join(root, "public", "js", name), path.join(output, "js", name));
  }
  fs.copyFileSync(path.join(root, "public", "favicon.ico"), path.join(output, "favicon.ico"));
  fs.writeFileSync(
    path.join(output, "js", "api-base.js"),
    `window.BETTER_API_BASE_URL = ${JSON.stringify(config.apiBaseUrl)};\n`
  );
  fs.writeFileSync(path.join(output, ".nojekyll"), "");
  return output;
}

if (require.main === module) {
  try {
    const output = buildPagesSite(outputDirectory);
    console.log(`GitHub Pages static site built at ${path.relative(root, output)}.`);
  } catch (error) {
    console.error(`GitHub Pages build failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildPagesSite, validateInputs };
