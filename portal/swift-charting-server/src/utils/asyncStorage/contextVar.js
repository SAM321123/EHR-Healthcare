const AsyncVar = require('./asyncVar');

const dbContextVar = new AsyncVar('dbContext');

module.exports = {
  dbContextVar,
};
