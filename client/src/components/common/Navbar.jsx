import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { streakApi } from '../../api/streakApi';
import { notificationApi } from '../../api/notificationApi';

// ── Notification Dropdown ─────────────────────────────────────────────────────
const NotificationDropdown = ({ onClose, mobile = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await notificationApi.getNotifications();
                if (res.success) setNotifications(res.notifications);
            } catch (err) {
                console.error('Notif fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifs();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'streak': return '🔥';
            case 'goal':   return '🎯';
            case 'badge':  return '🏆';
            case 'water':  return '💧';
            default:       return '🔔';
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationApi.deleteAll();
            setNotifications([]);
        } catch (err) {
            console.error('Clear error:', err);
        }
    };

    return (
        <div className={mobile ? "w-full bg-white/95 rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-down" : "absolute right-0 top-[calc(100%+12px)] w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down"}>
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white/50">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {notifications.some(n => !n.is_read) && (
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New alerts</span>
                )}
            </div>

            <div className="max-h-[350px] overflow-y-auto">
                {loading ? (
                    <div className="p-5 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-3xl mb-2">🔔</p>
                        <p className="text-gray-400 text-sm">No notifications yet!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 flex gap-3 transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <span className="text-2xl shrink-0">{getIcon(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug ${!notif.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {notifications.length > 0 && (
                <div className="p-3 bg-gray-50/50 text-center border-t border-gray-50">
                    <button onClick={handleClearAll} className="text-xs font-semibold text-green-600 hover:text-green-700">
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Streak Dropdown Panel ─────────────────────────────────────────────────────
const StreakDropdown = ({ onClose, mobile = false }) => {
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

    const streak     = streakData?.current_streak || 0;
    const longest    = streakData?.longest_streak || 0;
    const badge      = streakData?.badge;
    const loggedToday = streakData?.logged_today;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = i === 6;
        const daysAgo = 6 - i;
        const isFilled = daysAgo < streak || (isToday && loggedToday);
        return { dayName, isFilled, isToday };
    });

    const getNextBadgeHint = () => {
        if (streak < 3)  return { icon: '🔥', label: 'On Fire',  days: 3  - streak };
        if (streak < 7)  return { icon: '🥉', label: 'Bronze',   days: 7  - streak };
        if (streak < 14) return { icon: '🥈', label: 'Silver',   days: 14 - streak };
        if (streak < 30) return { icon: '🥇', label: 'Gold',     days: 30 - streak };
        if (streak < 90) return { icon: '🏆', label: 'Champion', days: 90 - streak };
        return null;
    };
    const nextBadge = getNextBadgeHint();

    return (
        <div className={mobile ? "w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-down" : "absolute right-0 top-[calc(100%+12px)] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down"}>
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🔥</span>
                        <div>
                            <p className="text-white text-xs font-medium opacity-90">Current Streak</p>
                            <p className="text-white text-3xl font-black leading-none">{streak} <span className="text-base font-semibold opacity-80">days</span></p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-center">
                        <p className="text-white text-lg leading-none">{badge?.icon}</p>
                        <p className="text-white text-[10px] font-bold">{badge?.name}</p>
                    </div>
                </div>
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
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">This Week</p>
                    <div className="flex justify-between mb-5">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    day.isFilled
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                        : day.isToday
                                        ? 'border-2 border-dashed border-orange-300 text-orange-300'
                                        : 'bg-gray-100 text-gray-300'
                                }`}>
                                    {day.isFilled ? '🔥' : '·'}
                                </div>
                                <span className={`text-[10px] font-medium ${day.isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {day.dayName}
                                </span>
                            </div>
                        ))}
                    </div>

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
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, signOut } = useAuth();
    const [menuOpen,        setMenuOpen]        = useState(false);
    const [streakOpen,      setStreakOpen]       = useState(false);
    const [notifOpen,       setNotifOpen]        = useState(false);
    const [mobileStreak,    setMobileStreak]     = useState(false);
    const [mobileNotif,     setMobileNotif]      = useState(false);
    const [currentStreak,   setCurrentStreak]    = useState(0);
    const [unreadNotifs,    setUnreadNotifs]     = useState(0);
    const streakRef     = useRef(null);
    const notifRef      = useRef(null);
    const mStreakRef    = useRef(null);
    const mNotifRef     = useRef(null);

    useEffect(() => {
        if (!user) return;
        streakApi.getStreak()
            .then(res => { if (res.success) setCurrentStreak(res.data.current_streak); })
            .catch(() => {});
        fetchUnreadCount();
    }, [user]);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationApi.getNotifications();
            if (res.success) setUnreadNotifs(res.notifications.filter(n => !n.is_read).length);
        } catch (e) {}
    };

    const handleNotifToggle = async () => {
        if (!notifOpen && unreadNotifs > 0) {
            try { await notificationApi.markRead(); setUnreadNotifs(0); } catch (e) {}
        }
        setNotifOpen(!notifOpen);
        setStreakOpen(false);
    };

    const handleStreakToggle = () => {
        setStreakOpen(!streakOpen);
        setNotifOpen(false);
    };

    useEffect(() => {
        const handler = (e) => {
            if (streakRef.current  && !streakRef.current.contains(e.target))  setStreakOpen(false);
            if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
            if (mStreakRef.current && !mStreakRef.current.contains(e.target)) setMobileStreak(false);
            if (mNotifRef.current  && !mNotifRef.current.contains(e.target))  setMobileNotif(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMobileNotifToggle = async () => {
        if (!mobileNotif && unreadNotifs > 0) {
            try { await notificationApi.markRead(); setUnreadNotifs(0); } catch (e) {}
        }
        setMobileNotif(!mobileNotif);
        setMobileStreak(false);
    };

    const handleSignOut = () => { signOut(); navigate('/'); };

    const navLinks = [
        { to: '/',            label: 'Home'            },
        { to: '/dashboard',   label: 'Dashboard',   auth: true },
        { to: '/meal-tracker',label: 'Meal Tracker', auth: true },
        { to: '/deficiency',  label: 'Deficiency Check', auth: true },
    ];

    const isActive = (to) => location.pathname === to;

    return (
        <>
            <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-2xl transition-transform group-hover:scale-110">🥗</span>
                            <span className="text-xl font-bold text-green-600">DietDost</span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(({ to, label, auth }) => {
                                if (auth && !user) return null;
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`nav-link-underline text-sm font-medium transition-colors pb-0.5 ${
                                            isActive(to)
                                                ? 'text-green-600 after:w-full'
                                                : 'text-gray-600 hover:text-green-600'
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth + Icons */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">

                                    {/* 🔥 Streak Badge */}
                                    <div className="relative" ref={streakRef}>
                                        <button
                                            onClick={handleStreakToggle}
                                            className={`flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-full px-3 py-1.5 transition-all ${
                                                currentStreak > 0 ? 'animate-pulse-green' : ''
                                            }`}
                                            style={currentStreak > 0 ? { animation: 'pulseGreen 2.5s ease-in-out infinite' } : {}}
                                        >
                                            <span className={`text-lg ${currentStreak >= 3 ? 'animate-streak-pop' : ''}`}>🔥</span>
                                            <span className="text-sm font-bold text-orange-600">{currentStreak}</span>
                                        </button>
                                        {streakOpen && <StreakDropdown onClose={() => setStreakOpen(false)} />}
                                    </div>

                                    {/* 🔔 Notification Bell */}
                                    <div className="relative" ref={notifRef}>
                                        <button
                                            onClick={handleNotifToggle}
                                            className="relative w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                                            {unreadNotifs > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                                    {unreadNotifs}
                                                </span>
                                            )}
                                        </button>
                                        {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                                    </div>

                                    {/* Profile Avatar */}
                                    <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
                                        <div className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center font-bold text-green-600 transition-colors">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium hidden lg:inline">{user.name}</span>
                                    </Link>

                                    <button onClick={handleSignOut} className="text-gray-500 hover:text-red-500 font-medium transition-colors text-sm">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/auth')} className="text-green-600 hover:text-green-700 font-semibold transition-colors">Login</button>
                                    <button onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md">Sign Up</button>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="md:hidden text-gray-600 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span className="text-xl transition-transform duration-200" style={{ display: 'inline-block', transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                {menuOpen ? '✕' : '☰'}
                            </span>
                        </button>
                    </div>

                    {/* Mobile Menu — slide down */}
                    {menuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
                            <div className="flex flex-col gap-4">
                                {navLinks.map(({ to, label, auth }) => {
                                    if (auth && !user) return null;
                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`font-medium transition-colors ${isActive(to) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                                {user ? (
                                    <>
                                        <Link to="/profile" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Profile</Link>

                                        {/* Mobile Streak — clickable card */}
                                        <div className="relative" ref={mStreakRef}>
                                            <button
                                                onClick={() => { setMobileStreak(!mobileStreak); setMobileNotif(false); }}
                                                className="flex items-center gap-2.5 w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-left"
                                            >
                                                <span className="text-xl">🔥</span>
                                                <div>
                                                    <p className="text-orange-600 font-bold text-sm">{currentStreak} day streak</p>
                                                    <p className="text-orange-400 text-xs">Tap to see details</p>
                                                </div>
                                                <span className="ml-auto text-orange-400 text-xs">{mobileStreak ? '▲' : '▼'}</span>
                                            </button>
                                            {mobileStreak && (
                                                <div className="mt-2 relative">
                                                    <StreakDropdown mobile={true} onClose={() => setMobileStreak(false)} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile Notifications */}
                                        <div className="relative" ref={mNotifRef}>
                                            <button
                                                onClick={handleMobileNotifToggle}
                                                className="flex items-center gap-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-left"
                                            >
                                                <span className="text-xl">🔔</span>
                                                <div>
                                                    <p className="text-gray-700 font-semibold text-sm">Notifications</p>
                                                    <p className="text-gray-400 text-xs">
                                                        {unreadNotifs > 0 ? `${unreadNotifs} unread` : 'All caught up'}
                                                    </p>
                                                </div>
                                                {unreadNotifs > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                        {unreadNotifs}
                                                    </span>
                                                )}
                                                <span className="text-gray-400 text-xs">{mobileNotif ? '▲' : '▼'}</span>
                                            </button>
                                            {mobileNotif && (
                                                <div className="mt-2 relative">
                                                    <NotificationDropdown mobile={true} onClose={() => setMobileNotif(false)} />
                                                </div>
                                            )}
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