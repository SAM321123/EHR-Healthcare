/* eslint-disable no-undef */
module.exports = () => {
  const crypto = window.crypto || window.msCrypto;
  const array = new Uint32Array(1);
  return crypto.getRandomValues(array)[0];
};
