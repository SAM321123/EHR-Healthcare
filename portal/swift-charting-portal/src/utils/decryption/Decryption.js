/* eslint-disable no-empty */
/* eslint-disable new-cap */
/* eslint-disable import/extensions */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-const */
/* eslint-disable radix */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
const _ = require('lodash');

const decryptUsingRSA = function (cipherText, privateKey) {
  function stripLineFeeds(str) {
    if (!str) str = '';
    //  var re = RegExp(String.fromCharCode(13),'g');//\r
    //  var re = RegExp(String.fromCharCode(10),'g');//\n
    let s = '';
    s = str.replace(/\n/g, '');
    s = s.replace(/\r/g, '');
    return s;
  }

  function certParser(cert) {
    const lines = cert.split('\n');
    let read = false;
    let b64 = false;
    // var end = false;
    let flag = '';
    const retObj = {};
    retObj.info = '';
    retObj.salt = '';
    retObj.iv = '';
    retObj.b64 = '';
    retObj.aes = false;
    retObj.mode = '';
    retObj.bits = 0;
    for (let i = 0; i < lines.length; i++) {
      flag = lines[i].substr(0, 9);
      if (
        i == 1 &&
        flag != 'Proc-Type' &&
        flag.indexOf('M') == 0 // unencrypted cert?
      )
        b64 = true;
      switch (flag) {
        case '-----BEGI':
          read = true;
          break;
        case 'Proc-Type':
          if (read) retObj.info = lines[i];
          break;
        case 'DEK-Info:':
          if (read) {
            const tmp = lines[i].split(',');
            const dek = tmp[0].split(': ');
            const aes = dek[1].split('-');
            retObj.aes = aes[0] == 'AES';
            retObj.mode = aes[2];
            retObj.bits = parseInt(aes[1]);
            retObj.salt = tmp[1].substr(0, 16);
            retObj.iv = tmp[1];
          }
          break;
        case '':
          if (read) b64 = true;
          break;
        case '-----END ':
          if (read) {
            b64 = false;
            read = false;
          }
          break;
        default:
          if (read && b64) retObj.b64 += stripLineFeeds(lines[i]);
      }
    }
    return retObj;
  }

  function decodeBase64(str, utf8decode) {
    if (!str) str = '';
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    utf8decode = typeof utf8decode === 'undefined' ? false : utf8decode;
    let o1;
    let o2;
    let o3;
    let h1;
    let h2;
    let h3;
    let h4;
    let bits;
    const d = [];
    let plain;
    let coded;
    const pidCryptUtil = {};
    coded = utf8decode ? pidCryptUtil.decodeUTF8(str) : str;

    for (let c = 0; c < coded.length; c += 4) {
      // unpack four hexets into three octets
      h1 = b64.indexOf(coded.charAt(c));
      h2 = b64.indexOf(coded.charAt(c + 1));
      h3 = b64.indexOf(coded.charAt(c + 2));
      h4 = b64.indexOf(coded.charAt(c + 3));

      bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;

      o1 = (bits >>> 16) & 0xff;
      o2 = (bits >>> 8) & 0xff;
      o3 = bits & 0xff;

      d[c / 4] = String.fromCharCode(o1, o2, o3);
      // check for padding
      if (h4 == 0x40) d[c / 4] = String.fromCharCode(o1, o2);
      if (h3 == 0x40) d[c / 4] = String.fromCharCode(o1);
    }
    plain = d.join(''); // join() is far faster than repeated string concatenation

    plain = utf8decode ? pidCryptUtil.decodeUTF8(plain) : plain;

    return plain;
  }

  function toByteArray(str) {
    if (!str) str = '';
    const ba = [];
    for (let i = 0; i < str.length; i++) ba[i] = str.charCodeAt(i);

    return ba;
  }

  function convertToHex(str) {
    if (!str) str = '';
    let hs = '';
    let hv = '';
    for (let i = 0; i < str.length; i++) {
      hv = str.charCodeAt(i).toString(16);
      hs += hv.length == 1 ? `0${hv}` : hv;
    }
    return hs;
  }

  let asn = require('./asn.js');
  const rsa = require('./rsa.js');


  const RSA = new rsa();
  const params = certParser(privateKey);
  const decryptionKey = decodeBase64(params.b64);
  asn = asn.decode(toByteArray(decryptionKey));
  const tree = asn.toHexTree();
  RSA.setPrivateKeyFromASN(tree);
  cipherText = decodeBase64(stripLineFeeds(cipherText));
  return RSA.decrypt(convertToHex(cipherText));
};

const decryptUsingAES = function (cipherText, symmetricKey) {
  const { CryptoJS } = require('node-cryptojs-aes');
  const plainText = CryptoJS.AES.decrypt(cipherText, symmetricKey);
  return CryptoJS.enc.Utf8.stringify(plainText);
};

const getDecryptedParams = (params, key) => {
  const keyInEncryptedBody = 'rq';
  if (params && params[`${keyInEncryptedBody}k`] && params[keyInEncryptedBody]) {
    const aesKey = decryptUsingRSA(params[`${keyInEncryptedBody}k`], key);
    let decryptedParams = decryptUsingAES(params[keyInEncryptedBody], aesKey);
    delete params[`${keyInEncryptedBody}k`];
    delete params[keyInEncryptedBody];
    try {
      decryptedParams = JSON.parse(decryptedParams);
    } catch (e) { }
    if (_.isArray(decryptedParams) && _.isEmpty(params)) {
      params = [ ...decryptedParams]
    } else {
      params = { ...params, ...decryptedParams };
    }
  }
  return params;
};

export {
  getDecryptedParams,
};
