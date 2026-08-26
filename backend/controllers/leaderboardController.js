const leaderboardService = require('../services/leaderboardService');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// Get full leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { department, year, search } = req.query;
        
        const leaderboard = await leaderboardService.getLeaderboard({
            department,
            year,
            search
        });

        // Get total registered students count
        const totalStudents = await User.countDocuments();

        res.json({
            success: true,
            leaderboard,
            totalStudents,
            filters: {
                department: department || 'ALL',
                year: year || 'ALL',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
};

// Get current user's stats
const getMyStats = async (req, res) => {
    try {
        const stats = await leaderboardService.getUserStats(req.user._id);
        
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get recent activity
        const recentActivity = await leaderboardService.getRecentActivity(req.user._id, 10);

        res.json({
            success: true,
            stats,
            recentActivity
        });
    } catch (error) {
        console.error('Get my stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your stats'
        });
    }
};

// Get user's point history
const getMyHistory = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const history = await PointTransaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        const total = await PointTransaction.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            history,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch point history'
        });
    }
};

// Get department stats
const getDepartmentStats = async (req, res) => {
    try {
        const stats = await leaderboardService.getDepartmentStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get department stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department stats'
        });
    }
};

module.exports = {
    getLeaderboard,
    getMyStats,
    getMyHistory,
    getDepartmentStats
};