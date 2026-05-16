const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
const dotenv = require('dotenv');

dotenv.config();

// JWT token banao
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
                message: 'Sab fields bharo!',
            });
        }

        // Email already exists?
        const [existingUser] = await db.query(
            'SELECT id, is_verified FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            // Agar user verified hai toh block karo
            if (existingUser[0].is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'Ye email already registered hai!',
                });
            }
        }

        // Password hash karo
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

        // OTP generate karo
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Purana OTP delete karo
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Naya OTP save karo
        await db.query(
            'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // OTP email bhejo
        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed during signup:', emailError.response?.data || emailError.message);
            // We still proceed or throw? Throwing is safer for the user to know it failed.
            throw new Error(`Email failed: ${emailError.message}`);
        }

        res.status(201).json({
            success: true,
            message: 'OTP bhej diya! Email check karo.',
            userId: userId,
        });

    } catch (error) {
        console.error('CRITICAL SignUp error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi, dobara try karo!',
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
                message: 'Email aur OTP dono chahiye!',
            });
        }

        // OTP find karo
        const [otpRecord] = await db.query(
            'SELECT * FROM otp_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [email]
        );

        if (otpRecord.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP nahi mila, dobara signup karo!',
            });
        }

        const record = otpRecord[0];

        // Attempts check karo
        if (record.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: '3 baar galat OTP dala, dobara signup karo!',
            });
        }

        // Expiry check karo
        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({
                success: false,
                message: 'OTP expire ho gaya, dobara bhejwa lo!',
            });
        }

        // OTP match karo
        if (record.otp !== otp) {
            // Attempts badhao
            await db.query(
                'UPDATE otp_verification SET attempts = attempts + 1 WHERE id = ?',
                [record.id]
            );

            return res.status(400).json({
                success: false,
                message: `Galat OTP! ${2 - record.attempts} attempts baaki hain.`,
            });
        }

        // OTP sahi hai - user verify karo
        await db.query(
            'UPDATE users SET is_verified = true WHERE email = ?',
            [email]
        );

        // OTP delete karo
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // User info lo
        const [user] = await db.query(
            'SELECT id, name, email, onboarding_complete FROM users WHERE email = ?',
            [email]
        );

        // Token banao
        const token = generateToken(user[0].id, user[0].email);

        res.status(200).json({
            success: true,
            message: 'Email verify ho gaya!',
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
            message: 'Kuch gadbad ho gayi, dobara try karo!',
        });
    }
};

// ================== RESEND OTP ==================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // User check karo
        const [user] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email registered nahi hai!',
            });
        }

        // Naya OTP banao
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Purana OTP delete karo
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

        // Naya OTP save karo
        await db.query(
            'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Email bhejo
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'Naya OTP bhej diya!',
        });

    } catch (error) {
        console.error('ResendOTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi, dobara try karo!',
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
                message: 'Email aur password dono chahiye!',
            });
        }

        // User find karo
        const [user] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email registered nahi hai!',
            });
        }

        // Verified check karo
        if (!user[0].is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Pehle email verify karo!',
            });
        }

        // Password check karo
        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Galat password!',
            });
        }

        // Token banao
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
            message: 'Kuch gadbad ho gayi, dobara try karo!',
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
                message: 'User nahi mila!',
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
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

module.exports = { signUp, verifyOTP, resendOTP, signIn, getMe };