// controllers/analyticsController.js - Analytics and insights handlers
const analyticsService = require('../services/analyticsService');

// GET /api/analytics/team - Team analytics dashboard data
const getTeamAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await analyticsService.getTeamAnalytics(days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error: error.message });
  }
};

// GET /api/analytics/user/:userId - User analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;
    const data = await analyticsService.getUserAnalytics(userId, days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error: error.message });
  }
};

module.exports = { getTeamAnalytics, getUserAnalytics };
