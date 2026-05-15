import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

const OTPVerify = ({ email, onSuccess, onBack }) => {
    const { verifyOTP, resendOTP } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // OTP input handle karo
    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Sirf numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Next input pe focus karo
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Backspace handle karo
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Paste handle karo
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);

        // Last filled input pe focus karo
        const lastIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    // OTP verify karo
    const handleVerify = async () => {
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter the 6-digit OTP!');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await verifyOTP(email, otpString);

            if (res.success) {
                setSuccess('Email verified successfully! 🎉');
                setTimeout(() => onSuccess(), 1000);
            } else {
                setError(res.message);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again!');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // OTP resend karo
    const handleResend = async () => {
        try {
            setResendLoading(true);
            setError('');
            const res = await resendOTP(email);

            if (res.success) {
                setSuccess('A new OTP has been sent!');
                setTimer(30);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again!');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="text-center">
            {/* Icon */}
            <div className="text-6xl mb-4">📧</div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verify Your Email
            </h2>
            <p className="text-gray-500 text-sm mb-2">
                We've sent an OTP to:
            </p>
            <p className="text-green-600 font-semibold mb-6">{email}</p>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    ✅ {success}
                </div>
            )}

            {/* OTP Input Boxes */}
            <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                ))}
            </div>

            {/* Verify Button */}
            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold text-sm transition-all mb-4"
            >
                {loading ? 'Verifying...' : 'Verify OTP ✅'}
            </button>

            {/* Resend */}
            <div className="mb-4">
                {canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                        {resendLoading ? 'Sending...' : 'Resend OTP 🔄'}
                    </button>
                ) : (
                    <p className="text-gray-400 text-sm">
                        Resend in {timer} seconds
                    </p>
                )}
            </div>

            {/* Back */}
            <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
                ← Go Back
            </button>
        </div>
    );
};

export default OTPVerify;