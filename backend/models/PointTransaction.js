const mongoose = require('mongoose');

const PointTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    points: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: [
            'DAILY_CHALLENGE',
            'EVENT_WIN',
            'EVENT_BONUS',
            'STREAK_BONUS',
            'SPECIAL'
        ],
        required: true
    },
    source: {
        type: String,
        required: true
    },
    sourceId: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
PointTransactionSchema.index({ userId: 1, createdAt: -1 });
PointTransactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('PointTransaction', PointTransactionSchema);