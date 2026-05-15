// Render inline **bold** and bullet lines
const renderSuggestion = (text) => {
    if (!text) return <span>Loading your personalized suggestion...</span>;

    const lines = text.split('\n').filter(l => l.trim());

    const renderBold = (str) => {
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
                ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                : <span key={i}>{p}</span>
        );
    };

    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (/^[-•]\s/.test(trimmed)) {
                    return (
                        <div key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-green-200 flex-shrink-0" />
                            <span className="text-green-50 text-sm leading-relaxed">
                                {renderBold(trimmed.replace(/^[-•]\s+/, ''))}
                            </span>
                        </div>
                    );
                }
                return (
                    <p key={i} className="text-green-50 text-sm leading-relaxed">
                        {renderBold(trimmed)}
                    </p>
                );
            })}
        </div>
    );
};

const AISuggestionCard = ({ suggestion, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
                {/* AI Icon */}
                <div className="bg-white bg-opacity-20 rounded-xl p-3 flex-shrink-0">
                    <span className="text-2xl">🥗</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-white">AI Suggestion of the Day</h3>
                        <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full">
                            Personalized
                        </span>
                    </div>
                    {renderSuggestion(suggestion)}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white border-opacity-20 mt-4 pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-white text-opacity-70 text-xs">
                        💡 This suggestion is based on your profile and today's diet
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AISuggestionCard;