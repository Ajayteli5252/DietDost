import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUp from '../components/auth/SignUp';
import SignIn from '../components/auth/SignIn';
import OTPVerify from '../components/auth/OTPVerify';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [showOTP, setShowOTP] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSignUpSuccess = (userEmail) => {
        setEmail(userEmail);
        setShowOTP(true);
    };

    const handleOTPSuccess = () => {
        navigate('/onboarding');
    };

    const handleSignInSuccess = (user) => {
        if (user.onboarding_complete) {
            navigate('/dashboard');
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-5xl">🥗</span>
                    <h1 className="text-3xl font-bold text-green-600 mt-2">DietDost</h1>
                    <p className="text-gray-500 mt-1">Your Personal Diet Companion</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {!showOTP ? (
                        <>
                            {/* Tabs */}
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('signin')}
                                    className={`flex-1 py-4 font-semibold text-sm transition-all ${activeTab === 'signin'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setActiveTab('signup')}
                                    className={`flex-1 py-4 font-semibold text-sm transition-all ${activeTab === 'signup'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Forms */}
                            <div className="p-8">
                                {activeTab === 'signin' ? (
                                    <SignIn onSuccess={handleSignInSuccess} />
                                ) : (
                                    <SignUp onSuccess={handleSignUpSuccess} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-8">
                            <OTPVerify
                                email={email}
                                onSuccess={handleOTPSuccess}
                                onBack={() => setShowOTP(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;