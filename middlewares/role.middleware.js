/**
 * @desc Checks if the logged-in user has the required role
 * @param  {...string} allowedRoles - List of roles permitted to access the route
 */
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        // Safety check: Ensure authMiddleware has run first
        if (!req.user) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error: User context missing"
            });
        }

        //Role validation
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied: ${req.user.role} role does not have access to this resource`
            });
        }

        next();
    };
};

module.exports = roleGuard;