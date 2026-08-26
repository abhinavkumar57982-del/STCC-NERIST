const PointTransaction = require('../models/PointTransaction');
const User = require('../models/User');

class PointsService {
    // Award points for a daily challenge
    async awardDailyChallengePoints(userId, challengeId, challengeTitle, points = 10) {
        return this.awardPoints(userId, {
            type: 'DAILY_CHALLENGE',
            source: `Daily Challenge: ${challengeTitle}`,
            sourceId: challengeId.toString(),
            description: `Solved daily challenge - ${challengeTitle}`,
            points
        });
    }

    // Award event bonus points
    async awardEventBonusPoints(userId, eventId, eventName, position, points, positionLabel) {
        return this.awardPoints(userId, {
            type: 'EVENT_WIN',
            source: eventName,
            sourceId: eventId.toString(),
            description: `${positionLabel} place in ${eventName}`,
            points,
            metadata: { position, positionLabel }
        });
    }

    // Award streak bonus
    async awardStreakBonus(userId, streakCount, points = 5) {
        return this.awardPoints(userId, {
            type: 'STREAK_BONUS',
            source: 'Daily Streak',
            sourceId: `streak-${streakCount}`,
            description: `${streakCount} day streak bonus!`,
            points,
            metadata: { streakCount }
        });
    }

    // Core point awarding logic
    async awardPoints(userId, transactionData) {
        try {
            // Check if transaction already exists (prevent duplicates)
            if (transactionData.sourceId && transactionData.type === 'DAILY_CHALLENGE') {
                const existing = await PointTransaction.findOne({
                    userId,
                    sourceId: transactionData.sourceId,
                    type: 'DAILY_CHALLENGE'
                });
                if (existing) {
                    console.log('⏭️ Duplicate transaction detected, skipping:', transactionData);
                    return {
                        success: false,
                        message: 'Duplicate transaction',
                        transaction: existing
                    };
                }
            }

            // Create point transaction
            const transaction = new PointTransaction({
                userId,
                points: transactionData.points,
                type: transactionData.type,
                source: transactionData.source,
                sourceId: transactionData.sourceId,
                description: transactionData.description,
                metadata: transactionData.metadata || {},
                createdAt: new Date()
            });

            await transaction.save();
            console.log('✅ Point transaction saved:', transaction);

            // Update user's cached fields
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Update based on transaction type
            if (transactionData.type === 'DAILY_CHALLENGE') {
                user.totalPoints = (user.totalPoints || 0) + transactionData.points;
                user.problemsSolved = (user.problemsSolved || 0) + 1;
            } else if (transactionData.type === 'EVENT_WIN' || transactionData.type === 'EVENT_BONUS') {
                user.totalPoints = (user.totalPoints || 0) + transactionData.points;
                user.eventBonusPoints = (user.eventBonusPoints || 0) + transactionData.points;
            } else {
                user.totalPoints = (user.totalPoints || 0) + transactionData.points;
            }

            await user.save();
            console.log('✅ User updated:', { 
                userId: user._id, 
                totalPoints: user.totalPoints,
                problemsSolved: user.problemsSolved 
            });

            return {
                success: true,
                transaction,
                newTotal: user.totalPoints,
                user: {
                    id: user._id,
                    name: user.name,
                    totalPoints: user.totalPoints,
                    problemsSolved: user.problemsSolved
                }
            };
        } catch (error) {
            console.error('❌ Award points error:', error);
            throw error;
        }
    }

    // Check if user already earned points for a challenge
    async hasEarnedPoints(userId, challengeId) {
        const transaction = await PointTransaction.findOne({
            userId,
            sourceId: challengeId.toString(),
            type: 'DAILY_CHALLENGE'
        });
        return !!transaction;
    }

    // Get user's point history
    async getUserHistory(userId, limit = 50, offset = 0) {
        return PointTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
    }

    // Get total points for a user
    async getUserTotalPoints(userId) {
        const result = await PointTransaction.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    // Recalculate all user cached fields (for maintenance)
    async recalculateUserPoints(userId) {
        const total = await this.getUserTotalPoints(userId);
        const dailyCount = await PointTransaction.countDocuments({
            userId,
            type: 'DAILY_CHALLENGE'
        });
        const eventBonus = await PointTransaction.aggregate([
            { $match: { userId, type: { $in: ['EVENT_WIN', 'EVENT_BONUS'] } } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);

        await User.findByIdAndUpdate(userId, {
            totalPoints: total,
            problemsSolved: dailyCount,
            eventBonusPoints: eventBonus.length > 0 ? eventBonus[0].total : 0
        });
    }
}

module.exports = new PointsService();