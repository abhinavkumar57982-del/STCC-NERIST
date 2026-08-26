const path = require('path');
const fs = require('fs');

const getCertificateTemplate = (data) => {
    const logoBase64 = fs.readFileSync(path.join(__dirname, '../../public/cropped_circle_image (2).png'), { encoding: 'base64' });
    const logoDataUri = `data:image/png;base64,${logoBase64}`;

    // Convert dates to readable format
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const eventDate = new Date(data.eventDate).toLocaleDateString('en-US', options);
    const issueDate = new Date(data.issueDate).toLocaleDateString('en-US', options);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            
            body {
                font-family: 'Inter', sans-serif;
                background: #050807;
                color: #F5F5F5;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            
            .certificate-container {
                width: 1000px;
                height: 700px;
                background: linear-gradient(135deg, #071C1A 0%, #050807 100%);
                border: 2px solid rgba(0, 208, 132, 0.15);
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                padding: 50px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .certificate-container::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(0, 208, 132, 0.08) 0%, transparent 70%);
                pointer-events: none;
            }

            .certificate-container::after {
                content: '';
                position: absolute;
                inset: 0;
                background-image: linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
                background-size: 60px 60px;
                pointer-events: none;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(0, 208, 132, 0.1);
                padding-bottom: 30px;
            }

            .logo-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .logo {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid rgba(0, 208, 132, 0.2);
            }

            .logo-text h1 {
                font-size: 1.5rem;
                font-weight: 800;
                margin: 0;
                color: #00D084;
                letter-spacing: -0.02em;
            }

            .logo-text h2 {
                font-size: 0.8rem;
                font-weight: 600;
                margin: 2px 0 0 0;
                color: #8A9B9A;
                letter-spacing: 0.5px;
            }

            .certificate-id {
                font-size: 0.8rem;
                color: #8A9B9A;
                border: 1px solid rgba(0, 208, 132, 0.1);
                padding: 8px 16px;
                border-radius: 8px;
                background: rgba(0, 208, 132, 0.05);
            }

            .body {
                text-align: center;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
                z-index: 2;
            }

            .title {
                font-size: 2.5rem;
                font-weight: 800;
                color: #6EE7B7;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .subtitle {
                font-size: 1rem;
                color: #8A9B9A;
                margin-bottom: 30px;
            }

            .student-name {
                font-size: 2.2rem;
                font-weight: 800;
                color: #F5F5F5;
                margin-bottom: 10px;
                letter-spacing: -0.02em;
                text-transform: uppercase;
            }

            .student-reg {
                font-size: 1rem;
                color: #00D084;
                margin-bottom: 40px;
                font-weight: 600;
            }

            .achievement-box {
                display: inline-block;
                border: 1px solid rgba(0, 208, 132, 0.3);
                border-radius: 20px;
                padding: 10px 30px;
                margin-bottom: 30px;
                background: rgba(0, 208, 132, 0.05);
            }

            .achievement-title {
                font-size: 1.2rem;
                font-weight: 700;
                color: #F5F5F5;
            }

            .event-details {
                font-size: 1rem;
                color: #B8C5C4;
                margin-bottom: 10px;
            }

            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-top: 1px solid rgba(0, 208, 132, 0.1);
                padding-top: 30px;
            }

            .signature {
                text-align: center;
            }

            .signature-line {
                width: 200px;
                height: 1px;
                background: #8A9B9A;
                margin-bottom: 8px;
            }

            .signature-name {
                font-size: 0.8rem;
                color: #F5F5F5;
                font-weight: 600;
            }

            .signature-role {
                font-size: 0.7rem;
                color: #8A9B9A;
            }

            .qr-code {
                width: 80px;
                height: 80px;
                background: #fff;
                padding: 5px;
                border-radius: 8px;
            }

            .qr-container {
                text-align: center;
            }

            .qr-label {
                font-size: 0.6rem;
                color: #8A9B9A;
                margin-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="header">
                <div class="logo-section">
                    <img src="${logoDataUri}" class="logo" alt="STCC Logo">
                    <div class="logo-text">
                        <h1>STCC</h1>
                        <h2>STUDENT TECHNICAL & CODING CLUB</h2>
                    </div>
                </div>
                <div class="certificate-id">ID: ${data.certificateId}</div>
            </div>

            <div class="body">
                <div class="title">Certificate of Achievement</div>
                <div class="subtitle">This is to certify that</div>
                <div class="student-name">${data.studentName}</div>
                <div class="student-reg">Registration No: ${data.regNo}</div>
                <div class="subtitle">has successfully participated / won in</div>
                <div class="achievement-box">
                    <div class="achievement-title">${data.achievement}</div>
                </div>
                <div class="event-details"><strong>${data.eventName}</strong></div>
                <div class="event-details">Held on ${eventDate}</div>
            </div>

            <div class="footer">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">Dr. Faculty Advisor</div>
                    <div class="signature-role">Student Technical & Coding Club</div>
                </div>

                <div class="date-section">
                    <div style="font-size: 0.8rem; color: #8A9B9A; text-align: center;">Issued on</div>
                    <div style="font-size: 1rem; color: #F5F5F5; font-weight: 600; margin-top: 5px;">${issueDate}</div>
                </div>

                <div class="qr-container">
                    <img src="${data.qrCode}" class="qr-code" alt="Verification QR Code">
                    <div class="qr-label">VERIFY</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getCertificateTemplate };