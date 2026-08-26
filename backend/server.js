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

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
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
// SERVE STATIC FILES (Frontend)
// ==========================================
// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// For CSS, JS, Images folders
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// ==========================================
// FRONTEND ROUTES
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
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

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'forgot-password.html'));
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
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ==========================================
// CONNECT TO MONGODB & START SERVER
// ==========================================
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 STCC API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Frontend available at: http://localhost:${PORT}`);
});
