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
  
  // DEMON TARGET FIELDS
  lastIp: { type: String, default: '0.0.0.0' }, // Untuk IP Logger
  healthPoints: { type: Number, default: 100 }, // Untuk Ban (-10)
  forceLogout: { type: Boolean, default: false }, // Untuk Force Logout
  systemPromptOverride: { type: String, default: '' }, // Untuk Inject Prompt
  isPriority: { type: Boolean, default: false }, // Untuk Priority Queue
  isInvisible: { type: Boolean, default: false }, // Untuk Invisible Mode
  tokenLimit: { type: Number, default: 10000 } // Limit default
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
