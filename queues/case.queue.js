const { Queue } = require("bullmq")
const connection = require("../config/redis.config")

const caseQueue = new Queue("case-processing", {
    connection,
    defaultJobOptions: {
        attempts: 3, // retry 3 time of failure
        backoff: {
            type: 'exponential', // The wait time doubles each time.
            delay: 5000 // Wait 5s before first retry
        },
        removeOnComplete: true, // Clean up Redis memory
    }
})

module.exports = caseQueue