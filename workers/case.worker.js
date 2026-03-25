const { Worker } = require('bullmq');
const connection = require('../config/redis.config');
const CaseModel = require('../models/case.model');
const UserModel = require('../models/user.model');
const geoService = require('../services/geo.service');
const alertQueue = require('../queues/alert.queue');
const assignmentService = require("../services/assignment.service")

/**
 * @desc Background Worker to handle Case Processing
 * Logic: Cluster Detection -> Find Nearby Officers -> Auto-Assignment -> Notify Alert Queue
 */
const worker = new Worker("case-processing", async (job) => {
    const { caseId, location, crimeType, isMerged } = job.data;

    try {
        console.log(`🚀 Start Processing Case: ${caseId}`);

        // --- STEP 1: CLUSTER DETECTION ---
        // Checks if this new- crime is part of a growing trend in the area
        const result = await geoService.detectCluster({ location, crimeType });

        if (result.isCluster) {
            const caseIds = result.cases.map(c => c._id);
            const headId = caseIds[0];

            // Update all related cases to reflect they belong to this cluster
            await CaseModel.updateMany(
                { _id: { $in: [...caseIds, caseId] } },
                {
                    $set: {
                        isClustered: true,
                        clusterHeadId: headId,
                        clusterSize: result.count + 1
                    }
                }
            );

            // Add job to Alert Queue to broadcast safety alerts to nearby civilians
            await alertQueue.add("CLUSTER_ALERT", {
                type: "CLUSTER_BROADCAST",
                data: { location, crimeType, count: result.count }
            });

            console.log(`Case merged into Cluster: ${headId}`);
        }

        if (isMerged) {
            console.log(`⏭️ Skipping assignment: Incident was merged into existing case.`);
            return;
        }
        // --- STEP 2: SMART ASSIGNMENT ---
        // When a new report is created
        const coords = location.coordinates || location
        const caseDetails = await assignmentService.assignOfficerToCase(caseId, coords)
    
        // CRITICAL: Check if caseDetails was actually returned and has the officer
        if (caseDetails && caseDetails.assignedOfficer) {
            await alertQueue.add("ASSIGNMENT_NOTIFICATION", {
                type: "ASSIGNMENT_NOTIFICATION",
                data: {
                    // Use the data directly from the returned caseDetails
                    officerId: caseDetails.assignedOfficer.toString(),
                    caseDetails: caseDetails._id.toString()
                }
            });
            console.log(`✅ Notification queued for Officer: ${caseDetails.assignedOfficer}`)
        } else {
            console.warn("⚠️ Assignment returned null or missing officer. Skipping notification.")
        }

    } catch (error) {
        console.error(`🚨 Workflow Failed for Job ${job.id}:`, error.message)
        throw error; // Let BullMQ handle the retry based on job options
    }
}, { connection })

module.exports = worker