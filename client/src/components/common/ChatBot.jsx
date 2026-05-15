import { useState, useEffect, useRef } from 'react';
import { aiApi } from '../../api/aiApi';

/* ─── DietDost Logo Icon (header & avatars) ───────────────────────────── */
const DietDostIcon = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <path
            d="M6 26 C6 26 8 14 18 10 C28 6 28 6 28 6 C28 6 26 16 16 20 C10 22.5 6 26 6 26Z"
            fill="#16a34a"
        />
        <path
            d="M6 26 L17 13"
            stroke="#dcfce7"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        {/* Sparkle top-right */}
        <path d="M24 4 L24.8 6.2 L27 7 L24.8 7.8 L24 10 L23.2 7.8 L21 7 L23.2 6.2Z" fill="#4ade80" />
        {/* Sparkle small */}
        <path d="M27 12 L27.5 13.3 L29 14 L27.5 14.7 L27 16 L26.5 14.7 L25 14 L26.5 13.3Z" fill="#86efac" />
    </svg>
);

/* ─── Minimal SendIcon ─────────────────────────────────────────────────── */
const SendIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ─── Quick chip pills ─────────────────────────────────────────────────── */
const QUICK_QS = [
    { icon: '🥗', text: 'What should I eat today?' },
    { icon: '💪', text: 'Best foods for protein?' },
    { icon: '🔥', text: 'Weight loss tips?' },
    { icon: '📸', text: 'Analyze my food photo' },
];

