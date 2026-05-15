const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ivSize = 16;

/**
 * Encrypts a string using AES-256-CBC.
 * Returns the IV and ciphertext as a colon-separated string.
 */
function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(ivSize);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string formatted as "iv:ciphertext".
 */
function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
