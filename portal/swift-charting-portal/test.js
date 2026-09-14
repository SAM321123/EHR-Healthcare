const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex'); // Generates a 32-byte key, converts to hex
console.log('Secret Key:', secretKey);