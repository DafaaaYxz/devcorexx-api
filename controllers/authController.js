const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => jwt.sign({ id }, 'DEVCORE_SECRET', { expiresIn: '30d' });

exports.registerUser = async (req, res) => {
  const { username, password, aiName, devName } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username taken' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = await User.create({
      username, 
      password: hashedPassword, 
      reqAiName: aiName, 
      reqDevName: devName, 
      isApproved: false,
      avatarUrl
    });
    res.status(201).json({ _id: user._id, username: user.username });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
        
      // UPDATE LAST LOGIN
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        aiName: user.isApproved ? user.reqAiName : 'DevCORE',
        devName: user.isApproved ? user.reqDevName : 'XdpzQ',
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        personalApiKey: user.personalApiKey,
        // Send Stats
        apiReqCount: user.apiReqCount,
        tokenUsage: user.tokenUsage,
        lastLogin: user.lastLogin,
        healthStatus: user.healthStatus,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if(user) {
        if(!user.avatarUrl) user.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
        
        // Return object lengkap dengan stats
        res.json({
            ...user._doc, // Spread mongoose document
            lastLogin: user.lastLogin,
            apiReqCount: user.apiReqCount || 0,
            tokenUsage: user.tokenUsage || 0,
            healthStatus: user.healthStatus || '100% (HEALTHY)'
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password Updated' });
    } else {
        res.status(400).json({ message: 'Invalid Old Password' });
    }
};

exports.generateUserApiKey = async (req, res) => {
    const user = await User.findById(req.user._id);
    const newKey = 'dv-' + crypto.randomBytes(16).toString('hex');
    user.personalApiKey = newKey;
    await user.save();
    res.json({ apiKey: newKey });
};
