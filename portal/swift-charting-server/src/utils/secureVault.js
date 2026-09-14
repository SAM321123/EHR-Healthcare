const crypto = require('crypto');
const config = require('../config/config');

const VERSION = 'v1';

const getKey = () => {
  const material = config?.secretKey || config?.jwt?.secret || process.env.JWT_SECRET || '';
  if (!material) {
    throw new Error('Missing encryption key material');
  }
  // Derive a stable 32-byte key for AES-256-GCM.
  return crypto.createHash('sha256').update(String(material), 'utf8').digest();
};

const encryptString = (plaintext) => {
  if (plaintext === null || plaintext === undefined) return null;
  const text = String(plaintext);
  if (text.trim() === '') return null;

  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
};

const decryptString = (payload) => {
  if (!payload) return null;
  const parts = String(payload).split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Invalid encrypted payload format');
  }

  const [, ivB64, tagB64, dataB64] = parts;
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return plaintext;
};

const maskSecret = (value) => {
  if (!value) return null;
  const s = String(value);
  const last4 = s.slice(-4);
  return `****${last4}`;
};

module.exports = {
  encryptString,
  decryptString,
  maskSecret,
};

