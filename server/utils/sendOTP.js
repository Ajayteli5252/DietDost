const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// OTP generate karo
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP email bhejo via Resend API (HTTPS - works on Render)
const sendOTPEmail = async (email, otp) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    console.log('Resend API Key present:', !!RESEND_API_KEY);

    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not set in environment variables!');
    }

    const response = await axios.post(
        'https://api.resend.com/emails',
        {
            from: 'DietDost <onboarding@resend.dev>',
            to: [email],
            subject: 'DietDost - Email Verification OTP',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #16a34a; margin: 0;">🥗 DietDost</h2>
            <p style="color: #666; margin-top: 5px;">Welcome to your Diet Assistant!</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-top: 0;">Email Verification</h3>
            <p style="color: #555;">Use the OTP below to verify your email:</p>
            
            <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #16a34a; letter-spacing: 10px; margin: 0; font-size: 36px;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px;">⏰ This OTP is valid for <strong>10 minutes</strong> only.</p>
            <p style="color: #999; font-size: 13px;">If you didn't request this, please ignore this email.</p>
          </div>
          
          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 20px;">
            DietDost - Apni Diet Ka Dost 🌿
          </p>
        </div>
      `,
        },
        {
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
};

module.exports = { generateOTP, sendOTPEmail };