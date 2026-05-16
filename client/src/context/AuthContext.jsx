import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'https://dietdost.onrender.com/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('dietdost_token'));

    // App start hote hi user check karo
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await apiClient.get('auth/me');
                setUser(res.data.user);
            } catch (error) {
                // Token invalid hai
                localStorage.removeItem('dietdost_token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    // Sign Up
    const signUp = async (userData) => {
        const res = await apiClient.post('auth/signup', userData);
        return res.data;
    };

    // Verify OTP
    const verifyOTP = async (email, otp) => {
        const res = await apiClient.post('auth/verify-otp', { email, otp });

        if (res.data.success) {
            const { token, user } = res.data;
            localStorage.setItem('dietdost_token', token);
            setToken(token);
            setUser(user);
        }

        return res.data;
    };

    // Resend OTP
    const resendOTP = async (email) => {
        const res = await apiClient.post('auth/resend-otp', { email });
        return res.data;
    };

    // Sign In
    const signIn = async (email, password) => {
        const res = await apiClient.post('auth/signin', { email, password });

        if (res.data.success) {
            const { token, user } = res.data;
            localStorage.setItem('dietdost_token', token);
            setToken(token);
            setUser(user);
        }

        return res.data;
    };

    // Sign Out
    const signOut = () => {
        localStorage.removeItem('dietdost_token');
        setToken(null);
        setUser(null);
    };

    // Onboarding complete update karo
    const completeOnboarding = () => {
        setUser((prev) => ({ ...prev, onboarding_complete: true }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                token,
                signUp,
                verifyOTP,
                resendOTP,
                signIn,
                signOut,
                completeOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);