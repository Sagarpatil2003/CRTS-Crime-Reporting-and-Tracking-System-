const mapService = require("../services/map.service")
const ApiResponse = require("../utils/ApiResponse")

exports.getHeatmap = async(req, res) => {
    const data = await mapService.getHeatmapData()
    
    res.status(200).json(new ApiResponse(200, data, null))
}


exports.getNearby = async (req, res ) => {
   const {lng, lat, radius = 5} = req.query

   const data = await mapService.getNearByCrime(lng, lat, radius)
   res.status(200).json(new ApiResponse(200, data, null))
}