const crypto = require("crypto");

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeBase32(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function decodeBase32(input) {
  const normalized = input.replace(/=+$/g, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const output = [];
  for (const character of normalized) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Invalid base32 secret.");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function generateTotpSecret() {
  return encodeBase32(crypto.randomBytes(20));
}

function totpAt(secret, timestamp = Date.now(), stepSeconds = 30) {
  const counter = Math.floor(timestamp / 1000 / stepSeconds);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return { code: String(code).padStart(6, "0"), step: counter };
}

function verifyTotp(secret, input, timestamp = Date.now(), window = 1) {
  if (typeof input !== "string" || !/^\d{6}$/.test(input)) return null;
  const current = Math.floor(timestamp / 1000 / 30);
  for (let drift = -window; drift <= window; drift += 1) {
    const { code, step } = totpAt(secret, (current + drift) * 30_000);
    const expected = Buffer.from(code);
    const supplied = Buffer.from(input);
    if (crypto.timingSafeEqual(expected, supplied)) return step;
  }
  return null;
}

function createTotpUri(secret, username, issuer = "Better-Api") {
  const label = encodeURIComponent(`${issuer}:${username}`);
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${query}`;
}

function createRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => crypto.randomBytes(12).toString("hex").toUpperCase());
}

function hashRecoveryCode(code) {
  return crypto.createHash("sha256").update(code.replace(/[\s-]/g, "").toUpperCase()).digest("hex");
}

module.exports = {
  encodeBase32,
  decodeBase32,
  generateTotpSecret,
  totpAt,
  verifyTotp,
  createTotpUri,
  createRecoveryCodes,
  hashRecoveryCode,
};
