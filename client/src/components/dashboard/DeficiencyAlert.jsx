import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';

// Strip **bold** markdown and render as bold text
const renderBold = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
            ? <strong key={i}>{p.slice(2, -2)}</strong>
            : <span key={i}>{p}</span>
    );
};

const DeficiencyAlert = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeficiency = async () => {
            try {
                const res = await aiApi.checkDeficiency();
                if (res.success) setData(res.data);
            } catch (error) {
                console.error('Deficiency error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeficiency();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    if (!data || data.deficiencies.length === 0) {
        return (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <div>
                        <h3 className="font-bold text-green-700">
                            No Deficiencies Found!
                        </h3>
                        <p className="text-green-600 text-sm mt-1">
                            Your diet seems well-balanced. Keep up the good work! 🎉
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const severityConfig = {
        low: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            badge: 'bg-yellow-100 text-yellow-700',
            icon: '⚠️',
            title: 'text-yellow-700',
        },
        medium: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            badge: 'bg-orange-100 text-orange-700',
            icon: '🔶',
            title: 'text-orange-700',
        },
        high: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            badge: 'bg-red-100 text-red-700',
            icon: '🔴',
            title: 'text-red-700',
        },
    };

    const config = severityConfig[data.severity] || severityConfig.low;

    return (
        <div className={`${config.bg} rounded-2xl p-6 border ${config.border}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className={`font-bold text-lg ${config.title}`}>
                        Deficiency Alert
                    </h3>
                </div>
                <span className={`${config.badge} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                    {data.severity} severity
                </span>
            </div>

            {/* Deficiencies */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                    Potential deficiencies detected:
                </p>
                <div className="flex flex-wrap gap-2">
                    {data.deficiencies.map((def, index) => (
                        <span
                            key={index}
                            className={`${config.badge} px-3 py-1 rounded-full text-sm font-medium`}
                        >
                            {def}
                        </span>
                    ))}
                </div>
            </div>

            {/* Foods to Add */}
            {data.foods_to_add?.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        Consider adding these to your diet:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {data.foods_to_add.map((food, index) => (
                            <span
                                key={index}
                                className="bg-white text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-sm"
                            >
                                🥗 {renderBold(food)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {data.suggestions?.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        AI Suggestions:
                    </p>
                    <ul className="space-y-1">
                        {data.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-600 flex gap-2">
                                <span>•</span>
                                <span>{renderBold(suggestion)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* CTA */}
            <button
                onClick={() => navigate('/deficiency')}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold transition-all mt-2"
            >
                View Detailed Report →
            </button>
        </div>
    );
};

export default DeficiencyAlert;