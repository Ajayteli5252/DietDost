const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/meal', require('./routes/meal.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/streak', require('./routes/streak.routes'));
app.use('/api/weight', require('./routes/weight.routes'));

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

//Notification routes
const cron = require('node-cron');
const { sendDailyNotifications } = require('./controllers/notification.controller');

// Routes ke saath add karo
app.use('/api/notifications', require('./routes/notification.routes'));

// Cron job - Run every minute to check for scheduled notifications
cron.schedule('* * * * *', () => {
    sendDailyNotifications();
});