require("./settings");
const http = require("http");
const app = require("./index");
const logger = require("./lib/logger");
const PORTHOST = Number(port) || 8080;
const banner = `
███╗   ███╗████████╗██╗  ██╗     █████╗ ██████╗ ██╗
████╗ ████║╚══██╔══╝╚██╗██╔╝    ██╔══██╗██╔══██╗██║
██╔████╔██║   ██║    ╚███╔╝     ███████║██████╔╝██║
██║╚██╔╝██║   ██║    ██╔██╗     ██╔══██║██╔═══╝ ██║
██║ ╚═╝ ██║   ██║   ██╔╝ ██╗    ██║  ██║██║     ██║
╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝`;

function colorizeBanner(text) {
  const colors = [
    [255, 82, 128],
    [255, 176, 72],
    [202, 242, 92],
    [75, 231, 201],
    [91, 153, 255],
    [193, 105, 255],
  ];
  let colorIndex = 0;

  return [...text].map((character) => {
    if (character === " " || character === "\n") return character;
    const [red, green, blue] = colors[colorIndex++ % colors.length];
    return `\u001b[1;38;2;${red};${green};${blue}m${character}\u001b[0m`;
  }).join("");
}

process.on("uncaughtExceptionMonitor", (error, origin) => {
  logger.fatal(`Uncaught exception (${origin}).`, error);
});

const server = http.createServer(app);
server.on("error", (error) => {
  logger.fatal("HTTP server failed.", error);
  process.exit(1);
});

async function shutdown(signal) {
  logger.info(`${signal} received; shutting down.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen(PORTHOST, () => {
  if (process.stdout.isTTY) console.clear();
  console.log(process.stdout.isTTY ? colorizeBanner(banner) : banner);
  logger.info(`Server running on http://localhost:${PORTHOST}`);
  logger.info(`Health check: http://localhost:${PORTHOST}/healthz`);
  logger.info(`Node.js ${process.version}`);
  logger.info(`Hello ${creator}`);
  if (!process.env.mongodb) {
    logger.warn("mongodb environment variable is not set; using the local MongoDB fallback.");
  }
  if (!(sendemail && sendpwmail && fromsendemail)) {
    logger.warn("SMTP credentials are missing; email verification and password reset are unavailable.");
  }
  if (!process.env.SESSION_SECRET) {
    logger.warn("SESSION_SECRET is not configured; login sessions will reset when the server restarts.");
  }
});
