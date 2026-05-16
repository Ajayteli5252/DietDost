import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCalorie } from '../hooks/useCalorie';
import { aiApi } from '../api/aiApi';
import Navbar from '../components/common/Navbar';
import CalorieCard from '../components/dashboard/CalorieCard';
import MacrosCard from '../components/dashboard/MacrosCard';
import MealLogCard from '../components/dashboard/MealLogCard';
import WaterIntakeCard from '../components/dashboard/WaterIntakeCard';
import DeficiencyAlert from '../components/dashboard/DeficiencyAlert';
import AISuggestionCard from '../components/dashboard/AISuggestionCard';
import ChatBot from '../components/common/ChatBot';

/* ── SVG Icons ─────────────────────────────────────────── */
const MealIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
);
const ProgressIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
);
const DeficiencyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9"  x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const quickActions = [
    { icon: <MealIcon />,       label: 'Meal Log',   path: '/meal-tracker', color: 'text-green-600',  hoverBg: 'hover:bg-green-50',  hoverBorder: 'hover:border-green-300'  },
    { icon: <ProgressIcon />,   label: 'Progress',   path: '/progress',     color: 'text-blue-600',   hoverBg: 'hover:bg-blue-50',   hoverBorder: 'hover:border-blue-300'   },
    { icon: <DeficiencyIcon />, label: 'Deficiency', path: '/deficiency',   color: 'text-orange-500', hoverBg: 'hover:bg-orange-50', hoverBorder: 'hover:border-orange-300' },
    { icon: <ProfileIcon />,    label: 'Profile',    path: '/profile',      color: 'text-purple-600', hoverBg: 'hover:bg-purple-50', hoverBorder: 'hover:border-purple-300' },
];

/* ── Ripple Button ─────────────────────────────────────── */
const RippleButton = ({ onClick, children, className }) => {
    const btnRef = useRef(null);

    const handleClick = (e) => {
        const btn = btnRef.current;
        const circle = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        circle.className = 'ripple-circle';
        circle.style.top  = `${e.clientY - rect.top}px`;
        circle.style.left = `${e.clientX - rect.left}px`;
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
        onClick && onClick();
    };

    return (
        <button ref={btnRef} onClick={handleClick} className={`ripple-btn ${className}`}>
            {children}
        </button>
    );
};

/* ── Dashboard Page ────────────────────────────────────── */
const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { todayMeals, totals, targets, loading, deleteMeal } = useCalorie();
    const [suggestion, setSuggestion] = useState('');
    const [suggestionLoading, setSuggestionLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestion = async () => {
            try {
                const res = await aiApi.getDailySuggestion();
                if (res.success) setSuggestion(res.suggestion);
            } catch (error) {
                console.error('Suggestion error:', error);
            } finally {
                setSuggestionLoading(false);
            }
        };
        fetchSuggestion();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">

                {/* Header — fade in from top */}
                <div className="mb-8 animate-fade-in-down">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                {/* Main Grid — staggered fade-in-up per card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="md:col-span-2 lg:col-span-1 animate-fade-in-up delay-100 card-hover">
                        <CalorieCard
                            consumed={totals.calories}
                            target={targets?.daily_calorie_target || 0}
                            loading={loading}
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-2 animate-fade-in-up delay-200 card-hover">
                        <MacrosCard
                            totals={totals}
                            targets={targets}
                            loading={loading}
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 animate-fade-in-up delay-300">
                        <AISuggestionCard
                            suggestion={suggestion}
                            loading={suggestionLoading}
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-2 animate-fade-in-up delay-400 card-hover">
                        <MealLogCard
                            meals={todayMeals}
                            loading={loading}
                            onDelete={deleteMeal}
                            onAddMeal={() => navigate('/meal-tracker')}
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 animate-fade-in-up delay-500 card-hover">
                        <WaterIntakeCard />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 animate-fade-in-up delay-600">
                        <DeficiencyAlert />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {quickActions.map((action, i) => (
                        <RippleButton
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`bg-white ${action.hoverBg} border border-gray-200 ${action.hoverBorder} rounded-2xl p-4 text-center transition-all hover:shadow-md animate-fade-in-up card-hover`}
                            style={{ animationDelay: `${500 + i * 80}ms` }}
                        >
                            <div className={`flex justify-center mb-2 ${action.color}`}>
                                {action.icon}
                            </div>
                            <p className="text-sm font-medium text-gray-700">{action.label}</p>
                        </RippleButton>
                    ))}
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 md:hidden z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
                <div className="flex justify-around items-center">
                    {[
                        { icon: '🏠', label: 'Home',     path: '/dashboard' },
                        { icon: '🍽️', label: 'Meals',    path: '/meal-tracker' },
                        { icon: '📊', label: 'Progress', path: '/progress' },
                        { icon: '👤', label: 'Profile',  path: '/profile' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-90 active:bg-green-50"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <ChatBot />
        </div>
    );
};

export default DashboardPage;