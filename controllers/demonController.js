const User = require('../models/user');
const ChatHistory = require('../models/chatHistory');

// Helper: Cari user berdasarkan username
const findTarget = async (username) => {
    return await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
};

// 1. Steal Token (Ambil tokenUsage dari target, kurangi milik sendiri/reset)
// Interpretasi: Mengambil 'limit' token target untuk diri sendiri
exports.stealToken = async (req, res) => {
    const { targetName, amount } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target ${targetName} not found.` });

    const qty = parseInt(amount) || 1000;
    
    // Logika: Kurangi limit target, tambah limit demon (simulasi)
    target.tokenLimit = Math.max(0, target.tokenLimit - qty);
    await target.save();

    res.json({ log: `[SUCCESS] Stolen ${qty} limit tokens from ${target.username}. Target Limit: ${target.tokenLimit}` });
};

// 2. Ban User Premium (-10 Health)
exports.banUser = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    target.healthPoints = Math.max(0, target.healthPoints - 10);
    await target.save();

    res.json({ log: `[ATTACK] ${target.username} Health drained by 10. Current HP: ${target.healthPoints}%` });
};

// 3. Steal Limit Token (Mirip no 1, kita buat variasi ambil tokenUsage)
exports.stealLimit = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    target.tokenLimit = 0; // Kuras habis
    await target.save();

    res.json({ log: `[CRITICAL] ${target.username} Token Limit set to 0. Target disabled.` });
};

// 4. IP Logger
exports.ipLogger = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    res.json({ log: `[TRACKING] Target: ${target.username} | Last IP: ${target.lastIp} | Lat/Long: [REDACTED]` });
};

// 5. Force Logout
exports.forceLogout = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    target.forceLogout = true;
    await target.save();

    res.json({ log: `[KICK] ${target.username} session terminated. They will be logged out on next request.` });
};

// 6. Bypass Maintenance (Info only, logic ada di middleware)
exports.bypassInfo = async (req, res) => {
    res.json({ log: `[SYSTEM] You are DEMON. Maintenance Firewall is transparent to you.` });
};

// 7. View Target Chat History
exports.viewChat = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    const history = await ChatHistory.findOne({ user: target._id }).sort({ updatedAt: -1 });
    if(!history || !history.messages.length) return res.json({ log: `[SPY] ${target.username} has no active chat history.` });

    const lastMsg = history.messages[history.messages.length - 1];
    res.json({ log: `[SPY] ${target.username} Last Msg: "${lastMsg.content.substring(0, 50)}..."` });
};

// 8. Inject System Prompt
exports.injectPrompt = async (req, res) => {
    const { targetName, prompt } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    target.systemPromptOverride = prompt;
    await target.save();

    res.json({ log: `[INJECTION] System Prompt injected into ${target.username}'s kernel.` });
};

// 9. Priority Queue
exports.setPriority = async (req, res) => {
    const { targetName } = req.body;
    const target = await findTarget(targetName);
    if(!target) return res.status(404).json({ log: `[ERROR] Target not found.` });

    target.isPriority = true;
    await target.save();

    res.json({ log: `[BOOST] ${target.username} added to Priority Queue.` });
};

// 10. Invisible Mode
exports.toggleInvisible = async (req, res) => {
    const user = req.user;
    user.isInvisible = !user.isInvisible;
    await user.save();
    res.json({ log: `[STEALTH] Invisible Mode: ${user.isInvisible ? 'ON' : 'OFF'}` });
};
