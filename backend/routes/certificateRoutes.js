const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/certificateController');

// Public routes
router.get('/verify/:certificateId', controller.verifyCertificate);

// Protected routes
router.get('/my', authMiddleware, controller.getMyCertificates);
router.get('/:certificateId', authMiddleware, controller.getCertificate);
router.get('/:certificateId/download', authMiddleware, controller.downloadCertificate);

// Admin routes (Add check in controller)
router.post('/generate', authMiddleware, controller.generateCertificate);
router.post('/generate-bulk', authMiddleware, controller.generateBulkCertificates);

module.exports = router;