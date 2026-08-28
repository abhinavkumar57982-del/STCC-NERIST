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
// ✅ FIXED CORS - Allow ALL origins during development
// ============================================================
// For development, allow all origins
// For production, you can restrict this later
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true);
        
        // Allow ALL origins during development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // For production, check against allowed origins
        const allowedOrigins = [
            'https://stcc-website.onrender.com',
            'https://your-app-name.onrender.com'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        console.log('🚫 CORS blocked for:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin']
}));

// ✅ Handle ALL preflight requests explicitly
app.use((req, res, next) => {
    // Set CORS headers for every request
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        console.log(`📡 OPTIONS preflight for: ${req.url} from ${req.headers.origin}`);
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
    contentSecurityPolicy: false
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
    console.log(`📝 ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`);
    next();
});

// ============================================================
// SERVE STATIC FILES
// ============================================================
const CLIENT_ROOT = path.join(__dirname, '..');
app.use(express.static(CLIENT_ROOT));

// Routes for all frontend pages
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

// Contact form route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        console.log('📧 Contact form submitted:', { name, email, message });
        
        res.json({ 
            success: true, 
            message: 'Message received! We\'ll get back to you soon.' 
        });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message' 
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
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================================
// 404 FOR API
// ============================================================
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'API route not found' 
    });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS not allowed for this origin'
        });
    }
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error: ' + err.message 
    });
});

// ============================================================
// CONNECT TO MONGODB & START SERVER
// ============================================================
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 STCC API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('✅ CORS enabled for ALL origins in development mode');
});
