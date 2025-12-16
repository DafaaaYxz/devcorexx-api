const User = require('../models/user');
const GlobalConfig = require('../models/globalConfig');
const axios = require('axios');

exports.handleExternalChat = async (req, res) => {
    const userApiKey = req.headers['x-api-key'];
    const { messages, model } = req.body;

    if (!userApiKey) return res.status(401).json({ error: "Missing x-api-key header" });

    // 1. Validasi User Key & Load User
    const user = await User.findOne({ personalApiKey: userApiKey });
    if (!user) return res.status(401).json({ error: "Invalid API Key" });
    if (!user.isApproved) return res.status(403).json({ error: "Account not approved by Admin" });

    // 2. Ambil System Key (OpenRouter)
    const config = await GlobalConfig.findOne();
    const activeKeys = config?.apiKeys.filter(k => k.isActive) || [];
    if (activeKeys.length === 0) return res.status(503).json({ error: "System Busy (No Upstream Key)" });
    const randomKey = activeKeys[Math.floor(Math.random() * activeKeys.length)];

    // 3. Proxy Request ke OpenRouter
    try {
        const payload = {
            model: "nex-agi/deepseek-v3.1-nex-n1:free", 
            messages: messages || [{ role: "user", content: "Hello" }],
            stream: false 
        };

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${randomKey.key}`,
                'HTTP-Referer': 'https://devcore.ai',
                'X-Title': 'DevCORE External API'
            }
        });

        // 4. UPDATE STATISTIK USER (REAL-TIME)
        // Hitung token secara kasar jika provider tidak kasih usage (1 kata ~= 1.5 token)
        // Tapi OpenRouter biasanya kasih field 'usage'
        let usedTokens = 0;
        if (response.data.usage) {
            usedTokens = response.data.usage.total_tokens;
        } else {
            // Fallback calculation logic
            const inputLen = JSON.stringify(messages).length;
            const outputLen = response.data.choices[0].message.content.length;
            usedTokens = Math.ceil((inputLen + outputLen) / 4);
        }

        user.apiReqCount = (user.apiReqCount || 0) + 1;
        user.tokenUsage = (user.tokenUsage || 0) + usedTokens;
        
        // Simpan update ke database (tanpa await biar response cepat)
        user.save();

        res.json(response.data);

    } catch (err) {
        res.status(500).json({ error: "Upstream Error", details: err.message });
    }
};
