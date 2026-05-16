import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LandingPage     from './pages/LandingPage';
import AuthPage        from './pages/AuthPage';
import OnboardingPage  from './pages/OnboardingPage';
import DashboardPage   from './pages/DashboardPage';
import MealTrackerPage from './pages/MealTrackerPage';
import ProgressPage    from './pages/ProgressPage';
import DeficiencyPage  from './pages/DeficiencyPage';
import ProfilePage     from './pages/ProfilePage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader         from './components/common/Loader';

/* ── Page Transition Wrapper ─────────────────────────────────── */
const AnimatedRoutes = ({ user }) => {
    const location = useLocation();

    return (
        <div
            key={location.pathname}
            className="animate-fade-in"
            style={{ animationDuration: '300ms' }}
        >
            <Routes location={location}>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/auth"
                    element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
                />

                {/* Onboarding */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }
                />

                {/* Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            {!user?.onboarding_complete
                                ? <Navigate to="/onboarding" replace />
                                : <DashboardPage />
                            }
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meal-tracker"
                    element={
                        <ProtectedRoute>
                            <MealTrackerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/progress"
                    element={
                        <ProtectedRoute>
                            <ProgressPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/deficiency"
                    element={
                        <ProtectedRoute>
                            <DeficiencyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

/* ── App ─────────────────────────────────────────────────────── */
const App = () => {
    const { user, loading } = useAuth();
    if (loading) return <Loader />;

    return (
        <Router>
            <AnimatedRoutes user={user} />
        </Router>
    );
};

export default App;