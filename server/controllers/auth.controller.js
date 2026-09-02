const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
const dotenv = require('dotenv');

dotenv.config();

// Generate JWT token
const generateToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email: email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ================== SIGN UP ==================
const signUp = async (req, res) => {
    console.log('SignUp request received for:', req.body.email);
    try {
        const { name, email, password, age, gender, state } = req.body;

        // Validation
        if (!name || !email || !password || !age || !gender || !state) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields!',
            });
        }

        // Email already exists?
        const [existingUser] = await db.query(
            'SELECT id, is_verified FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            // If user is verified, prevent re-registration
            if (existingUser[0].is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered!',
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        let userId;
        if (existingUser.length > 0) {
            // Update existing unverified user
            await db.query(
                'UPDATE users SET name = ?, password = ?, age = ?, gender = ?, state = ? WHERE id = ?',
                [name, hashedPassword, age, gender, state, existingUser[0].id]
            );
            userId = existingUser[0].id;
        } else {
            // Create new user
            const [result] = await db.query(
                'INSERT INTO users (name, email, password, age, gender, state) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, age, gender, state]
            );
            userId = result.insertId;
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete old OTP
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Save new OTP
        await db.query(
            'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send OTP via email
        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed during signup:', emailError.response?.data || emailError.message);
            // We still proceed or throw? Throwing is safer for the user to know it failed.
            throw new Error(`Email failed: ${emailError.message}`);
        }

        res.status(201).json({
            success: true,
            message: 'OTP sent! Please check your email.',
            userId: userId,
        });

    } catch (error) {
        console.error('CRITICAL SignUp error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
            error: error.message // Temporarily show error message to user for debugging
        });
    }
};

// ================== VERIFY OTP ==================
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are both required!',
            });
        }

        // Find OTP record
        const [otpRecord] = await db.query(
            'SELECT * FROM otp_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [email]
        );

        if (otpRecord.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found, please sign up again!',
            });
        }

        const record = otpRecord[0];

        // Check attempts count
        if (record.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Too many incorrect OTP attempts. Please sign up again!',
            });
        }

        // Check expiration
        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired, please request a new one!',
            });
        }

        // Match OTP
        if (record.otp !== otp) {
            // Increment attempts
            await db.query(
                'UPDATE otp_verification SET attempts = attempts + 1 WHERE id = ?',
                [record.id]
            );

            return res.status(400).json({
                success: false,
                message: `Invalid OTP! ${2 - record.attempts} attempt(s) remaining.`,
            });
        }

        // OTP is valid - verify user
        await db.query(
            'UPDATE users SET is_verified = true WHERE email = ?',
            [email]
        );

        // Delete OTP
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Fetch user info
        const [user] = await db.query(
            'SELECT id, name, email, onboarding_complete FROM users WHERE email = ?',
            [email]
        );

        // Generate token
        const token = generateToken(user[0].id, user[0].email);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            token: token,
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                onboarding_complete: user[0].onboarding_complete,
            },
        });

    } catch (error) {
        console.error('VerifyOTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};

// ================== RESEND OTP ==================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check user existence
        const [user] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email is not registered!',
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete old OTP
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Save new OTP
        await db.query(
            'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully!',
        });

    } catch (error) {
        console.error('ResendOTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};

// ================== SIGN IN ==================
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are both required!',
            });
        }

        // Find user record
        const [user] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email is not registered!',
            });
        }

        // Check verification status
        if (!user[0].is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first!',
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password!',
            });
        }

        // Generate token
        const token = generateToken(user[0].id, user[0].email);

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user[0].name}!`,
            token: token,
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                onboarding_complete: user[0].onboarding_complete,
            },
        });

    } catch (error) {
        console.error('SignIn error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};

// ================== GET CURRENT USER ==================
const getMe = async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, name, email, age, gender, state, onboarding_complete, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!',
            });
        }

        res.status(200).json({
            success: true,
            user: user[0],
        });

    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

module.exports = { signUp, verifyOTP, resendOTP, signIn, getMe };