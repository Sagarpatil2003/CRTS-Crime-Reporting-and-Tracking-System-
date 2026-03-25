const stringSimilarity = require("string-similarity");
const catchAsync = require("../utils/catchAsync")
const CaseModel = require("../models/case.model")
const calculateDistance = require("../utils/geo")


const checkForDuplicateCase = catchAsync(async (req, res, next) => {
    const { crimeType, title, description, location, forceCreate } = req.body;
    if (forceCreate || !location?.coordinates) return next();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // 1. Fetch Candidates (Broad Filter)
    const candidates = await CaseModel.find({
        crimeType: crimeType.toLowerCase(),
        status: { $ne: "CLOSED" },
        createdAt: { $gte: oneHourAgo },
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: location.coordinates },
                $maxDistance: 500 // Search up to 500m
            }
        }
    }).limit(5).lean();

    for (const caseMatch of candidates) {
        let finalScore = 0;

        // A. Location Score (40 points max)
        // Calculate distance (if not using aggregate, use a haversine helper)
        const dist = calculateDistance(location.coordinates, caseMatch.location.coordinates);
        if (dist < 50) finalScore += 40;
        else if (dist < 150) finalScore += 20;

        // B. Time Score (30 points max)
        const timeDiffMins = Math.abs(new Date() - new Date(caseMatch.createdAt)) / 60000;
        if (timeDiffMins < 10) finalScore += 30;
        else if (timeDiffMins < 30) finalScore += 15;

        // C. Content Score (30 points max)
        // Compare both title AND description for a stronger signal
        const titleSim = stringSimilarity.compareTwoStrings(title.toLowerCase(), caseMatch.title.toLowerCase());
        const descSim = stringSimilarity.compareTwoStrings(description.toLowerCase(), caseMatch.description.toLowerCase());
        const contentSim = (titleSim * 0.4) + (descSim * 0.6); 
        
        if (contentSim > 0.7) finalScore += 30;
        else if (contentSim > 0.4) finalScore += 15;

        // THE DECISION
        if (finalScore >= 75) {
            req.isDuplicate = true;
            req.duplicateCaseId = caseMatch._id;
            req.confidenceScore = finalScore;
            return next();
        }
    }
    next();
});

module.exports = checkForDuplicateCase