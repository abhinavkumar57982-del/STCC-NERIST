const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Helper: Generate secure reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper: Hash token for storage
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// ==========================================
// STEP 1: Verify Email + Phone (Direct Reset)
// ==========================================
const verifyAccount = async (req, res) => {
    try {
        const { email, phone } = req.body;

        // Validate input
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email and phone number are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate phone format (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        // Find user with BOTH email AND phone matching
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            contact: phone.trim()
        });

        // ✅ USER FOUND - Return reset token directly
        if (user) {
            // Generate reset token
            const token = generateResetToken();
            const tokenHash = hashToken(token);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Store token hash
            await PasswordResetToken.create({
                userId: user._id,
                tokenHash: tokenHash,
                expiresAt: expiresAt
            });

            console.log(`✅ Account verified: ${user.email} (${user.registrationNo})`);

            // Return token directly (for direct reset)
            return res.status(200).json({
                success: true,
                message: 'Account verified successfully!',
                resetToken: token,
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        }

        // User not found
        return res.status(404).json({
            success: false,
            message: 'No account found with this email and phone number. Please check your details.'
        });

    } catch (error) {
        console.error('❌ Verify account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// ==========================================
// DIRECT RESET (No Token Needed - Production)
// ==========================================
const directReset = async (req, res) => {
    try {
        const { email, phone, newPassword } = req.body;

        // Validate input
        if (!email || !phone || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            contact: phone.trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Account not found. Please verify your details.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.passwordHash = hashedPassword;
        await user.save();

        // Delete any existing tokens
        await PasswordResetToken.deleteMany({ userId: user._id });

        console.log(`✅ Password reset successful for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login.'
        });

    } catch (error) {
        console.error('❌ Direct reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// ==========================================
// STEP 2: Validate Token & Show Reset Form
// ==========================================
const validateToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        const tokenHash = hashToken(token);

        // Find valid token
        const resetToken = await PasswordResetToken.findOne({
            tokenHash: tokenHash,
            used: false,
            expiresAt: { $gt: new Date() }
        }).populate('userId', 'name email');

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link. Please request a new one.'
            });
        }

        // Token is valid - return user info
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                name: resetToken.userId.name,
                email: resetToken.userId.email
            }
        });

    } catch (error) {
        console.error('❌ Validate token error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// ==========================================
// STEP 3: Reset Password (With Token)
// ==========================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the token for lookup
        const tokenHash = hashToken(token);

        // Find valid token
        const resetToken = await PasswordResetToken.findOne({
            tokenHash: tokenHash,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link. Please request a new one.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        await User.findByIdAndUpdate(resetToken.userId, {
            passwordHash: hashedPassword
        });

        // Invalidate the token (mark as used)
        resetToken.used = true;
        await resetToken.save();

        // Delete any other unused tokens for this user
        await PasswordResetToken.deleteMany({
            userId: resetToken.userId,
            used: false
        });

        console.log(`✅ Password reset successful for user: ${resetToken.userId}`);

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login.'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    verifyAccount,
    directReset,
    validateToken,
    resetPassword
};
