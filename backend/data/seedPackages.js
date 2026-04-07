const Package = require("../models/Package");
const samplePackages = require("./samplePackages");

async function seedPackages() {
    const existingPackages = await Package.countDocuments();

    if (existingPackages > 0) {
        return;
    }

    await Package.insertMany(samplePackages);
    console.log("Sample Vayuveg travel packages inserted");
}

module.exports = seedPackages;
