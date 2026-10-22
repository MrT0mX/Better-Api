//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require("../settings");
const passport = require("passport");
require("../controller/passportLocal")(passport);
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const isGmail = require("is-gmail");
const resetToken = require("../model/resetTokens");
const user = require("../model/user");
const VerifyUser = require("../model/Verify-user");
const mailer = require("../controller/sendMail");
const bcryptjs = require("bcryptjs");
const passwordValidator = require("password-validator");
const generateApiKey = require("generate-api-key").default;
const containsEmoji = require("contains-emoji");
const Recaptcha = require("express-recaptcha").RecaptchaV2;
const { getRuntimeConfig } = require("../lib/runtime-config");
const { decryptValue } = require("../lib/runtime-config");
const { verifyTotp, hashRecoveryCode } = require("../lib/admin-totp");
const { recordAdminAudit } = require("../lib/admin-audit");
const { reserveAdminMfaAttempt } = require("../lib/admin-mfa-rate-limit");

function recaptchaMiddleware(method) {
  return async (req, res, next) => {
    try {
      const config = await getRuntimeConfig();
      if (!config.recaptcha_key_1 || !config.recaptcha_key_2) return next();
      const recaptcha = new Recaptcha(config.recaptcha_key_1, config.recaptcha_key_2);
      return recaptcha.middleware[method](req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

const renderCaptcha = recaptchaMiddleware("render");
const verifyCaptcha = recaptchaMiddleware("verify");

//_______________________ ┏ Function ┓ _______________________\\

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.set(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
    );
    next();
  } else {
    req.flash("error_messages", "Please Login to continue !");
    res.redirect("/login");
  }
}

function captchaForgotPassword(req, res, next) {
  if (recaptcha && req.recaptcha && req.recaptcha.error) {
    req.flash("error_messages", "reCAPTCHA Tidak Valid");
    res.redirect("/forgot-password");
  } else {
    return next();
  }
}

function captchaResetPassword(req, res, next) {
  const { token } = req.body;
  if (recaptcha && req.recaptcha && req.recaptcha.error) {
    req.flash("error_messages", "reCAPTCHA Tidak Valid");
    res.redirect(`/reset-password?token=${token}`);
  } else {
    return next();
  }
}

function captchaRegister(req, res, next) {
  if (recaptcha && req.recaptcha && req.recaptcha.error) {
    req.flash("error_messages", "reCAPTCHA Tidak Valid");
    res.redirect("/signup");
  } else {
    return next();
  }
}

function captchaLogin(req, res, next) {
  if (recaptcha && req.recaptcha && req.recaptcha.error) {
    req.flash("error_messages", "reCAPTCHA Tidak Valid");
    res.redirect("/login");
  } else {
    return next();
  }
}

//_______________________ ┏ Router ┓ _______________________\\

router.get("/login", renderCaptcha, (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/docs");
  } else if (req.session.adminMfaPending) {
    res.redirect("/login/totp");
  } else {
    res.render("login", {
      csrfToken: req.csrfToken(),
      recaptcha: res.recaptcha || null,
    });
  }
});

router.post(
  "/login",
  verifyCaptcha,
  captchaLogin,
  (req, res, next) => {
    passport.authenticate("local", { failureFlash: true }, async (error, account, info) => {
      if (error) return next(error);
      if (!account) {
        req.flash("error", info?.message || "Login failed.");
        return res.redirect("/login");
      }
      if (account.isAdmin && account.adminMfaEnabled) {
        return req.session.regenerate((sessionError) => {
          if (sessionError) return next(sessionError);
          req.session.adminMfaPending = {
            userId: String(account._id),
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
          };
          return req.session.save((saveError) => {
            if (saveError) return next(saveError);
            return res.redirect("/login/totp");
          });
        });
      }
      try {
        if (account.isAdmin) {
          await recordAdminAudit(req, {
            actorId: account._id,
            actor: account.username,
            action: "admin.login",
            details: { mfa: "disabled" },
          });
        }
        return req.logIn(account, (loginError) => {
          if (loginError) return next(loginError);
          return res.redirect("/docs");
        });
      } catch (auditError) {
        return next(auditError);
      }
    })(req, res, next);
  }
);

router.get("/login/totp", (req, res) => {
  const challenge = req.session.adminMfaPending;
  if (!challenge || challenge.expiresAt < Date.now() || challenge.attempts >= 6) {
    delete req.session.adminMfaPending;
    req.flash("error", "Admin verification session শেষ হয়েছে। আবার login করুন।");
    return res.redirect("/login");
  }
  return res.render("login-totp", { csrfToken: req.csrfToken() });
});

router.post("/login/totp", async (req, res, next) => {
  const challenge = req.session.adminMfaPending;
  if (!challenge || challenge.expiresAt < Date.now() || challenge.attempts >= 6) {
    delete req.session.adminMfaPending;
    req.flash("error", "Admin verification session শেষ হয়েছে। আবার login করুন।");
    return res.redirect("/login");
  }

  try {
    const attempt = await reserveAdminMfaAttempt(challenge.userId);
    if (!attempt) {
      req.flash("error", "Admin MFA-তে অনেকবার চেষ্টা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।");
      return res.status(429).redirect("/login/totp");
    }
    const admin = await user.findOne({
      _id: challenge.userId,
      isAdmin: true,
      isVerified: true,
      adminMfaEnabled: true,
    }).select("+adminMfaSecret adminMfaRecoveryHashes adminMfaLastStep username");
    let verified = false;
    if (admin?.adminMfaSecret) {
      const secret = decryptValue(admin.adminMfaSecret);
      const matchedStep = verifyTotp(secret, String(req.body.code || ""));
      if (matchedStep !== null) {
        const updated = await user.updateOne(
          { _id: admin._id, adminMfaEnabled: true, adminMfaLastStep: { $lt: matchedStep } },
          { $set: { adminMfaLastStep: matchedStep } }
        );
        verified = updated.modifiedCount === 1;
      } else {
        const recoveryHash = hashRecoveryCode(String(req.body.code || ""));
        const consumed = await user.updateOne(
          { _id: admin._id, adminMfaRecoveryHashes: recoveryHash },
          { $pull: { adminMfaRecoveryHashes: recoveryHash } }
        );
        verified = consumed.modifiedCount === 1;
      }
    }

    if (!verified) {
      challenge.attempts += 1;
      await recordAdminAudit(req, {
        actorId: challenge.userId,
        actor: "admin",
        action: "admin.mfa.login",
        outcome: "failure",
      });
      req.flash("error", "কোডটি সঠিক নয় বা ইতিমধ্যে ব্যবহার হয়েছে।");
      return res.redirect(challenge.attempts >= 6 ? "/login" : "/login/totp");
    }

    await recordAdminAudit(req, {
      actorId: admin._id,
      actor: admin.username,
      action: "admin.login",
      details: { mfa: "verified" },
    });
    delete req.session.adminMfaPending;
    return req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);
      return req.logIn(admin, (loginError) => {
        if (loginError) return next(loginError);
        req.session.adminMfaVerifiedUserId = String(admin._id);
        return res.redirect("/docs");
      });
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/signup", renderCaptcha, (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/docs");
  } else {
    res.render("signup", {
      csrfToken: req.csrfToken(),
      recaptcha: res.recaptcha || null,
    });
  }
});

