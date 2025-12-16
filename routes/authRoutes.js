const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getMe, changePassword, generateUserApiKey, updateSettings } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/generate-key', protect, generateUserApiKey);
router.post('/settings', protect, updateSettings); // Route Baru

module.exports = router;
