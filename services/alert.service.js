const redis = require("../config/redis.config");
const NotificationModel = require('../models/notification.model')
const UserModel = require("../models/user.model")
const CaseModel = require('../models/case.model')
let io;


exports.initSocket = (_io) => {
  io = _io;
  console.log("Alert Service: Socket instance received.");
};

/**
 * @desc Generic Status Update (For any role)
 */
exports.sendUserStatusUpdate = async (userId, caseId, message) => {
  try {
    const notification = await NotificationModel.create({
      recipient: userId,
      type: 'STATUS_CHANGE',
      title: "Case Update 📢",
      message: message,
      relatedCase: caseId,
      priority: 'MEDIUM',
      actionUrl: `/my-reports/${caseId}`
    });

    if (io) {
      io.to(userId.toString()).emit("notification", notification);
    }
    return notification;
  } catch (error) {
    console.error("❌ Status update notification failed:", error);
  }
};

/**
 * @desc Officer Assignment with Dynamic Role Validation
 */
exports.sendAssignmentNotification = async (officerId, caseId) => { // Rename second param to caseId for clarity
  try {
    // 1. Fetch BOTH the Officer and the Case details
    const [user, caseDoc] = await Promise.all([
      UserModel.findById(officerId).select('role accountStatus'),
      CaseModel.findById(caseId) // Fetch the actual case object here!
    ]);

    // Safety Check for User
    if (!user || user.role !== 'OFFICER' || user.accountStatus !== 'ACTIVE') {
      console.warn(`⚠️ Assignment aborted: User ${officerId} is no longer an active Officer.`);
      return;
    }

    // Safety Check for Case
    if (!caseDoc) {
      console.error(`🚨 Notification failed: Case ${caseId} not found.`);
      return;
    }

    const newNotification = await NotificationModel.create({
      recipient: officerId,
      type: 'STATUS_CHANGE',
      title: "New Case Assigned 🚨",
      // Now caseDoc properties exist!
      message: `Action Required: Case #${caseDoc.caseNumber || caseDoc._id.toString().slice(-6)}`,
      relatedCase: caseDoc._id,
      priority: "HIGH",
      actionUrl: `/dashboard/cases/${caseDoc._id}`,
      metadata: {
        crimeType: caseDoc.crimeType,
        status: caseDoc.status
      }
    });

    if (io) {
      // .toString() safe now because we validated officerId exists
      io.to(officerId.toString()).emit("new_assignment", newNotification);
    }

    console.log(`alert.services - Assignment sent to verified Officer: ${officerId}`);
  } catch (error) {
    console.error("Assignment notification failed:", error);
  }
};


exports.storeUserLocation = async (userId, location) => {
  await redis.geoadd(
    "user_locations",
    location.coordinates[0],
    location.coordinates[1],
    userId.toString()
  );
};


exports.sendClusterAlert = async ({ location, crimeType, count }) => {
  const radius = 15000;
  const nearbyUsers = await redis.georadius(
    "user_locations",
    location.coordinates[0],
    location.coordinates[1],
    radius,
    "m"
  );

  let title = "Neighborhood Update 🏠";
  let description = `We noticed some ${crimeType} activity nearby. Just a heads up to stay aware!`;

  if (count > 5) {
    title = "Safety Alert ⚠️";
    description = `There's been an increase in ${crimeType} reports in your area recently. Please stay safe!`;
  }

  nearbyUsers.forEach(userId => {
    io.to(userId).emit("crime_alert", {
      title,
      message: description,
      severity: count > 5 ? "high" : "low",
      location
    });
  });
  console.log('Safety Alert ⚠️')
};


// services/alert.service.js
exports.sendAdminAlert = async (alertData) => {
  try {
    const { type, data } = alertData;

    // 1. Create a System Notification in the DB
    const adminNotification = await NotificationModel.create({
      recipientType: 'ADMIN',
      type: type,
      title: "🚨 Manual Dispatch Required",
      message: `Case ${data.caseId} could not be auto-assigned. Reason: ${data.reason} within ${data.radiusAttempted}.`,
      relatedId: data.caseId,
      priority: 'HIGH'
    });


    if (io) {
      io.to('admins').emit('ADMIN_NOTIFICATION', {
        notification: adminNotification,
        caseId: data.caseId
      });
    }

    console.log(`📢 Admin Alert Processed: ${type} for Case ${data.caseId}`);
    return adminNotification;
  } catch (error) {
    console.error("Error sending admin alert:", error);
    throw error;
  }
};