router.post(
  "/signup",
  verifyCaptcha,
  captchaRegister,
  async (req, res) => {
    const { email, username, password, confirmpassword } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    var createpw = new passwordValidator();
    createpw
      .is()
      .min(8)
      .is()
      .max(30)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces()
      .is()
      .not()
      .oneOf(["Passw0rd", "Password123"]);

    var checkpw = createpw.validate(password);

    if (!usetempemail) {
      var checkemail = await isGmail(normalizedEmail);
    } else {
      var checkemail = true;
    }

    if (!email || !username || !password || !confirmpassword) {
      req.flash("error_messages", "All Fields Required !");
      res.redirect("/signup");
    } else if (password != confirmpassword) {
      req.flash("error_messages", "Password Don't Match !");
      res.redirect("/signup");
    } else if (!checkpw) {
      req.flash(
        "error_messages",
        "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text"
      );
      res.redirect("/signup");
    } else if (containsEmoji(password)) {
      req.flash(
        "error_messages",
        "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text"
      );
      res.redirect("/signup");
    } else if (username.length < 4) {
      req.flash("error_messages", "Username cannot be less than 4 characters");
      res.redirect("/signup");
    } else if (username.length > 20) {
      req.flash("error_messages", "Username cannot exceed 20 characters");
      res.redirect("/signup");
    } else if (containsEmoji(username)) {
      req.flash("error_messages", "Username Can't Use Emoji");
      res.redirect("/signup");
    } else if (!checkemail) {
      req.flash("error_messages", "Sorry, We Only Accept Email From Gmail");
      res.redirect("/signup");
    } else {
      user.findOne(
        { $or: [{ email: normalizedEmail }, { username: username }] },
        function (err, data) {
          if (err) throw err;
          if (data) {
            req.flash("error_messages", "User Exists, Try Logging In !");
            res.redirect("/signup");
          } else {
            bcryptjs.genSalt(12, (err, salt) => {
              if (err) throw err;
              bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err;
                user({
                  username: username,
                  email: normalizedEmail,
                  password: hash,
                  apikey: generateApiKey({ method: "bytes", length: 8 }),
                  limitApikey: LimitApikey,
                }).save((err, data) => {
                  if (err) throw err;
                  req.flash(
                    "success_messages",
                    "Account has been created, please login"
                  );
                  res.redirect("/login");
                });
              });
            });
          }
        }
      );
    }
  }
);

