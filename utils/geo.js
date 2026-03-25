// Helper function to calculate distance in meters between two [lng, lat] points
const calculateDistance = (coords1, coords2) => {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;1
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}
module.exports = calculateDistance