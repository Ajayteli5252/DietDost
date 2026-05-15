const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
    try {
        // Header se token lo
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        // Token nahi hai
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token nahi mila!',
            });
        }

        // Token verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        // Token expire ya invalid
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expire ho gaya, dobara login karo!',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token!',
        });
    }
};

module.exports = verifyToken;