const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();
// Export the instance
module.exports.asyncLocalStorage = asyncLocalStorage;
