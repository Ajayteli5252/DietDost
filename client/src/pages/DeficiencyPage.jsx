import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { aiApi } from '../api/aiApi';

const DeficiencyPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState(null);

    const fetchDeficiency = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await aiApi.checkDeficiency();
            console.log('Deficiency res:', res);
            if (res && res.success && res.data) {
                setData(res.data);
            } else {
                setError(res?.message || 'AI analysis failed. Please try again.');
            }
        } catch (error) {
            console.error('Deficiency fetch error:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to connect to server.';
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDeficiency();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDeficiency();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">⚠️ Deficiency Check</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                        {refreshing ? 'Checking...' : '🔄 Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-8 border border-red-100 text-center shadow-sm">
                        <p className="text-5xl mb-4">❌</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button 
                            onClick={fetchDeficiency}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !data ? (
                    <div className="text-center py-12">
                        <p className="text-5xl mb-3">📊</p>
                        <p className="text-gray-500">No analysis data available.</p>
                    </div>
                ) : data.deficiencies.length === 0 ? (
                    <div className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center">
                        <p className="text-6xl mb-4">✅</p>
                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            No Deficiencies Found!
                        </h2>
                        <p className="text-green-600">
                            Your diet is well-balanced. Keep it up! 🎉
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Severity Badge */}
                        <div className={`rounded-2xl p-6 border ${data.severity === 'high'
                                ? 'bg-red-50 border-red-200'
                                : data.severity === 'medium'
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">
                                    {data.severity === 'high' ? '🔴' : data.severity === 'medium' ? '🟠' : '🟡'}
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Deficiency Level: {data.severity?.toUpperCase()}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        Based on your last 7 days of diet
                                    </p>
                                </div>
                            </div>

                            {/* Deficiencies */}
                            <div className="flex flex-wrap gap-2">
                                {data.deficiencies.map((def, index) => (
                                    <span
                                        key={index}
                                        className={`px-4 py-2 rounded-full font-semibold text-sm ${data.severity === 'high'
                                                ? 'bg-red-100 text-red-700'
                                                : data.severity === 'medium'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {def}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Foods to Add */}
                        {data.foods_to_add?.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">
                                    🥗 Foods to Add to Your Diet
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {data.foods_to_add.map((food, index) => (
                                        <div
                                            key={index}
                                            className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"
                                        >
                                            <p className="text-sm font-medium text-green-700">{food}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {data.suggestions?.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">
                                    💡 AI Suggestions
                                </h3>
                                <div className="space-y-3">
                                    {data.suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                                        >
                                            <span className="text-green-600 font-bold">{index + 1}.</span>
                                            <p className="text-sm text-gray-700">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                            <p className="text-sm text-blue-700">
                                ℹ️ This analysis is based on your logged diet for the last 7 days.
                                Log your meals regularly for more accurate results!
                            </p>
                        </div>
                    </div>
                )}
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
        </div>
    );
};

export default DeficiencyPage;