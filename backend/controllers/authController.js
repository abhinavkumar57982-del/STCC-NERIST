const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
const register = async (req, res) => {
    try {
        const { name, registrationNo, email, contact, password } = req.body;

        // Validate
        if (!name || !registrationNo || !email || !contact || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Format registration number
        const formattedRegNo = registrationNo.toString().toUpperCase().trim();

        // Check existing user by registration number
        const existingRegNo = await User.findOne({ 
            registrationNo: formattedRegNo 
        });
        if (existingRegNo) {
            return res.status(400).json({
                success: false,
                message: 'Registration number already registered'
            });
        }

        // Check existing email
        const existingEmail = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = new User({
            name: name.trim(),
            registrationNo: formattedRegNo,
            email: email.toLowerCase().trim(),
            contact: contact.trim(),
            passwordHash: password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                registrationNo: user.registrationNo,
                email: user.email,
                contact: user.contact
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// Login - using Registration Number
const login = async (req, res) => {
    try {
        const { registrationNo, password } = req.body;

        console.log('Login attempt for:', registrationNo); // Debug log

        // Validate
        if (!registrationNo || !password) {
            return res.status(400).json({
                success: false,
                message: 'Registration number and password are required'
            });
        }

        // Format registration number
        const formattedRegNo = registrationNo.toString().toUpperCase().trim();

        // Find user by registration number
        const user = await User.findOne({ 
            registrationNo: formattedRegNo 
        });
        
        if (!user) {
            console.log('User not found with reg no:', formattedRegNo); // Debug log
            return res.status(401).json({
                success: false,
                message: 'Invalid registration number or password'
            });
        }

        console.log('User found:', user.name); // Debug log

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', user.name); // Debug log
            return res.status(401).json({
                success: false,
                message: 'Invalid registration number or password'
            });
        }

        console.log('Login successful for:', user.name); // Debug log

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                registrationNo: user.registrationNo,
                email: user.email,
                contact: user.contact
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                registrationNo: req.user.registrationNo,
                email: req.user.email,
                contact: req.user.contact
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};

module.exports = { register, login, getMe };