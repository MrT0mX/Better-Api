const User = require("../model/user");
const dataweb = require("../model/DataWeb");
require("../settings");
const creator = global.creator;
const loghandler = global.loghandler;

async function reserveApiKey(apikey) {
  const user = await User.findOneAndUpdate(
    { apikey, isVerified: true, limitApikey: { $gt: 0 } },
    { $inc: { limitApikey: -1 } },
    { new: true }
  );

  if (!user) return null;

  await dataweb.updateOne({}, { $inc: { RequestToday: 1 } }, { upsert: true });
  return user;
}

async function checkApiKey(req, res, next) {
  const apikey = req.query.apikey || req.get("x-api-key");
  if (!apikey) {
    return res.status(401).json({
      status: false,
      creator,
      message: "API key অনুপস্থিত। apikey প্যারামিটার অথবা x-api-key header দিন।",
    });
  }

  const user = await User.findOne({ apikey }).select("isVerified limitApikey").lean();
  if (!user) {
    return res.status(401).json({ status: false, creator, message: "API key সঠিক নয়।" });
  }
  if (!user.isVerified) return res.status(403).json(loghandler.verify);
  if (user.limitApikey <= 0) {
    return res.status(429).json({ status: false, creator, message: "API key-এর অনুরোধসীমা শেষ।" });
  }

  const reservedUser = await reserveApiKey(apikey);
  if (!reservedUser) {
    return res.status(429).json({ status: false, creator, message: "API key-এর অনুরোধসীমা শেষ।" });
  }

  req.apiUser = reservedUser;
  return next();
}

module.exports = checkApiKey;
