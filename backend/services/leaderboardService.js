const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

class LeaderboardService {
    // Get full leaderboard with all users
    async getLeaderboard(filters = {}) {
        const { department, year, search } = filters;
        
        // Build match query
        const match = {};
        if (department && department !== 'ALL') {
            match.department = department;
        }
        if (year && year !== 'ALL') {
            match.year = year;
        }
        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
                { registrationNo: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all users with their points
        const users = await User.find(match)
            .select('name registrationNo department year totalPoints problemsSolved eventBonusPoints currentStreak lastSubmissionDate')
            .sort({ totalPoints: -1, problemsSolved: -1, 'createdAt': 1 })
            .lean();

        // Add rank
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            ...user
        }));

        return leaderboard;
    }

    // Get current user's rank and stats
    async getUserStats(userId) {
        // Get user's points
        const user = await User.findById(userId)
            .select('name registrationNo department year totalPoints problemsSolved eventBonusPoints currentStreak lastSubmissionDate');

        if (!user) return null;

        // Calculate rank
        const rank = await User.countDocuments({
            totalPoints: { $gt: user.totalPoints || 0 }
        }) + 1;

        return {
            ...user.toJSON(),
            rank
        };
    }

    // Get recent activity for a user
    async getRecentActivity(userId, limit = 10) {
        return PointTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    // Get department-wise stats
    async getDepartmentStats() {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    totalPoints: { $sum: '$totalPoints' },
                    avgPoints: { $avg: '$totalPoints' }
                }
            },
            { $sort: { totalPoints: -1 } }
        ]);
        return stats;
    }

    // Update daily streak for a user
    async updateStreak(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lastDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : null;
            
            if (lastDate) {
                const lastDateOnly = new Date(lastDate);
                lastDateOnly.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((today - lastDateOnly) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // Already submitted today, no change
                    return user.currentStreak || 0;
                } else if (diffDays === 1) {
                    // Consecutive day
                    user.currentStreak = (user.currentStreak || 0) + 1;
                    user.lastSubmissionDate = new Date();
                    await user.save();
                    
                    // Award streak bonus if streak is multiple of 5
                    if (user.currentStreak % 5 === 0) {
                        const pointsService = require('./pointsService');
                        await pointsService.awardStreakBonus(
                            userId,
                            user.currentStreak,
                            5 + Math.floor(user.currentStreak / 5)
                        );
                    }
                    return user.currentStreak;
                } else {
                    // Streak broken
                    user.currentStreak = 0;
                    user.lastSubmissionDate = new Date();
                    await user.save();
                    return 0;
                }
            } else {
                // First submission
                user.currentStreak = 1;
                user.lastSubmissionDate = new Date();
                await user.save();
                return 1;
            }
        } catch (error) {
            console.error('Update streak error:', error);
            return 0;
        }
    }
}

module.exports = new LeaderboardService();