/* ─── Full Markdown Renderer ───────────────────────────────────────────── */
const FormattedText = ({ text }) => {
    // Split into lines and process
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    const renderInline = (str) => {
        // Handle **bold** inline
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((p, idx) =>
            p.startsWith('**') && p.endsWith('**')
                ? <strong key={idx} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
                : <span key={idx}>{p}</span>
        );
    };

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            // Empty line = spacing
            elements.push(<div key={i} className="h-1.5" />);
        } else if (/^###\s/.test(trimmed)) {
            // ### Header
            elements.push(
                <p key={i} className="font-bold text-green-700 text-[13px] mt-2 mb-0.5 flex items-center gap-1">
                    {renderInline(trimmed.replace(/^###\s+/, ''))}
                </p>
            );
        } else if (/^##\s/.test(trimmed)) {
            // ## Header
            elements.push(
                <p key={i} className="font-bold text-green-800 text-[14px] mt-2.5 mb-1">
                    {renderInline(trimmed.replace(/^##\s+/, ''))}
                </p>
            );
        } else if (/^[-•*]\s/.test(trimmed)) {
            // Bullet point
            elements.push(
                <div key={i} className="flex items-start gap-2 my-0.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-[13px] leading-relaxed text-gray-700">
                        {renderInline(trimmed.replace(/^[-•*]\s+/, ''))}
                    </span>
                </div>
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            // Numbered list
            const num = trimmed.match(/^(\d+)\./)?.[1];
            elements.push(
                <div key={i} className="flex items-start gap-2 my-0.5">
                    <span className="mt-0.5 text-[11px] font-bold text-green-600 bg-green-50 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {num}
                    </span>
                    <span className="text-[13px] leading-relaxed text-gray-700">
                        {renderInline(trimmed.replace(/^\d+\.\s+/, ''))}
                    </span>
                </div>
            );
        } else {
            // Regular paragraph line
            elements.push(
                <p key={i} className="text-[13px] leading-relaxed text-gray-700">
                    {renderInline(trimmed)}
                </p>
            );
        }
        i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
};


/* ═══════════════════════════════════════════════════════════════════════ */
const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showBadge, setShowBadge] = useState(true);
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "Hello! I'm **DietDost AI** 🥗 — your personal nutrition coach. Ask me anything about diet, calories, or upload a food photo for instant analysis!",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        const t = setTimeout(() => setShowBadge(false), 8000);
        return () => clearTimeout(t);
    }, []);

    /* ── Image helpers ── */
    const handleImageSelect = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        textareaRef.current?.focus();
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageSelect(file);
    };

    /* ── Send message ── */
    const handleSend = async () => {
        if ((!input.trim() && !imageFile) || loading) return;

        const userMessage = input.trim();
        setInput('');
        setShowBadge(false);

        const newUserMsg = {
            role: 'user',
            text: userMessage || '📸 Food image sent for analysis',
            imagePreview,
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setLoading(true);

        const capturedImage = imageFile;
        removeImage();

        try {
            const history = messages
                .filter((_, i) => i !== 0)
                .map(msg => ({ role: msg.role, text: msg.text }));

            const res = await aiApi.aiChat(userMessage, history, capturedImage);

            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: res.response },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: 'Something went wrong! Please try again. 😅' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickQ = (q) => {
        if (q.text === 'Analyze my food photo') {
            fileInputRef.current?.click();
        } else {
            setInput(q.text);
            textareaRef.current?.focus();
        }
    };

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files[0])}
            />

            {/* ── Floating Button + Badge ── */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

                {/* ── FAB Button ── */}
                {!isOpen ? (
                    <button
                        onClick={() => { setIsOpen(true); setShowBadge(false); }}
                        className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        {/* Icon circle */}
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-base leading-none">🥗</span>
                        </div>

                        {/* Label */}
                        <div className="flex flex-col items-start">
                            <span className="text-white font-semibold text-sm leading-tight">Ask DietDost AI</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                                <span className="text-green-100 text-[10px] font-medium">Online</span>
                            </div>
                        </div>
                    </button>
                ) : (
                    /* Close button when chat is open */
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-11 h-11 rounded-full bg-gray-700 hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Chat Window ── */}
            {isOpen && (
                <div
                    className="fixed bottom-28 right-6 z-[9998] w-[92vw] sm:w-[420px] flex flex-col overflow-hidden"
                    style={{
                        height: 'min(580px, calc(100vh - 130px))',
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(16,185,129,0.08)',
                    }}
                >
                    {/* ── Header ── */}
                    <div
                        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        }}
                    >
                        {/* Logo card */}
                        <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <DietDostIcon size={28} />
                            {/* Online dot */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-green-700 rounded-full animate-pulse" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-base leading-tight">DietDost AI</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                                <p className="text-emerald-100 text-[11px] font-medium tracking-wide uppercase">
                                    Nutrition Expert • Online
                                </p>
                            </div>
                        </div>

                        {/* Clear chat */}
                        <button
                            onClick={() => setMessages([messages[0]])}
                            title="Clear chat"
                            className="text-white/60 hover:text-white transition-colors mr-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Messages ── */}
                    <div
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                        style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        {/* Drag overlay */}
                        {isDragging && (
                            <div className="absolute inset-0 bg-emerald-500/10 border-2 border-dashed border-emerald-400 rounded-3xl z-10 flex items-center justify-center">
                                <p className="text-emerald-600 font-semibold text-lg">Drop image here 📸</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-xl bg-white border border-green-100 flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
                                        <DietDostIcon size={20} />
                                    </div>
                                )}

                                <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Image preview in chat */}
                                    {msg.imagePreview && (
                                        <img
                                            src={msg.imagePreview}
                                            alt="Uploaded food"
                                            className="rounded-2xl max-w-full max-h-40 object-cover border-2 border-emerald-200 shadow"
                                        />
                                    )}
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm
                                            ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 border border-gray-100/80 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.role === 'ai'
                                            ? <FormattedText text={msg.text} />
                                            : msg.text
                                        }
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mb-1 text-sm font-bold text-gray-600">
                                        U
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading dots */}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="w-8 h-8 rounded-xl bg-white border border-green-100 flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                                    <DietDostIcon size={20} />
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm border border-gray-100/80">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:160ms]" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:320ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Quick Questions ── */}
                    {messages.length <= 1 && (
                        <div className="px-4 pt-3 pb-1 bg-white/60 flex-shrink-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Quick Start
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_QS.map((q) => (
                                    <button
                                        key={q.text}
                                        onClick={() => handleQuickQ(q)}
                                        className="text-[12px] font-medium bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 shadow-sm flex items-center gap-1"
                                    >
                                        <span>{q.icon}</span> {q.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Image Preview Strip ── */}
                    {imagePreview && (
                        <div className="px-4 py-2 bg-white/80 border-t border-gray-100 flex-shrink-0">
                            <div className="relative inline-block">
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-300 shadow" />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-600 transition"
                                >
                                    ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] rounded px-1">
                                    Food 📸
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Input Area ── */}
                    <div className="px-3 pb-3 pt-2 bg-white/90 border-t border-gray-100/80 flex-shrink-0">
                        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all duration-200">
                            {/* Attach image button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach food photo"
                                className="flex-shrink-0 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about diet..."
                                rows={1}
                                className="flex-1 bg-transparent border-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed overflow-hidden"
                                style={{ maxHeight: '80px' }}
                            />

                            <button
                                onClick={handleSend}
                                disabled={loading || (!input.trim() && !imageFile)}
                                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;