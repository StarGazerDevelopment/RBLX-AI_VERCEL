const { Redis } = require("@upstash/redis");

let redisClient = null;

function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function getRedis() {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisClient;
}

async function safeGet(key) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return redis.get(key);
}

async function safeSet(key, value, options) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return redis.set(key, value, options);
}

async function safeDel(...keys) {
  const redis = getRedis();
  if (!redis || keys.length === 0) {
    return 0;
  }

  return redis.del(...keys);
}

async function safeExpire(key, seconds) {
  const redis = getRedis();
  if (!redis) {
    return 0;
  }

  return redis.expire(key, seconds);
}

async function safeIncrBy(key, amount) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return redis.incrby(key, amount);
}

module.exports = {
  getRedis,
  isRedisConfigured,
  safeGet,
  safeSet,
  safeDel,
  safeExpire,
  safeIncrBy,
};
