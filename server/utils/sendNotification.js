const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ================== MEAL REMINDER ==================
const sendMealReminder = async (email, name) => {
    await transporter.sendMail({
        from: `"DietDost" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🍽️ Time to log your meal! - DietDost',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f0fdf4; padding: 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #16a34a;">🥗 DietDost</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #1f2937;">Hey ${name}! 👋</h2>
          <p style="color: #6b7280;">Don't forget to log your meals today!</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #16a34a; font-weight: bold; margin: 0;">
              🍽️ Logging your meals helps you:
            </p>
            <ul style="color: #374151; margin-top: 8px;">
              <li>Track your daily calories</li>
              <li>Monitor your nutrition</li>
              <li>Maintain your streak 🔥</li>
            </ul>
          </div>
          <a href="http://localhost:5173/meal-tracker" 
            style="display: block; background: #16a34a; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Log My Meal Now 🚀
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          DietDost - Your Diet Friend 🌿<br/>
          <a href="#" style="color: #9ca3af;">Unsubscribe from reminders</a>
        </p>
      </div>
    `,
    });
};

// ================== WATER REMINDER ==================
const sendWaterReminder = async (email, name) => {
    await transporter.sendMail({
        from: `"DietDost" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '💧 Have you had enough water today? - DietDost',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #eff6ff; padding: 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #16a34a;">🥗 DietDost</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #1f2937;">Hey ${name}! 💧</h2>
          <p style="color: #6b7280;">Time to hydrate! Have you had your 8 glasses today?</p>
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
            <p style="font-size: 48px; margin: 0;">💧💧💧💧</p>
            <p style="color: #3b82f6; font-weight: bold;">Target: 8 glasses = 2000ml</p>
          </div>
          <div style="background: #f0fdf4; padding: 12px; border-radius: 8px;">
            <p style="color: #16a34a; margin: 0; font-size: 14px;">
              💡 Tip: Drinking enough water helps with digestion, energy levels, and weight management!
            </p>
          </div>
          <a href="http://localhost:5173/dashboard" 
            style="display: block; background: #3b82f6; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Log My Water 💧
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          DietDost - Your Diet Friend 🌿
        </p>
      </div>
    `,
    });
};

// ================== STREAK REMINDER ==================
const sendStreakReminder = async (email, name, currentStreak) => {
    await transporter.sendMail({
        from: `"DietDost" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔥 Don't break your ${currentStreak} day streak! - DietDost`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #fff7ed; padding: 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #16a34a;">🥗 DietDost</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #1f2937;">Hey ${name}! 🔥</h2>
          <p style="color: #6b7280;">You have a <strong>${currentStreak} day streak</strong> going! Don't break it!</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
            <p style="font-size: 64px; margin: 0;">🔥</p>
            <p style="color: #ea580c; font-size: 32px; font-weight: black; margin: 0;">${currentStreak} Days!</p>
            <p style="color: #9a3412; margin: 4px 0 0;">Keep it going!</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Log at least one meal today to maintain your streak!
          </p>
          <a href="http://localhost:5173/meal-tracker" 
            style="display: block; background: #ea580c; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Maintain My Streak 🔥
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          DietDost - Your Diet Friend 🌿
        </p>
      </div>
    `,
    });
};

module.exports = { sendMealReminder, sendWaterReminder, sendStreakReminder };