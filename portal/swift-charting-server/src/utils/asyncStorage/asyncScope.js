const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

class AsyncScope {
  static get() {
    const scope = asyncLocalStorage.getStore();
    if (!scope) {
      throw new Error('Scope not found');
    }
    return scope;
  }

  constructor(callback) {
    const parentScope = asyncLocalStorage.getStore();
    if (parentScope) {
      Object.setPrototypeOf(this, parentScope);
    }
    asyncLocalStorage.run(this, callback);
  }
}

module.exports = AsyncScope;
