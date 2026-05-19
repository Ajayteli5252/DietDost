const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/meal', require('./routes/meal.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/streak', require('./routes/streak.routes'));
app.use('/api/weight', require('./routes/weight.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'DietDost API Running! 🥗' });
});

// Error handler - hamesha sabse neeche
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Cron job - Run every minute to check for scheduled notifications
const { sendDailyNotifications } = require('./controllers/notification.controller');
cron.schedule('* * * * *', () => {
    sendDailyNotifications();
});
console.log('[Cron] Notification scheduler started - checking every minute');