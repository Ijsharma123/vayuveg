const express = require("express");
const {
    addPackage,
    getPackages,
    getPackageById,
} = require("../controllers/packageController");

const router = express.Router();

router.post("/packages/add", addPackage);
router.get("/packages", getPackages);
router.get("/packages/:id", getPackageById);

module.exports = router;
