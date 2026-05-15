import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MealTrackerPage from './pages/MealTrackerPage';
import ProgressPage from './pages/ProgressPage';
import DeficiencyPage from './pages/DeficiencyPage';
import ProfilePage from './pages/ProfilePage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/auth"
                    element={
                        user ? <Navigate to="/dashboard" replace /> : <AuthPage />
                    }
                />

                {/* Onboarding - verified but not onboarded */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            {!user?.onboarding_complete ? (
                                <Navigate to="/onboarding" replace />
                            ) : (
                                <DashboardPage />
                            )}
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
        </Router>
    );
};

export default App;