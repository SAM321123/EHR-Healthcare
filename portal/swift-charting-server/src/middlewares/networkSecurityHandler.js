const config = require('../config/config');
const { getDecryptedParams } = require('../utils/decryption/Decryption');
const { getEncryptedParams } = require('../utils/encryption/Encryption');

const encryptResponse = (data) => {
  const encyptedData = getEncryptedParams(data, config.encryption.response.key);
  return encyptedData;
};

const networkSecurityHandler = (req, res, next) => {
  const originalSend = res.send;
  res.send = (_body, { encrypt = true } = {}) => {
    const encryptedBody = encrypt && config.env !== 'development' ? encryptResponse(_body) : _body;
    res.send = originalSend;
    res.send(encryptedBody);
  };
  if (config.env === 'development') {
    next();
  } else {
    const { body, query } = req;
    if (req.body) {
      req.body = getDecryptedParams(body, config.decryption.request.key);
    }
    if (req.query) {
      req.query = getDecryptedParams(query, config.decryption.request.key);
    }
    next();
  }
};

module.exports = networkSecurityHandler;
