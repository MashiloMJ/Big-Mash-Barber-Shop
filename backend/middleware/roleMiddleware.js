const requireSuperAdmin = (req, res, next) => {

    // Check the role stored in the JWT
    if (req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({
            message: "Access denied. Super Admin only."
        });
    }

    // User is a Super Admin
    next();
};

module.exports = requireSuperAdmin;