const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  encodeBase32,
  decodeBase32,
  totpAt,
  verifyTotp,
  createTotpUri,
  generateTotpSecret,
  createRecoveryCodes,
  hashRecoveryCode,
} = require("../lib/admin-totp");

test("TOTP matches RFC 6238 SHA-1 six-digit vector", () => {
  const secret = encodeBase32(Buffer.from("12345678901234567890"));
  assert.equal(totpAt(secret, 59000).code, "287082");
  assert.equal(decodeBase32(secret).toString(), "12345678901234567890");
});

test("TOTP accepts only current adjacent time window and six numeric digits", () => {
  const secret = generateTotpSecret();
  const time = 1_700_000_000_000;
  const { code, step } = totpAt(secret, time);
  assert.equal(verifyTotp(secret, code, time), step);
  assert.equal(verifyTotp(secret, "not-a-code", time), null);
  assert.equal(verifyTotp(secret, "00000000", time), null);
});

test("TOTP URI and one-time recovery codes use expected safe formats", () => {
  const secret = generateTotpSecret();
  assert.match(createTotpUri(secret, "admin"), /^otpauth:\/\/totp\//);
  const codes = createRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(hashRecoveryCode(codes[0]), hashRecoveryCode(codes[0].toLowerCase()));
});
