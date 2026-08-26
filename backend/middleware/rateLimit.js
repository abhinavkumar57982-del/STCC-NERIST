const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    }
});

// Code execution rate limit (stricter)
const codeExecution = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        message: 'Too many code execution attempts, please wait'
    }
});

// Submission rate limit
const submission = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        message: 'Too many submissions, please wait'
    }
});

// Leaderboard rate limit (less strict)
const leaderboard = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: 'Too many requests, please wait'
    }
});

module.exports = {
    apiLimiter,
    codeExecution,
    submission,
    leaderboard
};