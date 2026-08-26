const DailyChallenge = require('../models/DailyChallenge');
const Submission = require('../models/Submission');
const pointsService = require('../services/pointsService');
const leaderboardService = require('../services/leaderboardService');
const codeExecutionService = require('../services/codeExecutionService');

// Get today's challenge
const getTodayChallenge = async (req, res) => {
    try {
        console.log('📡 Fetching today\'s challenge...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find challenge for today
        let challenge = await DailyChallenge.findOne({
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            isActive: true
        });

        // If no challenge for today, get the most recent active challenge
        if (!challenge) {
            console.log('📡 No challenge for today, fetching most recent...');
            challenge = await DailyChallenge.findOne({
                isActive: true
            }).sort({ date: -1 });
        }

        if (!challenge) {
            console.log('❌ No challenge found in database');
            return res.status(404).json({
                success: false,
                message: 'No challenge available today. Please check back later.'
            });
        }

        console.log(`📡 Found challenge: ${challenge.title} (Day ${challenge.dayNumber})`);

        // Check if user already solved it
        let isSolved = false;
        let userSubmission = null;
        
        if (req.user) {
            const submission = await Submission.findOne({
                userId: req.user._id,
                challengeId: challenge._id,
                isAccepted: true
            });
            if (submission) {
                isSolved = true;
                userSubmission = {
                    status: submission.status,
                    score: submission.score,
                    submittedAt: submission.submittedAt
                };
            }
        }

        const challengeData = challenge.toJSON();
        
        res.json({
            success: true,
            challenge: {
                ...challengeData,
                isSolved,
                userSubmission
            }
        });
    } catch (error) {
        console.error('❌ Get today challenge error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch today\'s challenge: ' + error.message
        });
    }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
    try {
        console.log(`📡 Fetching challenge by ID: ${req.params.id}`);
        
        const challenge = await DailyChallenge.findById(req.params.id);
        
        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        let isSolved = false;
        if (req.user) {
            const submission = await Submission.findOne({
                userId: req.user._id,
                challengeId: challenge._id,
                isAccepted: true
            });
            if (submission) isSolved = true;
        }

        res.json({
            success: true,
            challenge: {
                ...challenge.toJSON(),
                isSolved
            }
        });
    } catch (error) {
        console.error('❌ Get challenge error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch challenge: ' + error.message
        });
    }
};

// Run code against visible test cases
const runCode = async (req, res) => {
    try {
        const { challengeId, language, code } = req.body;

        console.log(`🔧 Run code request: ${challengeId}, ${language}`);

        if (!challengeId || !language || !code) {
            return res.status(400).json({
                success: false,
                message: 'Challenge ID, language, and code are required'
            });
        }

        const challenge = await DailyChallenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (!challenge.allowedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: `Language ${language} is not allowed for this challenge`
            });
        }

        const testCases = challenge.visibleTestCases || [];
        
        if (testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No visible test cases available'
            });
        }

        const results = [];
        let passedCount = 0;

        for (const testCase of testCases) {
            try {
                const result = await codeExecutionService.executeCode(
                    language,
                    code,
                    testCase.input
                );

                const expected = testCase.output.trim();
                const actual = (result.output || '').trim();
                const isPassed = result.status === 'ACCEPTED' && actual === expected;

                results.push({
                    input: testCase.input.trim(),
                    expectedOutput: expected,
                    actualOutput: actual || result.error || 'No output',
                    passed: isPassed,
                    status: result.status,
                    executionTime: result.executionTime || 0,
                    memoryUsed: result.memoryUsed || 0,
                    error: result.error
                });

                if (isPassed) passedCount++;
            } catch (error) {
                results.push({
                    input: testCase.input.trim(),
                    expectedOutput: testCase.output.trim(),
                    actualOutput: 'Error: ' + error.message,
                    passed: false,
                    status: 'SYSTEM_ERROR',
                    executionTime: 0,
                    memoryUsed: 0,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            results,
            passedCount,
            totalCount: testCases.length,
            allPassed: passedCount === testCases.length
        });
    } catch (error) {
        console.error('❌ Run code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to execute code: ' + error.message
        });
    }
};

