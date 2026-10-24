const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const roots = [
  "server.js",
  "index.js",
  "settings.js",
  "routes",
  "lib",
  "controller",
  "model",
  "public/js",
  "scripts",
  "test",
];
const files = [];

function collect(target) {
  const absolutePath = path.join(root, target);
  if (fs.statSync(absolutePath).isFile()) {
    if (absolutePath.endsWith(".js") && !absolutePath.endsWith(".min.js")) {
      files.push(absolutePath);
    }
    return;
  }

  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const relativePath = path.join(target, entry.name);
    if (entry.isDirectory()) collect(relativePath);
    else if (entry.isFile() && entry.name.endsWith(".js") && !entry.name.endsWith(".min.js")) {
      files.push(path.join(root, relativePath));
    }
  }
}

roots.forEach(collect);
let failures = 0;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status === 0) continue;

  failures += 1;
  process.stderr.write(`${path.relative(root, file)}\n${result.stderr || result.error?.message || "Syntax check failed"}\n`);
}

if (failures > 0) {
  process.stderr.write(`\n${failures} of ${files.length} JavaScript files failed syntax checks.\n`);
  process.exitCode = 1;
} else {
  console.log(`Syntax check passed for ${files.length} JavaScript files.`);
}
