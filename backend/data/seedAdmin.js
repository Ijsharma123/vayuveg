const Admin = require("../models/Admin");

async function seedAdminUser() {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@example.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
        return existingAdmin;
    }

    const admin = await Admin.create({
        name: process.env.ADMIN_NAME?.trim() || "Super Admin",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || "Admin123!",
        role: process.env.ADMIN_ROLE === "admin" ? "admin" : "super_admin",
    });

    console.info("Admin user seeded:", admin.email);
    return admin;
}

module.exports = seedAdminUser;