// Submit solution
const submitSolution = async (req, res) => {
    try {
        const { challengeId, language, code } = req.body;
        const userId = req.user._id;

        console.log(`📤 Submit solution: ${challengeId}, ${language}, ${userId}`);

        if (!challengeId || !language || !code) {
            return res.status(400).json({
                success: false,
                message: 'Challenge ID, language, and code are required'
            });
        }

        const challenge = await DailyChallenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (!challenge.allowedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: `Language ${language} is not allowed for this challenge`
            });
        }

        // Check if already solved
        const existingAccepted = await Submission.findOne({
            userId,
            challengeId,
            isAccepted: true
        });

        // Check if already earned points
        const alreadyEarnedPoints = await pointsService.hasEarnedPoints(userId, challengeId);

        // Create submission
        const submission = new Submission({
            userId,
            challengeId,
            language,
            code,
            status: 'PENDING',
            totalTests: challenge.hiddenTestCases.length + challenge.visibleTestCases.length
        });

        await submission.save();

        // Run against ALL test cases
        const allTestCases = [...challenge.visibleTestCases, ...challenge.hiddenTestCases];
        const results = [];
        let passedCount = 0;

        for (const testCase of allTestCases) {
            try {
                const result = await codeExecutionService.executeCode(
                    language,
                    code,
                    testCase.input
                );

                const expected = testCase.output.trim();
                const actual = (result.output || '').trim();
                const isPassed = result.status === 'ACCEPTED' && actual === expected;

                results.push({
                    input: testCase.input.trim(),
                    expectedOutput: expected,
                    actualOutput: actual || result.error || 'No output',
                    passed: isPassed,
                    isHidden: testCase.isHidden || false,
                    status: result.status,
                    executionTime: result.executionTime || 0,
                    memoryUsed: result.memoryUsed || 0,
                    error: result.error
                });

                if (isPassed) passedCount++;
            } catch (error) {
                results.push({
                    input: testCase.input.trim(),
                    expectedOutput: testCase.output.trim(),
                    actualOutput: 'Error: ' + error.message,
                    passed: false,
                    isHidden: testCase.isHidden || false,
                    status: 'SYSTEM_ERROR',
                    executionTime: 0,
                    memoryUsed: 0,
                    error: error.message
                });
            }
        }

        // Update submission
        const allTestsPassed = passedCount === allTestCases.length;
        const isAccepted = allTestsPassed && !existingAccepted;
        const pointsAwarded = (isAccepted && !alreadyEarnedPoints) ? challenge.points || 10 : 0;

        submission.passedTests = passedCount;
        submission.totalTests = allTestCases.length;
        submission.testResults = results;
        submission.status = allTestsPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
        submission.isAccepted = allTestsPassed;
        submission.pointsAwarded = pointsAwarded;
        submission.executionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
        submission.memoryUsed = results.reduce((sum, r) => sum + (r.memoryUsed || 0), 0);

        await submission.save();

        // Award points if accepted and not already earned
        let pointsResult = null;
        if (allTestsPassed && !alreadyEarnedPoints) {
            try {
                pointsResult = await pointsService.awardDailyChallengePoints(
                    userId,
                    challengeId,
                    challenge.title,
                    pointsAwarded
                );
                console.log('✅ Points awarded:', pointsResult);
                
                // Update streak
                await leaderboardService.updateStreak(userId);
            } catch (error) {
                console.error('❌ Points awarding error:', error);
            }
        } else if (allTestsPassed && alreadyEarnedPoints) {
            console.log('⏭️ Points already earned for this challenge');
        }

        // Get updated user stats
        let userStats = null;
        try {
            userStats = await leaderboardService.getUserStats(userId);
            console.log('📊 User stats after submission:', userStats);
        } catch (error) {
            console.error('❌ Get user stats error:', error);
        }

        // Return ALL test results
        const allResults = results.map((r, index) => ({
            testCase: index + 1,
            input: r.input,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput,
            passed: r.passed,
            isHidden: r.isHidden || false,
            status: r.status,
            executionTime: r.executionTime,
            memoryUsed: r.memoryUsed,
            error: r.error
        }));

        res.json({
            success: true,
            submission: {
                id: submission._id,
                status: submission.status,
                passedTests: submission.passedTests,
                totalTests: submission.totalTests,
                executionTime: submission.executionTime,
                memoryUsed: submission.memoryUsed,
                isAccepted: submission.isAccepted,
                pointsAwarded: submission.pointsAwarded,
                submittedAt: submission.submittedAt
            },
            testResults: allResults,
            userStats,
            pointsAwarded: pointsAwarded > 0,
            alreadyEarned: alreadyEarnedPoints
        });
    } catch (error) {
        console.error('❌ Submit solution error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit solution: ' + error.message
        });
    }
};

// Get user's submissions
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user._id })
            .sort({ submittedAt: -1 })
            .populate('challengeId', 'title date dayNumber')
            .limit(50);

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions: ' + error.message
        });
    }
};

// Get submission by ID
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('challengeId', 'title date dayNumber');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        res.json({
            success: true,
            submission
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission: ' + error.message
        });
    }
};

module.exports = {
    getTodayChallenge,
    getChallengeById,
    runCode,
    submitSolution,
    getMySubmissions,
    getSubmissionById
};