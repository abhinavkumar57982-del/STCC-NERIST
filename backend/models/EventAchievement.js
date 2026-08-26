const mongoose = require('mongoose');

const EventAchievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    eventId: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true,
        min: 1
    },
    positionLabel: {
        type: String,
        enum: ['1st', '2nd', '3rd', 'Participation'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent duplicate achievements
EventAchievementSchema.index(
    { userId: 1, eventId: 1, position: 1 },
    { unique: true }
);

module.exports = mongoose.model('EventAchievement', EventAchievementSchema);