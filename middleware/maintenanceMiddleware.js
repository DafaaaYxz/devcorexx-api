const GlobalConfig = require('../models/globalConfig');

const checkMaintenance = async (req, res, next) => {
  try {
    const config = await GlobalConfig.findOne();
    
    // Jika Maintenance Aktif
    if (config && config.maintenanceMode) {
        // Bypass jika user adalah Admin ATAU Demon (Fitur No. 6)
        if (req.user && (req.user.role === 'admin' || req.user.role === 'demon')) {
            return next();
        }
        
        return res.status(503).json({ 
            message: 'MAINTENANCE_MODE', 
            info: 'System is locked. Access restricted to High Council.' 
        });
    }
    next();
  } catch (error) {
    console.error("Maintenance Check Error:", error);
    next();
  }
};

module.exports = { checkMaintenance };
