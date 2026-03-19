// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getTeamAnalytics, getUserAnalytics } = require('../controllers/analyticsController');

router.use(protect);

router.get('/team', getTeamAnalytics);
router.get('/user/:userId', getUserAnalytics);

module.exports = router;
