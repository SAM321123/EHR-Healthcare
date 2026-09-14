const AsyncScope = require('./asyncScope');

class AsyncVar {
  constructor(name) {
    this.name = name;
    this.symbol = Symbol(name);
  }

  set(value) {
    const scope = AsyncScope.get();
    scope[this.symbol] = value;
  }

  get() {
    if (!this.exists()) {
      throw new Error(`Variable "${this.name}" not found`);
    }
    const scope = AsyncScope.get();
    return scope[this.symbol];
  }

  exists() {
    const scope = AsyncScope.get();
    return this.symbol in scope;
  }
}

module.exports = AsyncVar;
