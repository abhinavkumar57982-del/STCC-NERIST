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
const DailyChallenge = require('./models/DailyChallenge');

dotenv.config();

const app = express();

// ============================================================
// CORS CONFIGURATION
// ============================================================
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        
        // Allow ALL origins during development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // For production, check against allowed origins
        const allowedOrigins = [
            'https://stcc-website.onrender.com',
            'https://stcc-nerist.onrender.com',
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

// Handle ALL preflight requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
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
// ✅ SEED CHALLENGES ROUTE (Run once to populate database)
// ============================================================
app.post('/api/seed-challenges', async (req, res) => {
    try {
        console.log('🌱 Seeding challenges...');
        
        const challenges = [
            {
                dayNumber: 1,
                title: "Factorial Calculator",
                slug: "factorial-calculator",
                description: "Write a program that calculates the factorial of a given number n.\nFactorial of n (n!) = n × (n-1) × (n-2) × ... × 1\nFor example: 5! = 5 × 4 × 3 × 2 × 1 = 120",
                difficulty: "Easy",
                date: new Date(),
                inputFormat: "A single integer n (0 ≤ n ≤ 20)",
                outputFormat: "The factorial of n as a single integer",
                constraints: "0 ≤ n ≤ 20 (n! fits in a 64-bit integer)",
                examples: "Input: 5\nOutput: 120\n\nInput: 3\nOutput: 6",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 10,
                visibleTestCases: [
                    { input: "5\n", output: "120\n", isHidden: false },
                    { input: "3\n", output: "6\n", isHidden: false },
                    { input: "0\n", output: "1\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "10\n", output: "3628800\n", isHidden: true },
                    { input: "7\n", output: "5040\n", isHidden: true },
                    { input: "1\n", output: "1\n", isHidden: true },
                    { input: "20\n", output: "2432902008176640000\n", isHidden: true }
                ]
            },
            {
                dayNumber: 2,
                title: "Sum of Two Numbers",
                slug: "sum-of-two-numbers",
                description: "Write a program that takes two integers as input and returns their sum.",
                difficulty: "Easy",
                date: new Date(),
                inputFormat: "Two space-separated integers a and b",
                outputFormat: "The sum of a and b",
                constraints: "-10^9 ≤ a, b ≤ 10^9",
                examples: "Input: 5 7\nOutput: 12",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 10,
                visibleTestCases: [
                    { input: "5 7\n", output: "12\n", isHidden: false },
                    { input: "10 20\n", output: "30\n", isHidden: false },
                    { input: "-5 7\n", output: "2\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "1000000000 2000000000\n", output: "3000000000\n", isHidden: true },
                    { input: "-10 -20\n", output: "-30\n", isHidden: true },
                    { input: "0 0\n", output: "0\n", isHidden: true }
                ]
            },
            {
                dayNumber: 3,
                title: "Check Prime Number",
                slug: "check-prime-number",
                description: "Write a program that checks if a given number is prime.\nA prime number is a number greater than 1 that has no positive divisors other than 1 and itself.",
                difficulty: "Medium",
                date: new Date(),
                inputFormat: "A single integer n",
                outputFormat: "Print 'Prime' if n is prime, otherwise 'Not Prime'",
                constraints: "1 ≤ n ≤ 10^6",
                examples: "Input: 7\nOutput: Prime",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 15,
                visibleTestCases: [
                    { input: "7\n", output: "Prime\n", isHidden: false },
                    { input: "10\n", output: "Not Prime\n", isHidden: false },
                    { input: "2\n", output: "Prime\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "97\n", output: "Prime\n", isHidden: true },
                    { input: "100\n", output: "Not Prime\n", isHidden: true },
                    { input: "1\n", output: "Not Prime\n", isHidden: true },
                    { input: "9973\n", output: "Prime\n", isHidden: true }
                ]
            },
            {
                dayNumber: 4,
                title: "Reverse a String",
                slug: "reverse-a-string",
                description: "Write a program that reverses a given string.",
                difficulty: "Easy",
                date: new Date(),
                inputFormat: "A single line containing a string s",
                outputFormat: "The reversed string",
                constraints: "1 ≤ |s| ≤ 1000",
                examples: "Input: hello\nOutput: olleh",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 10,
                visibleTestCases: [
                    { input: "hello\n", output: "olleh\n", isHidden: false },
                    { input: "world\n", output: "dlrow\n", isHidden: false },
                    { input: "a\n", output: "a\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "racecar\n", output: "racecar\n", isHidden: true },
                    { input: "hello world\n", output: "dlrow olleh\n", isHidden: true },
                    { input: "12345\n", output: "54321\n", isHidden: true }
                ]
            },
            {
                dayNumber: 5,
                title: "Fibonacci Sequence",
                slug: "fibonacci-sequence",
                description: "Write a program that prints the nth Fibonacci number.\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)",
                difficulty: "Medium",
                date: new Date(),
                inputFormat: "A single integer n",
                outputFormat: "The nth Fibonacci number",
                constraints: "0 ≤ n ≤ 30",
                examples: "Input: 10\nOutput: 55",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 15,
                visibleTestCases: [
                    { input: "10\n", output: "55\n", isHidden: false },
                    { input: "5\n", output: "5\n", isHidden: false },
                    { input: "0\n", output: "0\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "1\n", output: "1\n", isHidden: true },
                    { input: "20\n", output: "6765\n", isHidden: true },
                    { input: "7\n", output: "13\n", isHidden: true },
                    { input: "15\n", output: "610\n", isHidden: true }
                ]
            },
            {
                dayNumber: 6,
                title: "Palindrome Check",
                slug: "palindrome-check",
                description: "Write a program that checks if a given string is a palindrome (reads the same forwards and backwards).\nIgnore case and spaces for this check.",
                difficulty: "Easy",
                date: new Date(),
                inputFormat: "A single line containing a string s",
                outputFormat: "Print 'Palindrome' if s is a palindrome, otherwise 'Not Palindrome'",
                constraints: "1 ≤ |s| ≤ 1000",
                examples: "Input: racecar\nOutput: Palindrome",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 10,
                visibleTestCases: [
                    { input: "racecar\n", output: "Palindrome\n", isHidden: false },
                    { input: "hello\n", output: "Not Palindrome\n", isHidden: false },
                    { input: "a\n", output: "Palindrome\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "madam\n", output: "Palindrome\n", isHidden: true },
                    { input: "A man a plan a canal Panama\n", output: "Not Palindrome\n", isHidden: true },
                    { input: "never odd or even\n", output: "Not Palindrome\n", isHidden: true },
                    { input: "12321\n", output: "Palindrome\n", isHidden: true }
                ]
            },
            {
                dayNumber: 7,
                title: "Find Maximum in Array",
                slug: "find-maximum-in-array",
                description: "Write a program that finds the maximum element in an array.",
                difficulty: "Easy",
                date: new Date(),
                inputFormat: "First line: n (size of array)\nSecond line: n space-separated integers",
                outputFormat: "The maximum element",
                constraints: "1 ≤ n ≤ 10^5",
                examples: "Input: 5\n1 2 3 4 5\nOutput: 5",
                allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
                points: 10,
                visibleTestCases: [
                    { input: "5\n1 2 3 4 5\n", output: "5\n", isHidden: false },
                    { input: "3\n10 20 5\n", output: "20\n", isHidden: false },
                    { input: "1\n42\n", output: "42\n", isHidden: false }
                ],
                hiddenTestCases: [
                    { input: "6\n-5 -2 -1 -10 -3 -7\n", output: "-1\n", isHidden: true },
                    { input: "4\n100 200 150 300\n", output: "300\n", isHidden: true },
                    { input: "2\n-10 -20\n", output: "-10\n", isHidden: true }
                ]
            }
        ];

        // Clear existing challenges
        await DailyChallenge.deleteMany({});
        
        // Insert new challenges
        const result = await DailyChallenge.insertMany(challenges);
        
        console.log(`✅ Seeded ${result.length} challenges successfully`);
        
        res.json({ 
            success: true, 
            message: `Seeded ${result.length} challenges successfully!`,
            challenges: result.map(c => ({ day: c.dayNumber, title: c.title }))
        });
    } catch (error) {
        console.error('❌ Seed error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
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
