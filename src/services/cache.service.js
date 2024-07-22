const NodeCache = require('node-cache');

const { TIME_CACHE_DEFAULT } = require('../constants');

class CacheService {
  constructor() {
    this.cache = new NodeCache();
  }

  set(key, value, ttl = TIME_CACHE_DEFAULT) {
    this.cache.set(key, value, ttl);
  }

  mset(data) {
    this.cache.mset(data);
  }

  del(key) {
    this.cache.del(key);
  }

  mdel(keys) {
    this.cache.del(keys);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  take(key) {
    return this.cache.take(key);
  }

  keys() {
    return this.cache.keys();
  }

  getAndSetTTL(key, ttl = 10800) {
    const value = this.get(key);
    if (value) {
      this.cache.ttl(key, ttl);
      return value;
    }
    return null;
  }
}

module.exports = new CacheService();
