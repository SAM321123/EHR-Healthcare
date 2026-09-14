const { caching } = require("cache-manager");

async function createMemoryCache() {
  const memoryCache = await caching('memory', {
    max: 100,
    ttl: 10 * 1000,
  });

  return memoryCache;
}

module.exports = createMemoryCache;
