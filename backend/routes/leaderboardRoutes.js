const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getLeaderboard,
    getMyStats,
    getMyHistory,
    getDepartmentStats
} = require('../controllers/leaderboardController');

// Public routes
router.get('/', getLeaderboard);
router.get('/departments', getDepartmentStats);

// Protected routes
router.get('/me', authMiddleware, getMyStats);
router.get('/me/history', authMiddleware, getMyHistory);

module.exports = router;