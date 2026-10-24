const mongoose = require("mongoose");

const appSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  ciphertext: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("AppSetting", appSettingSchema);
