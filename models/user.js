const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // admin, demon, premium, user
  
  // Custom AI Info
  reqAiName: { type: String },
  reqDevName: { type: String },
  isApproved: { type: Boolean, default: false },
  
  // Profile & API
  personalApiKey: { type: String, unique: true, sparse: true }, 
  avatarUrl: { type: String, default: '' },

  // Statistics
  apiReqCount: { type: Number, default: 0 },
  tokenUsage: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now },
  
  // Demon/Admin Fields
  lastIp: { type: String, default: '0.0.0.0' },
  healthPoints: { type: Number, default: 100 },
  forceLogout: { type: Boolean, default: false },
  systemPromptOverride: { type: String, default: '' },
  isPriority: { type: Boolean, default: false },
  isInvisible: { type: Boolean, default: false },
  tokenLimit: { type: Number, default: 10000 },

  // NEW SETTINGS FIELDS
  promptCount: { type: Number, default: 0 }, // Hitung chat user free
  fontPreference: { type: String, default: 'Roboto' }, // Pilihan Font
  sseoEnabled: { type: Boolean, default: false }, // Login Code Status
  sseoCode: { type: String, default: '' }, // Login Code (Passkey)
  twoFactorSecret: { type: String, default: '' } // 2FA Secret Key
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
