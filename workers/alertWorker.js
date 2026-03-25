const { Worker } = require('bullmq');
const connection = require('../config/redis.config');
const alertService = require('../services/alert.service');

const alertWorker = new Worker("alert-notifications", async (job) => {
    const { type, data } = job.data;

    try {
        switch (type) {
            case "ASSIGNMENT_NOTIFICATION":
                // data = { officerId, caseDetails }
                await alertService.sendAssignmentNotification(data.officerId, data.caseDetails);
                console.log("alert worker sendAssignmentNotification")
                break;

            case "CLUSTER_BROADCAST":
                // data = { location, crimeType, count }
                await alertService.sendClusterAlert(data);
                break;

            case "STATUS_UPDATE":
                // data = { userId, message, caseId }
                await alertService.sendUserStatusUpdate(data.userId, data.caseId, data.message);
                break;

            case "ADMIN_ALERT":
                // Handling the manual dispatch requirement
                await alertService.sendAdminAlert({ type, data });
                break;
            
            default:
                console.warn(`❓ Unknown alert type: ${type}`);
        }
    } catch (error) {
        console.error(`🚨 Alert Job ${job.id} failed:`, error.message);
        throw error;
    }
}, { connection });

alertWorker.on("completed", (job) => console.log(`🔔 Alert sent: ${job.id}`));

module.exports = alertWorker;