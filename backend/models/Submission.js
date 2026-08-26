const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyChallenge',
        required: true,
        index: true
    },
    language: {
        type: String,
        required: true,
        enum: ['python', 'cpp', 'java', 'javascript', 'c', 'go', 'rust']
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'PENDING',
            'RUNNING',
            'ACCEPTED',
            'WRONG_ANSWER',
            'TIME_LIMIT',
            'MEMORY_LIMIT',
            'COMPILATION_ERROR',
            'RUNTIME_ERROR',
            'SYSTEM_ERROR'
        ],
        default: 'PENDING'
    },
    score: {
        type: Number,
        default: 0
    },
    passedTests: {
        type: Number,
        default: 0
    },
    totalTests: {
        type: Number,
        default: 0
    },
    executionTime: {
        type: Number,
        default: 0 // milliseconds
    },
    memoryUsed: {
        type: Number,
        default: 0 // KB
    },
    testResults: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate accepted submissions
SubmissionSchema.index(
    { userId: 1, challengeId: 1, isAccepted: 1 },
    { unique: true, partialFilterExpression: { isAccepted: true } }
);

// Index for leaderboard queries
SubmissionSchema.index({ userId: 1, status: 1 });
SubmissionSchema.index({ challengeId: 1, status: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);