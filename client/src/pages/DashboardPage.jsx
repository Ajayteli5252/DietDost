import { useState, useEffect } from 'react';
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

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { todayMeals, totals, targets, loading, deleteMeal } = useCalorie();
    const [suggestion, setSuggestion] = useState('');
    const [suggestionLoading, setSuggestionLoading] = useState(true);

    // AI suggestion fetch karo
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

    // Greeting
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
                {/* Header */}
                <div className="mb-8">
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

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Calorie Card - Full width on mobile */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <CalorieCard
                            consumed={totals.calories}
                            target={targets?.daily_calorie_target || 0}
                            loading={loading}
                        />
                    </div>

                    {/* Macros Card */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <MacrosCard
                            totals={totals}
                            targets={targets}
                            loading={loading}
                        />
                    </div>

                    {/* AI Suggestion */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <AISuggestionCard
                            suggestion={suggestion}
                            loading={suggestionLoading}
                        />
                    </div>

                    {/* Meal Log */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <MealLogCard
                            meals={todayMeals}
                            loading={loading}
                            onDelete={deleteMeal}
                            onAddMeal={() => navigate('/meal-tracker')}
                        />
                    </div>

                    {/* Water Intake */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <WaterIntakeCard />
                    </div>

                    {/* Deficiency Alert */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <DeficiencyAlert />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {[
                        { icon: '🍽️', label: 'Meal Log', path: '/meal-tracker' },
                        { icon: '📊', label: 'Progress', path: '/progress' },
                        { icon: '⚠️', label: 'Deficiency', path: '/deficiency' },
                        { icon: '👤', label: 'Profile', path: '/profile' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-2xl p-4 text-center transition-all hover:shadow-md"
                        >
                            <div className="text-3xl mb-2">{action.icon}</div>
                            <p className="text-sm font-medium text-gray-700">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 md:hidden">
                <div className="flex justify-around">
                    {[
                        { icon: '🏠', label: 'Home', path: '/dashboard' },
                        { icon: '🍽️', label: 'Meals', path: '/meal-tracker' },
                        { icon: '📊', label: 'Progress', path: '/progress' },
                        { icon: '👤', label: 'Profile', path: '/profile' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs text-gray-500">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <ChatBot />
        </div>
    );
};

export default DashboardPage;