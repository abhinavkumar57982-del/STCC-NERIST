const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const EventAchievement = require('../models/EventAchievement');
const pointsService = require('../services/pointsService');

// Configuration - Update these with actual user IDs from your database
const EVENT_CONFIG = {
    eventId: 'hackathon-2026',
    eventName: 'STCC Hackathon 2026',
    winners: [
        // { userId: 'USER_ID_HERE', position: 1, positionLabel: '1st', points: 100 },
        // { userId: 'USER_ID_HERE', position: 2, positionLabel: '2nd', points: 70 },
        // { userId: 'USER_ID_HERE', position: 3, positionLabel: '3rd', points: 50 }
    ]
};

async function seedEventWinners() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI not found in .env file');
            process.exit(1);
        }

        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if there are users
        const userCount = await User.countDocuments();
        console.log(`👥 Found ${userCount} registered users`);

        if (userCount === 0) {
            console.log('⚠️ No users found. Please register users first.');
            console.log('   Run the server and register users through the login page.');
            process.exit(0);
        }

        // Show available users
        const users = await User.find().select('name registrationNo email');
        console.log('\n📋 Available Users:');
        console.log('━'.repeat(60));
        users.forEach(u => {
            console.log(`   ${u._id} | ${u.name} | ${u.registrationNo}`);
        });
        console.log('━'.repeat(60));

        console.log('\n⚠️ To seed event winners, update the EVENT_CONFIG in this script with actual user IDs.');
        console.log('   Example:');
        console.log('   winners: [');
        console.log(`       { userId: '${users[0]?._id || 'USER_ID'}', position: 1, positionLabel: '1st', points: 100 },`);
        console.log('   ]');

        if (EVENT_CONFIG.winners.length === 0) {
            console.log('\n❌ No winners configured. Please add winners to EVENT_CONFIG.');
            process.exit(0);
        }

        // Process winners
        for (const winner of EVENT_CONFIG.winners) {
            // Check if achievement already exists
            const existing = await EventAchievement.findOne({
                userId: winner.userId,
                eventId: EVENT_CONFIG.eventId,
                position: winner.position
            });

            if (existing) {
                console.log(`⏭️ Skipping duplicate: ${winner.userId} - ${EVENT_CONFIG.eventName}`);
                continue;
            }

            // Create achievement
            const achievement = new EventAchievement({
                userId: winner.userId,
                eventId: EVENT_CONFIG.eventId,
                eventName: EVENT_CONFIG.eventName,
                position: winner.position,
                positionLabel: winner.positionLabel,
                points: winner.points,
                description: `${winner.positionLabel} place in ${EVENT_CONFIG.eventName}`
            });

            await achievement.save();

            // Award points
            await pointsService.awardEventBonusPoints(
                winner.userId,
                EVENT_CONFIG.eventId,
                EVENT_CONFIG.eventName,
                winner.position,
                winner.points,
                winner.positionLabel
            );

            console.log(`✅ Awarded ${winner.points} points to ${winner.userId} for ${EVENT_CONFIG.eventName}`);
        }

        console.log('\n🎉 Event winners seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seedEventWinners();