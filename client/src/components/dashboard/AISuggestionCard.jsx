// Render inline **bold** and bullet lines
const renderSuggestion = (text) => {
    if (!text) return <span>Loading your personalized suggestion...</span>;

    const lines = text.split('\n').filter(l => l.trim());

    const renderBold = (str) => {
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
                ? <strong key={i} className="font-semibold text-gray-800">{p.slice(2, -2)}</strong>
                : <span key={i}>{p}</span>
        );
    };

    return (
        <div className="space-y-1.5 animate-fade-in">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (/^[-•]\s/.test(trimmed)) {
                    return (
                        <div key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                            <span className="text-gray-600 text-sm leading-relaxed">
                                {renderBold(trimmed.replace(/^[-•]\s+/, ''))}
                            </span>
                        </div>
                    );
                }
                return (
                    <p key={i} className="text-gray-600 text-sm leading-relaxed">
                        {renderBold(trimmed)}
                    </p>
                );
            })}
        </div>
    );
};

const ShimmerLoader = () => (
    <div className="space-y-3">
        {[100, 75, 88].map((w, i) => (
            <div
                key={i}
                className="h-3 rounded-full animate-shimmer"
                style={{ width: `${w}%` }}
            />
        ))}
    </div>
);

const AISuggestionCard = ({ suggestion, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500 border border-gray-100">
                <div className="flex items-start gap-4">
                    <div className="bg-green-50 rounded-xl p-3 flex-shrink-0">
                        <span className="text-2xl">🥗</span>
                    </div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                        <ShimmerLoader />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-green-500 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
                {/* AI Icon */}
                <div className="bg-green-50 rounded-xl p-3 flex-shrink-0 animate-pulse-green">
                    <span className="text-2xl">🥗</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-gray-800">AI Suggestion of the Day</h3>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Personalized
                        </span>
                    </div>
                    {renderSuggestion(suggestion)}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mt-4 pt-3">
                <span className="text-gray-400 text-xs">
                    💡 This suggestion is based on your profile and today's diet
                </span>
            </div>
        </div>
    );
};

export default AISuggestionCard;