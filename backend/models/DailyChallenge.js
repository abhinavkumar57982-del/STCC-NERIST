const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    explanation: { type: String }
});

const DailyChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    date: {
        type: Date,
        required: true,
        unique: true
    },
    dayNumber: {
        type: Number,
        required: true,
        unique: true
    },
    constraints: {
        type: String,
        default: ''
    },
    inputFormat: {
        type: String,
        default: ''
    },
    outputFormat: {
        type: String,
        default: ''
    },
    examples: {
        type: String,
        default: ''
    },
    allowedLanguages: {
        type: [String],
        default: ['python', 'cpp', 'java', 'javascript']
    },
    starterCode: {
        type: Map,
        of: String,
        default: {}
    },
    timeLimit: {
        type: Number,
        default: 2 // seconds
    },
    memoryLimit: {
        type: Number,
        default: 256 // MB
    },
    points: {
        type: Number,
        default: 10
    },
    // Public test cases (shown to students)
    visibleTestCases: [TestCaseSchema],
    // Hidden test cases (for evaluation, NEVER sent to frontend)
    hiddenTestCases: [TestCaseSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
DailyChallengeSchema.index({ date: -1 });
DailyChallengeSchema.index({ dayNumber: -1 });

// Ensure hidden test cases are never returned in queries by default
DailyChallengeSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.hiddenTestCases;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('DailyChallenge', DailyChallengeSchema);