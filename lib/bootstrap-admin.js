const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../model/user");

function getAdminConfig(env = process.env) {
  const username = env.ADMIN_USERNAME?.trim() || "";
  const email = env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const password = env.ADMIN_PASSWORD || "";
  const configuredValues = [username, email, password].filter(Boolean).length;

  if (configuredValues === 0) return null;
  if (configuredValues !== 3) {
    throw new Error("Admin bootstrap: set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD together.");
  }
  if (username.length < 4 || username.length > 20) {
    throw new Error("Admin bootstrap: ADMIN_USERNAME must be between 4 and 20 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Admin bootstrap: ADMIN_EMAIL must be a valid email address.");
  }
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    /\s/.test(password)
  ) {
    throw new Error("Admin bootstrap: ADMIN_PASSWORD must be a new secret of at least 12 characters with upper/lowercase letters and a number.");
  }

  return { username, email, password };
}

async function ensureBootstrapAdmin(env = process.env) {
  const config = getAdminConfig(env);
  if (!config) return { created: false, configured: false };

  const matches = await User.find({
    $or: [{ username: config.username }, { email: config.email }],
  }).limit(2);

  if (matches.length > 1) {
    throw new Error("Admin bootstrap: username and email belong to different accounts.");
  }

  if (matches.length === 1) {
    const existingUser = matches[0];
    if (existingUser.username !== config.username || existingUser.email !== config.email) {
      throw new Error("Admin bootstrap: username/email conflict with an existing account.");
    }
    if (!existingUser.isAdmin || !existingUser.isVerified) {
      existingUser.isAdmin = true;
      existingUser.isVerified = true;
      await existingUser.save();
      return { created: false, configured: true, promoted: true };
    }
    return { created: false, configured: true, promoted: false };
  }

  const passwordHash = await bcrypt.hash(config.password, 12);
  await User.create({
    username: config.username,
    email: config.email,
    password: passwordHash,
    isVerified: true,
    isAdmin: true,
    apikey: crypto.randomBytes(24).toString("hex"),
    limitApikey: Number(global.LimitApikey) || 200,
  });

  return { created: true, configured: true, promoted: false };
}

module.exports = { getAdminConfig, ensureBootstrapAdmin };
