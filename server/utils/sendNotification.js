const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendBrevoEmail = async ({ to, subject, html }) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

    if (!BREVO_API_KEY) {
        console.error('[Email] BREVO_API_KEY is not defined! Cannot send email.');
        return false;
    }

    if (!SENDER_EMAIL) {
        console.error('[Email] SENDER_EMAIL is not defined! Cannot send email.');
        return false;
    }

    try {
        console.log(`[Email] Sending to: ${to} | Subject: ${subject}`);
        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: { name: 'DietDost', email: SENDER_EMAIL },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            },
            {
                headers: {
                    'api-key': BREVO_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`[Email] Successfully sent to ${to} | Message ID: ${response.data?.messageId || 'N/A'}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error.response?.data || error.message);
        return false;
    }
};

// ================== MEAL REMINDER ==================
const sendMealReminder = async (email, name) => {
    return await sendBrevoEmail({
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
            <p style="color: #16a34a; font-weight: bold; margin: 0;">🍽️ Logging your meals helps you:</p>
            <ul style="color: #374151; margin-top: 8px;">
              <li>Track your daily calories</li>
              <li>Monitor your nutrition</li>
              <li>Maintain your streak 🔥</li>
            </ul>
          </div>
          <a href="https://diet-dost.vercel.app/meal-tracker" 
            style="display: block; background: #16a34a; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Log My Meal Now 🚀
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          DietDost - Your Diet Friend 🌿
        </p>
      </div>
    `,
    });
};

// ================== WATER REMINDER ==================
const sendWaterReminder = async (email, name) => {
    return await sendBrevoEmail({
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
          <a href="https://diet-dost.vercel.app/dashboard" 
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
    return await sendBrevoEmail({
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
            <p style="color: #ea580c; font-size: 32px; margin: 0;">${currentStreak} Days!</p>
          </div>
          <a href="https://diet-dost.vercel.app/meal-tracker" 
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