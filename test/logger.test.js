const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const logger = require("../lib/logger");

const originalWrite = process.stderr.write;
const originalTTY = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");
const originalNoColor = process.env.NO_COLOR;
let output = "";

function captureStderr() {
  output = "";
  Object.defineProperty(process.stderr, "isTTY", { configurable: true, value: true });
  process.stderr.write = (chunk) => {
    output += String(chunk);
    return true;
  };
}

afterEach(() => {
  process.stderr.write = originalWrite;
  if (originalTTY) Object.defineProperty(process.stderr, "isTTY", originalTTY);
  else delete process.stderr.isTTY;
  if (originalNoColor === undefined) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = originalNoColor;
});

test("error output uses bright RGB color in a terminal", () => {
  delete process.env.NO_COLOR;
  captureStderr();

  logger.error("Request failed", new Error("test error"));

  assert.match(output, /\u001b\[1;38;2;255;91;125m\[ERROR\]\u001b\[0m/);
  assert.match(output, /Error: test error/);
});

test("error output strips injected terminal escape sequences", () => {
  process.env.NO_COLOR = "";
  captureStderr();

  logger.error("Bad \u001b[31minput\u001b[0m");

  assert.doesNotMatch(output, /\u001b\[/);
  assert.match(output, /Bad \[31minput\[0m/);
});
