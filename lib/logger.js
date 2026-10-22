const COLORS = {
  info: [81, 230, 209],
  warn: [255, 196, 87],
  error: [255, 91, 125],
  fatal: [255, 48, 90],
};

function supportsColor(stream = process.stderr) {
  return Boolean(
    stream.isTTY &&
      !Object.prototype.hasOwnProperty.call(process.env, "NO_COLOR") &&
      process.env.TERM !== "dumb"
  );
}

function colorize(text, color, stream) {
  if (!supportsColor(stream)) return text;
  const [red, green, blue] = color;
  return `\u001b[1;38;2;${red};${green};${blue}m${text}\u001b[0m`;
}

function sanitize(text) {
  return String(text).replace(/\u001b|\u0000|[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

function write(level, message, error) {
  const stream = level === "info" ? process.stdout : process.stderr;
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${level.toUpperCase()}]`, COLORS[level], stream);
  const lines = [`${timestamp} ${prefix} ${sanitize(message)}`];

  if (error) {
    const detail = error instanceof Error ? error.stack || error.message : String(error);
    lines.push(sanitize(detail));
  }

  stream.write(`${lines.join("\n")}\n`);
}

module.exports = {
  info: (message) => write("info", message),
  warn: (message) => write("warn", message),
  error: (message, error) => write("error", message, error),
  fatal: (message, error) => write("fatal", message, error),
};
