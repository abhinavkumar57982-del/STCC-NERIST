const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

dotenv.config();

const app = express();

// ============================================================
// CONFIGURATION
// ============================================================
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_ROOT = path.join(__dirname, '..');

// ✅ FIXED: Add your actual Render URL here
const allowedOrigins = [
    'https://stcc-nerist.onrender.com',  // ← YOUR ACTUAL URL
    'https://stcc-website.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
];

// ============================================================
// CORS CONFIGURATION
// ============================================================
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow all origins in development
        if (!isProduction) {
            console.log('✅ Allowing origin (dev):', origin);
            return callback(null, true);
        }
        
        // In production, allow specific origins
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Allowing origin (prod):', origin);
            return callback(null, true);
        }
        
        console.log('🚫 CORS blocked for:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'X-Requested-With',
        'Origin'
    ]
}));

// ============================================================
// GLOBAL CORS MIDDLEWARE (Handles ALL preflight requests)
// ============================================================
app.use((req, res, next) => {
    // Get the origin from the request
    const origin = req.headers.origin;
    
    // Always set CORS headers
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        console.log(`📡 OPTIONS preflight: ${req.url} from ${origin || 'no-origin'}`);
        return res.status(204).end();
    }
    
    next();
});

// ============================================================
// SECURITY HEADERS
// ============================================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'no-referrer' }
}));

// ============================================================
// BODY PARSERS
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// REQUEST LOGGER
// ============================================================
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📝 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) from ${req.headers.origin || 'no-origin'}`);
    });
    
    next();
});

// ============================================================
// RATE LIMITING
// ============================================================
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many auth attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/api/auth', authLimiter);

// ============================================================
// STATIC FILE SERVING
// ============================================================
app.use(express.static(CLIENT_ROOT, {
    maxAge: '1h',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// ============================================================
// FRONTEND ROUTES (All pages)
// ============================================================
const pages = {
    '/': 'index.html',
    '/index': 'index.html',
    '/index.html': 'index.html',
    '/login': 'login.html',
    '/login.html': 'login.html',
    '/forgot-password': 'forgot-password.html',
    '/forgot-password.html': 'forgot-password.html',
    '/Events': 'Events.html',
    '/Events.html': 'Events.html',
    '/leaderboard': 'leaderboard.html',
    '/leaderboard.html': 'leaderboard.html',
    '/E-body': 'E-body.html',
    '/E-body.html': 'E-body.html',
    '/Gallery': 'Gallery.html',
    '/Gallery.html': 'Gallery.html',
    '/MyCertificates': 'MyCertificates.html',
    '/MyCertificates.html': 'MyCertificates.html',
    '/ContactUs': 'ContactUs.html',
    '/ContactUs.html': 'ContactUs.html',
    '/daily-challenge': 'daily-challenge.html',
    '/daily-challenge.html': 'daily-challenge.html',
    '/test-challenge': 'test-challenge.html',
    '/test-challenge.html': 'test-challenge.html'
};

// Register all page routes
Object.entries(pages).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(CLIENT_ROOT, file));
    });
});

// ============================================================
// API ROUTES
// ============================================================
console.log('🔗 Registering API routes...');

app.use('/api/auth', authRoutes);
console.log('   ✅ /api/auth');

app.use('/api/challenges', challengeRoutes);
console.log('   ✅ /api/challenges');

app.use('/api/leaderboard', leaderboardRoutes);
console.log('   ✅ /api/leaderboard');

app.use('/api/certificates', certificateRoutes);
console.log('   ✅ /api/certificates');

app.use('/api/password-reset', passwordResetRoutes);
console.log('   ✅ /api/password-reset');

// ============================================================
// CONTACT FORM ROUTE
// ============================================================
const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        console.log('📧 Contact form submission:', {
            name,
            email,
            message: message.substring(0, 100) + '...',
            timestamp: new Date().toISOString()
        });
        
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: 'stcc.codingclub@gmail.com',
                    subject: `STCC Contact Form: ${name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #00D084;">STCC Contact Form</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Message:</strong></p>
                            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
                        </div>
                    `
                });
                console.log('📧 Email sent successfully');
            } catch (emailError) {
                console.error('📧 Email send error:', emailError.message);
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Message received! We\'ll get back to you soon.' 
        });
        
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again.' 
        });
    }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================================
// VERIFY CERTIFICATE (Public page)
// ============================================================
app.get('/verify/:certificateId', (req, res) => {
    res.sendFile(path.join(CLIENT_ROOT, 'index.html'));
});

// ============================================================
// 404 HANDLER (For non-API routes)
// ============================================================
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
            success: false, 
            message: 'API route not found: ' + req.method + ' ' + req.path 
        });
    }
    
    res.sendFile(path.join(CLIENT_ROOT, 'index.html'));
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS not allowed for this origin: ' + req.headers.origin
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// ============================================================
// CONNECT TO MONGODB & START SERVER
// ============================================================
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('🚀 STCC Server Started Successfully!');
            console.log('='.repeat(60));
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Server URL: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/health`);
            console.log('✅ CORS Enabled for origins:');
            allowedOrigins.forEach(origin => console.log('   - ' + origin));
            console.log('='.repeat(60));
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });

module.exports = app;
