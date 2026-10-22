//_______________________ ┏  Info  ┓ _______________________\\
//
//   Edited BY: MrTomXxX
//   
//   -----------Note ------------
//
//   Api Owner: Bot
//   Don't sell this API,
//   Don't Change this text,
//   Who wants to upload don't forget to credit :),
//   Who does not place credit will take action
//   
//_______________________ ┏ Modified By MrTomXxX ┓ _______________________\\


//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require("./settings");
const express = require("express");
const app = express();
const crypto = require("crypto");
const favicon = require("serve-favicon");
const path = require("path");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const MemoryStore = require("memorystore")(expressSession);
const passport = require("passport");
const flash = require("connect-flash");
const csrf = require("csurf");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const User = require("./model/user");
const dataweb = require("./model/DataWeb");
const logger = require("./lib/logger");
const { ensureBootstrapAdmin, getAdminConfig } = require("./lib/bootstrap-admin");
const isProduction = process.env.NODE_ENV === "production";
const configuredSessionSecret = process.env.SESSION_SECRET?.trim();

if (isProduction && (!configuredSessionSecret || configuredSessionSecret.length < 32)) {
  throw new Error("Production requires a SESSION_SECRET containing at least 32 characters.");
}

const sessionSecret = configuredSessionSecret || crypto.randomBytes(32).toString("hex");
getAdminConfig();

//_______________________ ┏ Funtion ┓ _______________________\\

async function resetapi() {
  await User.updateMany({}, { $set: { limitApikey: LimitApikey } });
  logger.info("API key limits were reset.");
}

async function ResetRequestToday() {
  await dataweb.updateOne(
    {},
    {
      RequestToday: 0,
    }
  );
  logger.info("Today's API request count was reset.");
}

//_______________________ ┏ Code ┓ _______________________\\

(cors = require("cors")), (secure = require("ssl-express-www"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
var main = require("./routes/main"),
  api = require("./routes/api");
app.set("view engine", "ejs");
app.set("views", __dirname + "/view");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//_______________________ ┏ Connect Database ┓ _______________________\\

mongoose.set("strictQuery", false);
mongoose
  .connect(keymongodb, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    logger.info("Connected to MongoDB.");
    let limit = await dataweb.findOne();
    if (limit === null) {
      let obj = { RequestToday: 0 };
      await dataweb.create(obj);
      logger.info("Website statistics record created.");
    }
    const admin = await ensureBootstrapAdmin();
    if (admin.created) logger.info("Secure bootstrap admin account created from environment configuration.");
    else if (admin.promoted) logger.info("Configured existing account was granted the admin role.");
  })
  .catch((error) => {
    logger.error("Database initialization or admin bootstrap failed.", error);
    if (error.message.includes("Admin bootstrap")) process.exitCode = 1;
  });

//_______________________ ┏ CronJob For Reset Limit ┓ _______________________\\

// Reset Request Today Setiap sehari
cron.schedule(
  "0 0 0 * * *",
  () => {
    ResetRequestToday().catch((error) => {
      logger.error("Failed to reset today's API request count.", error);
    });
  },
  {
    scheduled: true,
    timezone: "Asia/Dhaka",
  }
);

//Reset All User Apikey Limit setiap sebulan
cron.schedule(
  "0 0 1 * *",
  () => {
    resetapi().catch((error) => {
      logger.error("Failed to reset API key limits.", error);
    });
  },
  {
    scheduled: true,
    timezone: "Asia/Dhaka",
  }
);

//_______________________ ┏ Code ┓ _______________________\\

app.set("trust proxy", 1);
app.use(cookieParser(sessionSecret));
app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
    store: new MemoryStore(),
  })
);
const csrfProtection = csrf();
app.use((req, res, next) => {
  if (req.path.startsWith("/api/ai/") || req.path.startsWith("/api/agent/")) return next();
  return csrfProtection(req, res, next);
});
app.use(passport.initialize());
app.use(express.static("public"));
app.use(passport.session());
app.set("json spaces", 2);
app.use(cors());
if (process.env.NODE_ENV === "production") app.use(secure);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  res.locals.error = req.flash("error");
  next();
});
app.use("/", main);
app.use("/", api);
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = Number(err.status || err.statusCode);
  const status = Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500;

  const logMessage = `${req.method} ${req.path} failed with HTTP ${status}.`;
  if (status >= 500) logger.error(logMessage, err);
  else logger.warn(logMessage);

  if (req.originalUrl.startsWith("/api/")) {
    const message = status >= 500
      ? "সার্ভারে সাময়িক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"
      : status === 404
        ? "এই API এন্ডপয়েন্ট পাওয়া যায়নি।"
        : status === 400
          ? "অনুরোধের তথ্য সঠিক নয়।"
          : status === 401
            ? "এই API ব্যবহারের জন্য বৈধ API key দিন।"
            : status === 429
              ? "API key-এর অনুরোধসীমা শেষ।"
              : err.message;
    return res.status(status).json({
      status: false,
      message,
    });
  }

  if (status === 404) return res.status(status).render("404");
  return res.status(status).send("Internal server error");
});

module.exports = app;

//_______________________ ┏ Modified By MrTomXxX ┓ _______________________\\
