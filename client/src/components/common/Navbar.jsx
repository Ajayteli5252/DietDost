import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { streakApi } from '../../api/streakApi';

// ── Streak Dropdown Panel ─────────────────────────────────────────────────────
const StreakDropdown = ({ onClose }) => {
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const res = await streakApi.getStreak();
                if (res.success) setStreakData(res.data);
            } catch (err) {
                console.error('Streak fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStreak();
    }, []);

    const streak = streakData?.current_streak || 0;
    const longest = streakData?.longest_streak || 0;
    const badge = streakData?.badge;
    const loggedToday = streakData?.logged_today;

    // Last 7 days dots
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = i === 6;
        const daysAgo = 6 - i;
        const isFilled = daysAgo < streak || (isToday && loggedToday);
        return { dayName, isFilled, isToday };
    });

    // Next badge hint
    const getNextBadgeHint = () => {
        if (streak < 3)  return { icon: '🔥', label: 'On Fire',   days: 3  - streak };
        if (streak < 7)  return { icon: '🥉', label: 'Bronze',    days: 7  - streak };
        if (streak < 14) return { icon: '🥈', label: 'Silver',    days: 14 - streak };
        if (streak < 30) return { icon: '🥇', label: 'Gold',      days: 30 - streak };
        if (streak < 90) return { icon: '🏆', label: 'Champion',  days: 90 - streak };
        return null;
    };
    const nextBadge = getNextBadgeHint();

    return (
        <div
            className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            style={{ animation: 'dropdownFadeIn 0.2s ease' }}
        >
            {/* Orange gradient header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🔥</span>
                        <div>
                            <p className="text-white text-xs font-medium opacity-90">Current Streak</p>
                            <p className="text-white text-3xl font-black leading-none">{streak} <span className="text-base font-semibold opacity-80">days</span></p>
                        </div>
                    </div>
                    {/* Badge pill */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-center">
                        <p className="text-white text-lg leading-none">{badge?.icon}</p>
                        <p className="text-white text-[10px] font-bold">{badge?.name}</p>
                    </div>
                </div>

                {/* Best streak */}
                <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-white text-xs opacity-80">🏅 Best Streak</span>
                    <span className="text-white text-sm font-bold">{longest} days</span>
                </div>
            </div>

            {loading ? (
                <div className="p-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                    <div className="h-8 bg-gray-100 rounded-xl"></div>
                </div>
            ) : (
                <div className="p-5">
                    {/* 7-day dots */}
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">This Week</p>
                    <div className="flex justify-between mb-5">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        day.isFilled
                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                            : day.isToday
                                            ? 'border-2 border-dashed border-orange-300 text-orange-300'
                                            : 'bg-gray-100 text-gray-300'
                                    }`}
                                >
                                    {day.isFilled ? '🔥' : '·'}
                                </div>
                                <span className={`text-[10px] font-medium ${day.isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {day.dayName}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Today's status */}
                    {loggedToday ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3 mb-4">
                            <span className="text-xl">✅</span>
                            <div>
                                <p className="text-sm font-semibold text-green-700">Logged today!</p>
                                <p className="text-xs text-green-500">Come back tomorrow to continue!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3 mb-4">
                            <span className="text-xl">⏰</span>
                            <div>
                                <p className="text-sm font-semibold text-orange-700">Log today's meal!</p>
                                <p className="text-xs text-orange-400">Don't break your streak!</p>
                            </div>
                        </div>
                    )}

                    {/* Next badge progress */}
                    {nextBadge && (
                        <div className="text-center py-2 border-t border-gray-50">
                            <p className="text-xs text-gray-400">
                                {nextBadge.icon} <strong>{nextBadge.days}</strong> more days to unlock <strong>{nextBadge.label}</strong> badge!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [streakOpen, setStreakOpen] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);
    const dropdownRef = useRef(null);

    // Fetch streak count for the fire badge number
    useEffect(() => {
        if (!user) return;
        streakApi.getStreak()
            .then(res => { if (res.success) setCurrentStreak(res.data.current_streak); })
            .catch(() => {});
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setStreakOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    return (
        <>
            {/* Dropdown animation style */}
            <style>{`
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">🥗</span>
                            <span className="text-xl font-bold text-green-600">DietDost</span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</Link>
                            {user && (
                                <>
                                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Dashboard</Link>
                                    <Link to="/meal-tracker" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Meal Tracker</Link>
                                    <Link to="/deficiency" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Deficiency Check</Link>
                                </>
                            )}
                        </div>

                        {/* Auth + Streak */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">

                                    {/* 🔥 Streak Fire Badge */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setStreakOpen(prev => !prev)}
                                            className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-full px-3 py-1.5 transition-all group"
                                        >
                                            <span className={`text-lg ${currentStreak >= 3 ? 'animate-bounce' : ''}`}>🔥</span>
                                            <span className="text-sm font-bold text-orange-600">{currentStreak}</span>
                                        </button>

                                        {/* Dropdown */}
                                        {streakOpen && <StreakDropdown onClose={() => setStreakOpen(false)} />}
                                    </div>

                                    {/* Profile */}
                                    <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-green-600">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{user.name}</span>
                                    </Link>

                                    <button onClick={handleSignOut} className="text-gray-500 hover:text-red-500 font-medium transition-colors">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/auth')} className="text-green-600 hover:text-green-700 font-semibold transition-colors">Login</button>
                                    <button onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold transition-all">Sign Up</button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100">
                            <div className="flex flex-col gap-4">
                                <Link to="/" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
                                {user ? (
                                    <>
                                        <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                        <Link to="/meal-tracker" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Meal Tracker</Link>
                                        <Link to="/deficiency" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Deficiency Check</Link>
                                        <Link to="/profile" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Profile</Link>
                                        {/* Mobile streak */}
                                        <div className="flex items-center gap-2 text-orange-500 font-semibold">
                                            <span>🔥</span><span>{currentStreak} day streak</span>
                                        </div>
                                        <button onClick={handleSignOut} className="text-red-500 font-medium text-left">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { navigate('/auth'); setMenuOpen(false); }} className="text-green-600 font-semibold text-left">Login</button>
                                        <button onClick={() => { navigate('/auth'); setMenuOpen(false); }} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold text-left">Sign Up</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;