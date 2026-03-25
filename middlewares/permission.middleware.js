const permissionsMap = require("../constants/permissions");

const permissionGuard = (...requiredPermissions) => {

  return (req, res, next) => {
   
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const role = req.user.role;
    if (role === 'ADMIN') return next()
      
    const rolePermissions = permissionsMap[role] || [];

    const hasPermission = requiredPermissions.some(permission =>
      rolePermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }
//  console.log(`User Role: ${req.user.role}, Permissions: ${requiredPermissions}, Required: ${rolePermissions}`);
    next();
  };

};

module.exports = permissionGuard;