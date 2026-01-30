const crypto = require("crypto");

/**
 * Returns a unique string value suitable for tokens/IDs.
 * IMPORTANT: use for verification tokens, one-time links, etc.
 * Nota bene: uses crypto for unpredictability; hex length 32 = 64 chars.
 * @returns {string} URL-safe unique value
 */
function getUniqIdValue() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = { getUniqIdValue };
