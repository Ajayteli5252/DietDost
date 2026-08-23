const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    const hinglishWords = [
        'kya', 'hai', 'mera', 'meri', 'maine', 'khaya', 'aaj', 'kal', 'roti', 'dal', 'chawal', 'kha', 'piya',
        'kitna', 'kitni', 'bata', 'mujhe', 'hum', 'tum', 'ap', 'aap', 'nahi', 'accha', 'theek', 'batao',
        'kaise', 'kab', 'kyu', 'kyon', 'raha', 'rahe', 'hun', 'hu', 'tha', 'thi', 'the', 'ka', 'ke', 'ki',
        'ko', 'se', 'pe', 'par', 'me', 'mein', 'bhi', 'hi', 'toh', 'kar', 'karo', 'karna', 'hoga', 'hogi',
        'do', 'de', 'le', 'lo', 'rha', 'gya', 'gyi', 'diya', 'di', 'liye', 'liya', 'rhi', 'pucho', 'puchna',
        'janne', 'baare', 'baat', 'bol', 'bolo', 'samajh', 'nhi', 'krna', 'skta', 'skti', 'skte'
    ];

    const lowerText = text.toLowerCase();
    const hasHindi = hindiRegex.test(text);
    const hasHinglish = hinglishWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });

    if (hasHindi) return 'hindi';
    if (hasHinglish) return 'hinglish';
    return 'english';
};

const getSystemPrompt = (language) => {
    const base = `You are DietDost AI, a friendly and expert personal nutrition coach.

RESPONSE FORMATTING RULES (very important):
- For list-type questions (e.g., "best foods for protein", "weight loss tips"), use this structure:
  1. Start with 1-2 sentence intro
  2. Use ## or ### headers to group items (e.g., "## 🥩 Animal-Based Sources")
  3. Use bullet points with **Bold Name** – description format (e.g., "- **Chicken Breast** – ~31g protein per 100g")
- For simple/conversational questions (e.g., "should I eat rice?"), answer in 2-3 short paragraphs.
- For "what is X" questions, give a brief paragraph + a quick bullet list of key points.
- Always use **bold** for food names, numbers, and key advice.
- Use relevant emojis as section markers (🥩, 🌱, ⚡, 💪, etc.).
- NEVER write one long block of text — always break up the answer with spacing and structure.
- Maximum 6 bullet points total. Keep it concise but highly useful.
- Do NOT use JSON. Do NOT use code blocks.
- Talk like a supportive expert friend who gives clear, actionable advice.
- Only answer questions about diet, nutrition, food, and fitness.`;

    if (language === 'hindi') {
        return `${base}\n\nCRITICAL: Respond ONLY in Hindi using Devanagari script. Use the same markdown formatting rules above but in Hindi language.`;
    }
    if (language === 'hinglish') {
        return `${base}\n\nCRITICAL: Respond ONLY in Hinglish (Roman script). Use the same markdown formatting rules above but in Hinglish language.`;
    }
    return `${base}\n\nCRITICAL: Respond ONLY in English.`;
};

const askAI = async (prompt, userLanguage = null, chatHistory = []) => {
    const language = userLanguage || detectLanguage(prompt);

    const historyMessages = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: getSystemPrompt(language) },
            ...historyMessages,
            { role: 'user', content: prompt },
        ],
        model: process.env.GROQ_MODEL || 'groq/compound-mini',
        temperature: 0.7,
        max_tokens: 400,
    });

    return {
        response: completion.choices[0]?.message?.content || '',
        language: language,
    };
};

// Vision model for image analysis
const askAIWithImage = async (prompt, imageBase64, mimeType, userLanguage = 'english', chatHistory = []) => {
    const language = userLanguage;
    const visionModel = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';

    const historyMessages = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: getSystemPrompt(language) },
                ...historyMessages,
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
                        },
                    ],
                },
            ],
            model: visionModel,
            temperature: 0.7,
            max_tokens: 500,
        });

        return {
            response: completion.choices[0]?.message?.content || '',
            language,
        };
    } catch (visionError) {
        console.error('Vision model error:', visionError?.message);
        // Fallback: describe image limitation using text model
        const fallbackPrompt = `${prompt}\n\n(Note: The user uploaded a food image but vision analysis failed. Acknowledge this and ask them to describe the food instead.)`;
        return await askAI(fallbackPrompt, language, chatHistory);
    }
};

const askAIJSON = async (prompt, model = null) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a nutrition expert. You MUST respond ONLY in valid JSON format as requested. Do NOT include any markdown blocks or extra text.' 
                },
                { role: 'user', content: prompt },
            ],
            model: model || process.env.GROQ_MODEL || 'groq/compound-mini',
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        return {
            response: completion.choices[0]?.message?.content || '{}',
        };
    } catch (error) {
        console.error('askAIJSON error:', error.message);
        // Fallback
        try {
            const fallback = await askAI(prompt + " (Respond in JSON format)", null, []);
            let clean = fallback.response.replace(/```json/g, '').replace(/```/g, '').trim();
            return { response: clean };
        } catch (inner) {
            console.error('AI Fallback failed too:', inner.message);
            throw inner; // Re-throw to be caught by controller
        }
    }
};

module.exports = { askAI, askAIWithImage, askAIJSON, detectLanguage };