const CryptoJS = require('crypto-js');

const defaultSalt = 'swift-charting-Hrhk@1234';

const encryptCrypto = ({ data, salt = defaultSalt } = {}) => {
  const ciphertext = CryptoJS.AES.encrypt(data, salt).toString();
  return ciphertext;
};
const decryptCrypto = ({ ciphertext, salt = defaultSalt } = {}) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, salt);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
};

module.exports = {
  encryptCrypto,
  decryptCrypto,
};
