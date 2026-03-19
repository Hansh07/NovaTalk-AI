// services/moderationService.js - Content moderation and spam detection
const aiService = require('./aiService');
const User = require('../models/User');

class ModerationService {
  // Check message for toxicity and spam
  async moderateMessage(content, userId) {
    const toxicity = await aiService.detectToxicity(content);
    const isSpam = this.detectSpam(content);

    // Update user toxicity score if toxic
    if (toxicity.isToxic && userId) {
      await this.updateUserToxicity(userId, toxicity.score);
    }

    return {
      ...toxicity,
      isSpam,
      action: this.determineAction(toxicity, isSpam),
    };
  }

  // Simple spam detection heuristics
  detectSpam(content) {
    const spamPatterns = [
      /(.)\1{10,}/,                    // Repeated characters
      /(https?:\/\/[^\s]+\s*){3,}/,    // Multiple URLs
      /(\b\w+\b)(\s+\1){4,}/,         // Repeated words
    ];
    return spamPatterns.some(p => p.test(content));
  }

  // Determine moderation action
  determineAction(toxicity, isSpam) {
    if (toxicity.score > 0.9) return 'block';
    if (toxicity.score > 0.7 || isSpam) return 'warn';
    if (toxicity.score > 0.5) return 'flag';
    return 'allow';
  }

  // Update user's toxicity score
  async updateUserToxicity(userId, toxicityScore) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Running average
      user.toxicityScore = (user.toxicityScore * 0.8) + (toxicityScore * 100 * 0.2);
      user.warnings += toxicityScore > 0.7 ? 1 : 0;

      // Auto-mute after 5 warnings
      if (user.warnings >= 5 && !user.isMuted) {
        user.isMuted = true;
        user.mutedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      }

      await user.save();
    } catch (e) {
      console.error('Moderation update error:', e);
    }
  }

  // Get moderation dashboard data
  async getDashboardData() {
    try {
      const flaggedUsers = await User.find({ toxicityScore: { $gt: 30 } })
        .select('name email toxicityScore warnings isMuted')
        .sort({ toxicityScore: -1 })
        .limit(20);

      return { flaggedUsers };
    } catch (e) {
      return { flaggedUsers: [] };
    }
  }
}

module.exports = new ModerationService();
