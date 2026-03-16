const Redis = require('ioredis');
require('dotenv').config();

let redis = null;
let isRedisConnected = false;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis connection failed. Falling back to no-cache mode.');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
    isRedisConnected = true;
  });

  redis.on('error', (err) => {
    console.warn('Redis error:', err.message);
    isRedisConnected = false;
  });
} catch (error) {
  console.warn('Redis initialization failed. Falling back to no-cache mode.');
}

const getCache = async (key) => {
  if (!isRedisConnected || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
};

const setCache = async (key, value, ttl = 3600) => {
  if (!isRedisConnected || !redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    console.error('Redis set error:', err);
  }
};

const invalidateCache = async (pattern) => {
  if (!isRedisConnected || !redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis invalidate error:', err);
  }
};

module.exports = {
  getCache,
  setCache,
  invalidateCache,
  isRedisConnected: () => isRedisConnected
};
