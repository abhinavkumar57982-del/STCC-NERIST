const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs'); 
const fsp = require('fs/promises'); 
const Certificate = require('../models/Certificate');
const User = require('../models/User');

const STORAGE_PATH = process.env.CERTIFICATE_STORAGE_PATH || 'certificates';
const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

class CertificateService {
    async generateCertificate(regNo, eventId, eventName, eventDate, achievement) {
        try {
            const student = await User.findOne({ registrationNo: regNo });
            if (!student) throw new Error(`Student not found for Reg No: ${regNo}`);

            // ===== DUPLICATE CHECK =====
            const existingCert = await Certificate.findOne({
                student: student._id,
                eventId: eventId
            });

            if (existingCert) {
                console.log(`⚠️ Pehle se certificate hai: ${existingCert.certificateId} for ${student.name} (Reg: ${regNo})`);
                throw new Error(`Certificate already exists for ${student.name} (Reg: ${regNo}) in event: ${eventName}`);
            }
            // ==========================

            const certPath = path.join(__dirname, '..', STORAGE_PATH);
            await fsp.mkdir(certPath, { recursive: true });

            const certificate = new Certificate({
                student: student._id,
                eventId,
                eventName,
                achievement,
                eventDate,
                pdfUrl: '' 
            });
            
            await certificate.save();

            const verifyUrl = `${BASE_URL}/verify/${certificate.certificateId}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { 
                width: 150, 
                margin: 1,
                color: { dark: '#050807', light: '#FFFFFF' }
            });

            const pdfFileName = `STCC-Certificate-${certificate.certificateId}.pdf`;
            const pdfPath = path.join(certPath, pdfFileName);

            await this.generatePDF(pdfPath, {
                ...certificate.toJSON(),
                studentName: student.name,
                regNo: student.registrationNo,
                qrCodeDataUrl,
                eventDate,
                issueDate: new Date()
            });

            const pdfUrl = `${BASE_URL}/api/certificates/${certificate.certificateId}/download`;
            certificate.pdfUrl = pdfUrl;
            await certificate.save();

            console.log(`✅ Certificate generated: ${certificate.certificateId} for ${student.name} (Reg: ${regNo})`);
            return certificate;

        } catch (error) {
            console.error(`❌ Error generating for Reg No: ${regNo}:`, error.message);
            throw error;
        }
    }

    async generateBulkCertificates(eventConfigurations) {
        const allResults = [];
        
        for (const event of eventConfigurations) {
            console.log(`\n📌 Processing Event: ${event.eventName}`);
            for (const participant of event.participants) {
                try {
                    const cert = await this.generateCertificate(
                        participant.regNo, 
                        event.eventId, 
                        event.eventName, 
                        new Date(event.eventDate), 
                        participant.achievement
                    );
                    allResults.push({ success: true, event: event.eventName, certificate: cert });
                } catch (error) {
                    allResults.push({ success: false, event: event.eventName, error: error.message });
                }
            }
        }
        
        return allResults;
    }

    async generatePDF(pdfPath, data) {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            doc.rect(0, 0, 841.89, 595.28).fill('#050807');
            doc.rect(20, 20, 801.89, 555.28).lineWidth(2).strokeColor('#00D084').stroke();

            const logoPath = path.join(__dirname, '..', '..', 'cropped_circle_image (2).png');
            doc.image(logoPath, 50, 40, { width: 60 });

            doc.font('Helvetica-Bold').fontSize(24).fillColor('#00D084').text('STCC', 120, 50);
            doc.font('Helvetica').fontSize(10).fillColor('#8A9B9A').text('STUDENT TECHNICAL & CODING CLUB', 120, 75);
            doc.font('Helvetica').fontSize(10).fillColor('#8A9B9A').text(`ID: ${data.certificateId}`, 700, 50, { align: 'right' });

            doc.font('Helvetica-Bold').fontSize(32).fillColor('#6EE7B7').text('CERTIFICATE OF ACHIEVEMENT', 0, 150, { align: 'center' });
            doc.font('Helvetica').fontSize(14).fillColor('#8A9B9A').text('This is to certify that', 0, 200, { align: 'center' });
            doc.font('Helvetica-Bold').fontSize(28).fillColor('#FFFFFF').text(data.studentName, 0, 230, { align: 'center' });
            doc.font('Helvetica').fontSize(12).fillColor('#00D084').text(`Registration No: ${data.regNo}`, 0, 270, { align: 'center' });
            doc.font('Helvetica').fontSize(14).fillColor('#8A9B9A').text('has successfully', 0, 300, { align: 'center' });

            doc.roundedRect(300, 330, 241.89, 40, 10).fill('#071C1A').strokeColor('#00D084').stroke();
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFFFFF').text(data.achievement, 0, 340, { align: 'center' });

            doc.font('Helvetica').fontSize(14).fillColor('#B8C5C4').text(`in ${data.eventName}`, 0, 380, { align: 'center' });
            doc.font('Helvetica').fontSize(10).fillColor('#8A9B9A').text(`Held on ${new Date(data.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, 400, { align: 'center' });

            doc.font('Helvetica').fontSize(10).fillColor('#8A9B9A').text(`Issued on ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 500, { align: 'center' });

            doc.font('Helvetica-Bold').fontSize(12).fillColor('#F5F5F5').text('Dr. Faculty Advisor', 100, 520);
            doc.font('Helvetica').fontSize(10).fillColor('#8A9B9A').text('STCC', 100, 535);

            doc.image(data.qrCodeDataUrl, 750, 490, { width: 80 });

            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }

    async getMyCertificates(userId) {
        return Certificate.find({ student: userId }).sort({ issueDate: -1 });
    }

    async verifyCertificate(certificateId) {
        const certificate = await Certificate.findOne({ certificateId }).populate('student', 'name registrationNo');
        if (!certificate) return null;
        return certificate;
    }

    async getCertificateFile(certificateId) {
        const certificate = await Certificate.findOne({ certificateId });
        if (!certificate) throw new Error('Certificate not found');
        
        const pdfPath = path.join(__dirname, '..', STORAGE_PATH, `STCC-Certificate-${certificateId}.pdf`);
        
        try {
            await fsp.access(pdfPath);
            return pdfPath;
        } catch (error) {
            throw new Error('PDF file not found');
        }
    }
}

module.exports = new CertificateService();