const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const certificateService = require('./services/certificateService');

// ==========================================
// YAHAN APNA DATA DAALEIN (Event + Students)
// ==========================================
const eventsConfig = [
    {
        eventId: 'codesprint-2026',
        eventName: 'STCC CodeSprint 2026',
        eventDate: '2026-08-26',
        participants: [
            { regNo: '225218', achievement: 'Winner' },
            { regNo: '225088', achievement: 'Runner Up' },
            { regNo: '225140', achievement: 'Participant' }
            // ... yahan aur students ki Reg No daal sakte hain
        ]
    },
    // Agar multiple events hain, toh yahan aur add karein
    // {
    //     eventId: 'hackathon-2026',
    //     eventName: 'STCC Hackathon 2026',
    //     eventDate: '2026-09-15',
    //     participants: [
    //         { regNo: '225218', achievement: 'Winner' },
    //         { regNo: '225088', achievement: 'Participant' }
    //     ]
    // }
];

// ==========================================
// SCRIPT CHALU KAREIN
// ==========================================
async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Saare events ke certificates generate karein
        const results = await certificateService.generateBulkCertificates(eventsConfig);
        
        console.log('\n📊 Results:');
        console.log('━'.repeat(70));
        results.forEach(r => {
            if (r.success) {
                console.log(`✅ ${r.event} - ${r.certificate.certificateId} - ${r.certificate.studentName}`);
            } else {
                console.log(`❌ ${r.event} - ${r.error}`);
            }
        });
        console.log('━'.repeat(70));

        console.log('\n🎉 Saare certificates generate ho gaye!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

run();