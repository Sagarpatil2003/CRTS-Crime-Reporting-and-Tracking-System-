const CaseModel = require('../models/case.model')

const detectCluster = async (req, res, next) => {
    const { location, crimeType } = req.body

    // 1. Define the "Spatio-Temporal" window
    const radiusInMeters = 500
    const timeWindow = new Date(Data.now() - 30 * 60 * 1000)

    // Find all candidate cases
    const nearbyCase = await CaseModel.find({
        crimeType,
        status: { $ne: 'CLOSED' },
        createdAt: { $gte: timeWindow },
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: location.coordinates },
                $maxDistance: radiusInMeters
            }
        }
    }).limit(5)

    if (nearbyCase.length > 0) {
        //    Attach the most relevant case
        req.clusterHead = nearbyCases[0];
        req.isPartofCluster = true;
    }
    next()
}

module.exports = detectCluster
// "Case Clustering" Works
// Instead of looking for a direct match, the system looks for "Density."
// If 5 reports pop up within a 300m radius within 15 minutes, the system marks them as a Cluster Incident.