const CaseModel = require("../models/case.model")

exports.getHeatmapData = async () => {
    return await CaseModel.aggregate([
        { $match: { status: { $ne: "CLOSED" }, isDeleted: false } }, 
        { 
            $group: { 
                _id: "$location.coordinates", 
                intensity: { $sum: 1 } 
            } 
        },
        { 
            $project: { 
                _id: 0, 
                coordinates: "$_id", 
                intensity: 1 
            } 
        }
    ])
}

exports.getNearByCrime = async (lng, lat, radius, limit = 100) => {
    return await CaseModel.find({
        isDeleted: false,
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: radius * 1000
            }   
        }
    })
    .limit(limit) // Prevent massive payloads
    .select("-shareToken") // Don't leak tokens in public proximity searches
    .lean();
};
