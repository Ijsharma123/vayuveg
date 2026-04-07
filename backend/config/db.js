const mongoose = require("mongoose");

async function connectDatabase() {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    console.log("Connecting to MongoDB...", mongoUri);
    if (!mongoUri) {
        throw new Error("Missing MongoDB connection string. Set MONGO_URI or DATABASE_URL.");
    }

    await mongoose.connect(mongoUri);
    console.log("Vayuveg Bus Travels backend connected to MongoDB");
}

module.exports = connectDatabase;
