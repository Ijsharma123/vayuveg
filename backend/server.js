const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });

const express = require("express");
const cors = require("cors");

const connectDatabase = require("./config/db");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const queryRoutes = require("./routes/queryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const termsRoutes = require("./routes/termsRoutes");
const seedPackages = require("./data/seedPackages");
const seedAdminUser = require("./data/seedAdmin");
const seedTermsAndConditions = require("./data/seedTerms");
const { startBookingExpiryWorker } = require("./cron/bookingExpiry");

const app = express();
const travelPort = Number(process.env.TRAVEL_APP_PORT || process.env.PORT || 5000);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

app.use(
    cors({
        origin: [
            process.env.CLIENT_URL,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ].filter(Boolean),
        credentials: true,
    })
);
app.use(require("./middleware/logger"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Vayuveg Bus Travels API is running.",
    });
});

app.use("/api", packageRoutes);
app.use("/api", bookingRoutes);
app.use("/api", queryRoutes);
app.use("/api", adminRoutes);
app.use("/api", termsRoutes);

if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    app.use((req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }

        if (fs.existsSync(frontendDistPath)) {
            return res.sendFile(path.join(frontendDistPath, "index.html"));
        }

        next();
    });
}

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

app.use((error, req, res, next) => {
    console.error("Vayuveg API error:", error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Something went wrong on the server.",
    });
});

async function startServer() {
    await connectDatabase();
    await seedAdminUser();
    await seedPackages();
    await seedTermsAndConditions();
    startBookingExpiryWorker();

    app.listen(travelPort, () => {
        console.log(`Vayuveg Bus Travels backend running on http://localhost:${travelPort}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start Vayuveg backend:", error);
    process.exit(1);
});
