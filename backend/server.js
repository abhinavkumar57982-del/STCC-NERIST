const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5500"]
        }
    }
}));

// ==========================================
// CORS
// ==========================================
app.use(cors({
    origin: '*',
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
// REQUEST LOGGER
// ==========================================
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
});

// ==========================================
// ROUTES
// ==========================================
console.log('🔗 Registering routes...');

// Auth routes
app.use('/api/auth', authRoutes);
console.log('   ✅ /api/auth');

// Challenge routes
app.use('/api/challenges', challengeRoutes);
console.log('   ✅ /api/challenges');

// Leaderboard routes
app.use('/api/leaderboard', leaderboardRoutes);
console.log('   ✅ /api/leaderboard');

// Certificate routes
app.use('/api/certificates', certificateRoutes);
console.log('   ✅ /api/certificates');

// Password Reset routes
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
// ROOT ROUTE
// ==========================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        name: 'STCC API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            challenges: '/api/challenges',
            leaderboard: '/api/leaderboard',
            certificates: '/api/certificates',
            'password-reset': '/api/password-reset'
        }
    });
});

// ==========================================
// 404 HANDLER
// ==========================================
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    
    // Handle specific error types
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

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    process.exit(1);
});

module.exports = server;