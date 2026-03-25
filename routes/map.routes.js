const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');

// Middlewares
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const permit = require('../middlewares/permission.middleware');

/**
 * @route   GET maps/heatmap
 * @desc    Get crime density data for the heatmap
 * @access  Private (Citizens & Officers)
 */
router.get(
    '/heatmap',
    auth, 
    mapController.getHeatmap
);

/**
 * @route   GET maps/nearby
 * @desc    Get detailed crime reports near a specific coordinate
 * @access  Private (Officers Only - higher security for precise data)
 */
router.get(
    '/nearby',
    auth,
    role(['OFFICER', 'ADMIN']), // Restrict precise "Nearby" data to authorities
    mapController.getNearby
);

module.exports = router;