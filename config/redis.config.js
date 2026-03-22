const Redis = require("ioredis");

const redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null, // Critical for BullMQ
}

const redisConnection = new Redis(redisConfig);

module.exports = redisConnection;