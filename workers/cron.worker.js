const { Queue, Worker } = require('bullmq');
const connection = require('../config/redis.config');
const assignmentService = require('../services/assignment.service');

const cronQueue = new Queue('scheduler-queue', { connection });


cronQueue.add('CLEANUP_ASSIGNMENTS', {}, {
    repeat: { cron: '*/15 * * * *' } 
});

const cronWorker = new Worker('scheduler-queue', async (job) => {
    if (job.name === 'CLEANUP_ASSIGNMENTS') {
        await assignmentService.processExpiredAssignments();
    }
}, { connection });

module.exports = cronWorker