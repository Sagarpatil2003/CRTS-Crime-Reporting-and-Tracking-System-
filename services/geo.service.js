const CaseModel = require('../models/case.model')

exports.detectCluster = async ({ location, crimeType }) => {
    const radius = 500;
    // 1. Increase window to 24 hours for testing, or use a larger window for production
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const cases = await CaseModel.find({
        crimeType,
        status: { $ne: 'CLOSED' },
        $or: [
            { createdAt: { $gte: timeWindow } },
            { updatedAt: { $gte: timeWindow } }
        ],
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: location.coordinates
                },
                $maxDistance: radius
            }
        }
    }).lean();

    if (cases.length >= 3) {
        return {
            isCluster: true,
            count: cases.length,
            cases
        }
    }

    return { isCluster: false }
}
