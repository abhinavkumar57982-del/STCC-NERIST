const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');  // ✅ ADD THIS
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

dotenv.config();

const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "http:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || "*"]
        }
    }
}));

// ==========================================
// CORS - UPDATED FOR PRODUCTION
// ==========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['*'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ==========================================
// BODY PARSER
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// ✅ SERVE STATIC FILES (FRONTEND)
// ==========================================
// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve CSS, JS, Images with correct MIME types
app.use('/css', express.static(path.join(__dirname, '..', 'css'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

app.use('/js', express.static(path.join(__dirname, '..', 'js'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// ==========================================
// ✅ FRONTEND ROUTES
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'forgot-password.html'));
});

app.get('/Events', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Events.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'leaderboard.html'));
});

app.get('/E-body', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'E-body.html'));
});

app.get('/Gallery', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Gallery.html'));
});

app.get('/MyCertificates', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'MyCertificates.html'));
});

app.get('/ContactUs', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'ContactUs.html'));
});

app.get('/daily-challenge', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'daily-challenge.html'));
});

app.get('/test-challenge', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'test-challenge.html'));
});

// ==========================================
// REQUEST LOGGER
// ==========================================
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
});

// ==========================================
// API ROUTES
// ==========================================
console.log('🔗 Registering routes...');

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

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==========================================
// 404 HANDLER
// ==========================================
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.url}`);
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate key error',
            field: Object.keys(err.keyPattern)[0]
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// ==========================================
// CONNECT TO MONGODB & START SERVER
// ==========================================
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 STCC API running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - Auth:           http://localhost:${PORT}/api/auth`);
    console.log(`   - Challenges:     http://localhost:${PORT}/api/challenges`);
    console.log(`   - Leaderboard:    http://localhost:${PORT}/api/leaderboard`);
    console.log(`   - Certificates:   http://localhost:${PORT}/api/certificates`);
    console.log(`   - Password Reset: http://localhost:${PORT}/api/password-reset`);
    console.log(`   - Health:         http://localhost:${PORT}/health`);
    console.log(`\n🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    process.exit(1);
});

module.exports = server;