router.get("/send-verification-email", checkAuth, async (req, res) => {
  var check = await VerifyUser.findOne({ email: req.user.email });
  if (req.user.isVerified) {
    res.redirect("/docs");
  } else {
    if (check) {
      req.flash("error_messages", "Please Dont Spam Wait After 30 min.");
      res.redirect("/docs");
    } else {
      var token = crypto.randomBytes(32).toString("hex");
      await VerifyUser({ token: token, email: req.user.email }).save();
      var mail = await mailer.sendVerifyEmail(req.user.email, token);
      if (mail == "error") {
        req.flash("error_messages", "Error Please Try Again Tomorrow");
        res.redirect("/docs");
      } else {
        req.flash(
          "success_messages",
          "Done Sent Email, Please Check Spam Folder, Expired After 30 min."
        );
        res.redirect("/docs");
      }
    }
  }
});

router.get("/verifyemail", async (req, res) => {
  const token = req.query.token;
  if (token) {
    var check = await VerifyUser.findOne({ token: token });
    if (check) {
      var userData = await user.findOne({ email: check.email });
      userData.isVerified = true;
      await userData.save();
      await VerifyUser.findOneAndDelete({ token: token });
      res.redirect("/docs");
    } else {
      if (req.user) {
        res.redirect("docs");
      } else {
        req.flash("error_messages", "Link Expired Or Error");
        res.redirect("/login");
      }
    }
  } else {
    if (req.user) {
      res.redirect("docs");
    } else {
      req.flash("error_messages", "Token Missing");
      res.redirect("/login");
    }
  }
});

router.get(
  "/forgot-password",
  renderCaptcha,
  async (req, res) => {
    res.render("forgot-password.ejs", {
      csrfToken: req.csrfToken(),
      recaptcha: res.recaptcha || null,
    });
  }
);

router.post(
  "/forgot-password",
  verifyCaptcha,
  captchaForgotPassword,
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      req.flash("error_messages", "All Fields Required !");
      res.redirect("/forgot-password");
    }
    var userData = await user.findOne({ email: email });
    var Cooldown = await resetToken.findOne({ email: email });

    if (userData) {
      if (Cooldown) {
        req.flash(
          "error_messages",
          "Please Dont Spam Wait After 30 min after new submit."
        );
        res.redirect("/forgot-password");
      } else {
        var token = crypto.randomBytes(32).toString("hex");
        var mail = await mailer.sendResetEmail(email, token);
        if (mail == "error") {
          req.flash("error_messages", "Error Please Try Again Tomorrow");
          res.redirect("/forgot-password");
        } else {
          await resetToken({ token: token, email: email }).save();
          req.flash(
            "success_messages",
            "Check your email for more info, wait 30 min after new submit."
          );
          res.redirect("/forgot-password");
        }
      }
    } else {
      req.flash("error_messages", "No user Exists with this email");
      res.redirect("/forgot-password");
    }
  }
);

router.get("/reset-password", renderCaptcha, async (req, res) => {
  const token = req.query.token;

  if (token) {
    var check = await resetToken.findOne({ token: token });
    if (check) {
      res.render("forgot-password.ejs", {
        csrfToken: req.csrfToken(),
        recaptcha: res.recaptcha || null,
        reset: true,
        email: check.email,
        token: token,
      });
    } else {
      req.flash("error_messages", "Token Tampered or Expired.");
      res.redirect("/forgot-password");
    }
  } else {
    res.redirect("/login");
  }
});

router.post(
  "/reset-password",
  verifyCaptcha,
  captchaResetPassword,
  async (req, res) => {
    const { password, confirmpassword, email, token } = req.body;
    var resetpw = new passwordValidator();
    resetpw
      .is()
      .min(8)
      .is()
      .max(30)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces()
      .is()
      .not()
      .oneOf(["Passw0rd", "Password123"]);

    var checkpw = resetpw.validate(password);

    if (!password || !confirmpassword || confirmpassword != password) {
      req.flash("error_messages", "Passwords Don't Match !");
      res.redirect(`/reset-password?token=${token}`);
    } else if (!checkpw) {
      req.flash(
        "error_messages",
        "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text"
      );
      res.redirect(`/reset-password?token=${token}`);
    } else {
      var salt = await bcryptjs.genSalt(12);
      if (salt) {
        var hash = await bcryptjs.hash(password, salt);
        await user.findOneAndUpdate(
          { email: email },
          { $set: { password: hash } }
        );
        await resetToken.findOneAndDelete({ token: token });
        req.flash("success_messages", "Password Has Change");
        res.redirect("/login");
      } else {
        req.flash("error_messages", "Unexpected Error Try Again");
        res.redirect(`/reset-password?token=${token}`);
      }
    }
  }
);

module.exports = router;
