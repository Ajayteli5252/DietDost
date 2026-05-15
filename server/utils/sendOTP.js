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

// OTP generate karo
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP email bhejo
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"DietDost" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'DietDost - Email Verification OTP',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Welcome to DietDost! 🥗</h2>
        <p>Apna email verify karne ke liye neeche diya OTP use karo:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #16a34a; letter-spacing: 8px;">${otp}</h1>
        </div>
        <p style="color: #666;">Ye OTP sirf <strong>10 minutes</strong> ke liye valid hai.</p>
        <p style="color: #666;">Agar aapne signup nahi kiya to is email ko ignore karo.</p>
        <hr style="border: 1px solid #e5e7eb;">
        <p style="color: #999; font-size: 12px;">DietDost - Apni Diet Ka Dost 🌿</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };