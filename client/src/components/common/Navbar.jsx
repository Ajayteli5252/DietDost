import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    return (
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
                        <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                            Home
                        </Link>
                        {user && (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/meal-tracker" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                                    Meal Tracker
                                </Link>
                                <Link to="/deficiency" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                                    Deficiency Check
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-green-600">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-500 hover:text-red-500 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold transition-all"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col gap-4">
                            <Link to="/" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>
                                Home
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link to="/meal-tracker" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>
                                        Meal Tracker
                                    </Link>
                                    <Link to="/deficiency" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>
                                        Deficiency Check
                                    </Link>
                                    <Link to="/profile" className="text-gray-600 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    <button onClick={handleSignOut} className="text-red-500 font-medium text-left">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { navigate('/auth'); setMenuOpen(false); }} className="text-green-600 font-semibold text-left">
                                        Login
                                    </button>
                                    <button onClick={() => { navigate('/auth'); setMenuOpen(false); }} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold text-left">
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;