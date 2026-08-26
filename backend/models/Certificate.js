const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        unique: true,
        trim: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    achievement: {
        type: String,
        enum: ['Winner', 'Runner Up', 'Participant', 'Special Achievement'],
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    pdfUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-generate unique certificate ID
CertificateSchema.pre('save', async function(next) {
    if (this.isNew) {
        if (!this.certificateId) {
            const count = await mongoose.model('Certificate').countDocuments();
            const year = new Date().getFullYear();
            this.certificateId = `STCC-CERT-${year}-${String(count + 1).padStart(6, '0')}`;
        }
    }
    next();
});

// ===== UNIQUE INDEX: Ek student + Ek event = Ek certificate =====
CertificateSchema.index({ student: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);