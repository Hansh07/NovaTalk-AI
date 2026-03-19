// services/analyticsService.js - Analytics aggregation and insights
const Analytics = require('../models/Analytics');
const Message = require('../models/Message');
const User = require('../models/User');

class AnalyticsService {
  // Record a message event for analytics
  async recordMessage(userId, chatId, sentiment) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const hour = new Date().getHours();

      let analytics = await Analytics.findOne({
        user: userId,
        date: { $gte: today },
      });

      if (!analytics) {
        analytics = new Analytics({ user: userId, chat: chatId, date: today });
      }

      analytics.messageCount += 1;

      // Update sentiment scores
      if (sentiment) {
        const key = sentiment.label || 'neutral';
        if (analytics.sentimentScores[key] !== undefined) {
          analytics.sentimentScores[key] += 1;
        }
      }

      // Update activity hours
      const hourEntry = analytics.activityHours.find(h => h.hour === hour);
      if (hourEntry) {
        hourEntry.count += 1;
      } else {
        analytics.activityHours.push({ hour, count: 1 });
      }

      // Calculate productivity score (messages + positive sentiment ratio)
      const total = analytics.sentimentScores.positive + analytics.sentimentScores.negative + analytics.sentimentScores.neutral;
      if (total > 0) {
        analytics.productivityScore = Math.min(100,
          Math.round((analytics.sentimentScores.positive / total) * 50 + Math.min(analytics.messageCount, 50))
        );
      }

      await analytics.save();
    } catch (e) {
      console.error('Analytics recording error:', e);
    }
  }

  // Get team analytics
  async getTeamAnalytics(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      // Most active users
      const activeUsers = await Analytics.aggregate([
        { $match: { date: { $gte: since } } },
        { $group: { _id: '$user', totalMessages: { $sum: '$messageCount' }, avgProductivity: { $avg: '$productivityScore' } } },
        { $sort: { totalMessages: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', avatar: '$user.avatar', totalMessages: 1, avgProductivity: 1 } },
      ]);

      // Sentiment trends
      const sentimentTrends = await Analytics.aggregate([
        { $match: { date: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          positive: { $sum: '$sentimentScores.positive' },
          negative: { $sum: '$sentimentScores.negative' },
          neutral: { $sum: '$sentimentScores.neutral' },
        }},
        { $sort: { _id: 1 } },
      ]);

      // Activity heatmap data
      const heatmapData = await Analytics.aggregate([
        { $match: { date: { $gte: since } } },
        { $unwind: '$activityHours' },
        { $group: {
          _id: {
            day: { $dayOfWeek: '$date' },
            hour: '$activityHours.hour',
          },
          count: { $sum: '$activityHours.count' },
        }},
      ]);

      // Collaboration index
      const totalUsers = await User.countDocuments();
      const activeCount = activeUsers.length;
      const collaborationIndex = totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;

      return {
        activeUsers,
        sentimentTrends,
        heatmapData,
        collaborationIndex,
        totalMessages: activeUsers.reduce((sum, u) => sum + u.totalMessages, 0),
      };
    } catch (e) {
      console.error('Analytics fetch error:', e);
      return { activeUsers: [], sentimentTrends: [], heatmapData: [], collaborationIndex: 0, totalMessages: 0 };
    }
  }

  // Get user-specific analytics
  async getUserAnalytics(userId, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    try {
      const analytics = await Analytics.find({
        user: userId,
        date: { $gte: since },
      }).sort({ date: 1 });

      return analytics;
    } catch (e) {
      return [];
    }
  }
}

module.exports = new AnalyticsService();
