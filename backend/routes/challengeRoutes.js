const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getTodayChallenge,
    getChallengeById,
    runCode,
    submitSolution,
    getMySubmissions,
    getSubmissionById
} = require('../controllers/challengeController');

console.log('🔧 Setting up challenge routes...');


// Public routes (no auth required for viewing challenges)
router.get('/today', getTodayChallenge);
router.get('/:id', getChallengeById);


// Protected routes (auth required for submissions)
router.post('/run', authMiddleware, runCode);
router.post('/submit', authMiddleware, submitSolution);
router.get('/submissions/my', authMiddleware, getMySubmissions);
router.get('/submissions/:id', authMiddleware, getSubmissionById);



console.log('   ✅ Challenge routes registered');

module.exports = router;