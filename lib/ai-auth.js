require("../settings");
const User = require("../model/user");
const { reserveApiKey } = require("./api-key");

async function identifyAIUser(req, res, next) {
  let user;

  if (req.isAuthenticated?.() && req.user?.id) {
    user = await User.findById(req.user.id)
      .select("_id apikey isVerified username")
      .lean();
  } else {
    const apikey = req.query.apikey || req.get("x-api-key");
    if (!apikey) {
      return res.status(401).json({
        status: false,
        message: "AI guest mode-এ বন্ধ। Login করুন অথবা verified account API key দিন।",
      });
    }
    user = await User.findOne({ apikey })
      .select("_id apikey isVerified username")
      .lean();
  }

  if (!user) {
    return res.status(401).json({
      status: false,
      message: "এই account/API key পাওয়া যায়নি। আবার লগইন করে চেষ্টা করুন।",
    });
  }
  if (!user.isVerified) {
    return res.status(403).json(global.loghandler.verify);
  }
  if (!user.apikey) {
    return res.status(403).json({
      status: false,
      message: "এই account-এর API key তৈরি হয়নি। Support-এর সঙ্গে যোগাযোগ করুন।",
    });
  }

  req.aiAccount = { apikey: user.apikey, userId: user._id };
  return next();
}

async function reserveAIQuota(req, res, next) {
  const user = await reserveApiKey(req.aiAccount.apikey);
  if (!user) {
    return res.status(429).json({
      status: false,
      message: "আপনার API request quota শেষ। পরে আবার চেষ্টা করুন।",
    });
  }

  req.aiUser = user;
  return next();
}

module.exports = { identifyAIUser, reserveAIQuota };
