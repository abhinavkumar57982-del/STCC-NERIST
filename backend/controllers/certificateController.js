const certificateService = require('../services/certificateService');

// POST /api/certificates/generate (Admin/Role based)
const generateCertificate = async (req, res) => {
    try {
        // Ab hum regNo use karenge (userId nahi)
        const { regNo, eventId, eventName, eventDate, achievement } = req.body;
        
        if (!regNo || !eventId || !eventName || !eventDate || !achievement) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const certificate = await certificateService.generateCertificate(regNo, eventId, eventName, new Date(eventDate), achievement);
        
        res.status(201).json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/certificates/generate-bulk (Admin)
const generateBulkCertificates = async (req, res) => {
    try {
        const { participants, eventId, eventName, eventDate } = req.body;
        // participants should be an array: [{ regNo, achievement }]
        
        if (!participants || participants.length === 0) {
            return res.status(400).json({ success: false, message: 'No participants provided' });
        }

        const results = await certificateService.generateBulkCertificates(participants, eventId, eventName, new Date(eventDate));
        
        res.status(201).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/certificates/my (Protected)
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await certificateService.getMyCertificates(req.user._id);
        res.json({ success: true, certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/certificates/:certificateId (Protected - only owner or admin)
const getCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const certificate = await certificateService.verifyCertificate(certificateId);
        
        if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
        if (certificate.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/certificates/:certificateId/download (Protected)
const downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const pdfPath = await certificateService.getCertificateFile(certificateId);
        
        res.download(pdfPath, `STCC-Certificate-${certificateId}.pdf`);
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// GET /api/certificates/verify/:certificateId (Public)
const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const certificate = await certificateService.verifyCertificate(certificateId);
        
        if (!certificate) {
            return res.json({ success: false, message: 'Certificate Not Found' });
        }

        res.json({
            success: true,
            certificate: {
                certificateId: certificate.certificateId,
                studentName: certificate.student.name,
                regNo: certificate.student.registrationNo,
                eventName: certificate.eventName,
                achievement: certificate.achievement,
                eventDate: certificate.eventDate,
                issueDate: certificate.issueDate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    generateCertificate,
    generateBulkCertificates,
    getMyCertificates,
    getCertificate,
    downloadCertificate,
    verifyCertificate
};