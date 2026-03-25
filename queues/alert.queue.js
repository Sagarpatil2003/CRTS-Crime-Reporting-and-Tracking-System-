const { Queue } = require("bullmq");
const connection = require("../config/redis.config");

const alertQueue = new Queue("alert-notifications", {
    connection,
    defaultJobOptions: {
        attempts: 5, // Notifications are critical, try more times
        backoff: {
            type: 'exponential',
            delay: 2000 
        },
        removeOnComplete: true,
        removeOnFail: false // Keep failed alerts for debugging
    }
});

module.exports = alertQueue;