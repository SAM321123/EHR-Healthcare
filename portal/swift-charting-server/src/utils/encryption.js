const CryptoJS = require('crypto-js');
const config = require('../config/config');

// Define a default key (32 characters long for AES-256)
const defaultSecretKey = config.secretKey;

// URL-safe Base64 encoding
function base64UrlEncode(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// URL-safe Base64 decoding
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return str;
}

// Function to encrypt the patient ID
function encrypt(text, secretKey = defaultSecretKey) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    const encryptedString = iv.toString(CryptoJS.enc.Hex) + encrypted.toString();
    return base64UrlEncode(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedString)));
}

// Function to decrypt the patient ID
function decrypt(base64UrlString, secretKey = defaultSecretKey) {
    const encryptedString = CryptoJS.enc.Base64.parse(base64UrlDecode(base64UrlString)).toString(CryptoJS.enc.Utf8);
    const iv = CryptoJS.enc.Hex.parse(encryptedString.slice(0, 32));
    const encrypted = encryptedString.slice(32);
    const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports={
    encrypt,
    decrypt,
}