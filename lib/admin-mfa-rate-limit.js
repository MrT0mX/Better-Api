const AdminMfaAttempt = require("../model/AdminMfaAttempt");

async function reserveAdminMfaAttempt(userId, now = new Date(), limit = 6) {
  const bucket = now.toISOString().slice(0, 16);
  const filter = { userId, bucket };
  try {
    await AdminMfaAttempt.updateOne(
      filter,
      { $setOnInsert: { ...filter, attempts: 0, expiresAt: new Date(now.getTime() + 2 * 60 * 1000) } },
      { upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  return AdminMfaAttempt.findOneAndUpdate(
    { ...filter, attempts: { $lt: limit } },
    { $inc: { attempts: 1 } },
    { new: true }
  );
}

module.exports = { reserveAdminMfaAttempt };
