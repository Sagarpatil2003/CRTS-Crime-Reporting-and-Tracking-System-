const catchAsync = require("../utils/catchAsync");
const CaseModel = require('../models/case.model');

const checkForDuplicateCase = catchAsync(async (req, res, next) => {
    const { crimeType, location, forceCreate } = req.body;

    
    if (forceCreate || !location?.coordinates) return next();

    const radiusMap = {
        THEFT: 200, ACCIDENT: 500, FIRE: 800,
        ROBBERY: 400, ASSAULT: 300, KIDNAP: 1000,
        TRAFFIC: 150
    };

    const maxDist = radiusMap[crimeType?.toUpperCase()] || 250;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const duplicateResults = await CaseModel.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: location.coordinates },
                distanceField: "dist_meters",
                maxDistance: maxDist,
                query: {
                    crimeType: crimeType.toLowerCase(),
                    status: { $ne: "CLOSED" },
                    createdAt: { $gte: oneHourAgo },
                    reporters: { $ne: req.user._id } 
                },
                spherical: true
            }
        },
        { $limit: 1 }
    ]);

    if (duplicateResults.length > 0) {
        req.isDuplicate = true; // Essential for the controller check
        req.duplicateCaseId = duplicateResults[0]._id;
        req.duplicateCaseData = {
            ...duplicateResults[0],
            distance: Math.round(duplicateResults[0].dist_meters)
        };
    }

    next()
})

module.exports = checkForDuplicateCase