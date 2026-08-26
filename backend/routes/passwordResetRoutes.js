const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    verifyAccount,
    validateToken,
    resetPassword
} = require('../controllers/passwordResetController');

// ==========================================
// Rate Limiters
// ==========================================

// Verify account limiter: 3 attempts per 15 minutes
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: {
        success: false,
        message: 'Too many verification attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Reset password limiter: 5 attempts per hour
const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many reset attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ==========================================
// Routes
// ==========================================

// POST: Verify account (email + phone)
router.post('/verify', verifyLimiter, verifyAccount);

// GET: Validate reset token
router.get('/validate/:token', validateToken);

// POST: Reset password
router.post('/reset', resetLimiter, resetPassword);

module.exports = router;