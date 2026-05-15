import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('dietdost_token'));

    // Axios default header set karo
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // App start hote hi user check karo
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/auth/me`);
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
        const res = await axios.post(`${API_URL}/auth/signup`, userData);
        return res.data;
    };

    // Verify OTP
    const verifyOTP = async (email, otp) => {
        const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });

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
        const res = await axios.post(`${API_URL}/auth/resend-otp`, { email });
        return res.data;
    };

    // Sign In
    const signIn = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/signin`, { email, password });

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
        delete axios.defaults.headers.common['Authorization'];
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