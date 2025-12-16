const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'DEVCORE_SECRET');
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
          return res.status(401).json({ message: 'User not found' });
      }

      // FITUR NO. 5: FORCE LOGOUT TARGET
      if (user.forceLogout) {
          return res.status(401).json({ message: 'SESSION_TERMINATED_BY_ADMIN' });
      }

      req.user = user;
      next();
    } catch (e) { res.status(401).json({ message: 'Not authorized' }); }
  } else { res.status(401).json({ message: 'No token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Admin access required' });
};

const demonOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'demon' || req.user.role === 'admin')) next();
  else res.status(403).json({ message: 'DEMON ACCESS REQUIRED 💀' });
};

module.exports = { protect, adminOnly, demonOnly };
