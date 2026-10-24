const assert = require("node:assert/strict");
const { test } = require("node:test");
const User = require("../model/user");
const dataweb = require("../model/DataWeb");
const { reserveApiKey } = require("../lib/api-key");

test("admin API key reservation does not decrement quota", async () => {
  const originalFindOne = User.findOne;
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  const originalUpdateOne = dataweb.updateOne;
  const adminUser = { apikey: "admin-key", isAdmin: true, isVerified: true };
  let usageUpdated = false;
  let quotaMutation = false;

  User.findOne = () => ({ lean: async () => adminUser });
  User.findOneAndUpdate = async () => {
    quotaMutation = true;
    return null;
  };
  dataweb.updateOne = async () => { usageUpdated = true; };

  try {
    const reserved = await reserveApiKey("admin-key");
    assert.equal(reserved, adminUser);
    assert.equal(usageUpdated, true);
    assert.equal(quotaMutation, false);
  } finally {
    User.findOne = originalFindOne;
    User.findOneAndUpdate = originalFindOneAndUpdate;
    dataweb.updateOne = originalUpdateOne;
  }
});
