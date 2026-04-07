const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.authenticateAdmin = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const token = authorization.split(" ")[1];
        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        const payload = jwt.verify(token, secret);

        const admin = await Admin.findById(payload.id).select("-password");
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin || !allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action.",
            });
        }

        next();
    };
};
