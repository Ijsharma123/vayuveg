const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function buildToken(admin) {
    const payload = {
        id: admin._id,
        role: admin.role,
        email: admin.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "default_jwt_secret", {
        expiresIn: "8h",
    });
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = buildToken(admin);

        return res.status(200).json({
            success: true,
            message: "Admin logged in successfully.",
            data: {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
