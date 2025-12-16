const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  
  // Custom AI Info
  reqAiName: { type: String },
  reqDevName: { type: String },
  isApproved: { type: Boolean, default: false },
  
  // Profile & API Keys
  personalApiKey: { type: String, unique: true, sparse: true }, 
  avatarUrl: { type: String, default: '' },

  // NEW STATISTICS FIELDS
  apiReqCount: { type: Number, default: 0 }, // Total Request
  tokenUsage: { type: Number, default: 0 },  // Total Token
  lastLogin: { type: Date, default: Date.now },
  healthStatus: { type: String, default: '100% (HEALTHY)' } // Status Akun
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
