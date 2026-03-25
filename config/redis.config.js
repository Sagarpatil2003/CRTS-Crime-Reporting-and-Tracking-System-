const Redis = require("ioredis");

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: 'default', // Force "default" instead of "SCI"
    password: 'br59cBZ9J36IUHhzjKkcJxtLKg5WCytd', // Use the clean password
    maxRetriesPerRequest: null,
}

const redisConnection = new Redis(redisConfig);

module.exports = redisConnection;
