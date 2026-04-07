const express = require("express");
const { body } = require("express-validator");
const {
    addPackage,
    getPackages,
    getPackageById,
    updatePackage,
    deletePackage,
} = require("../controllers/packageController");
const { authenticateAdmin } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();

const packageValidators = [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("destination").trim().notEmpty().withMessage("Destination is required."),
    body("pricePerSeat").isFloat({ gt: 0 }).withMessage("Price per seat must be greater than zero."),
    body("duration").trim().notEmpty().withMessage("Duration is required."),
    body("totalSeats").isInt({ min: 1 }).withMessage("Total seats must be a positive integer."),
    body("description").trim().notEmpty().withMessage("Description is required."),
];

router.post("/packages", authenticateAdmin, packageValidators, validateRequest, addPackage);
router.post("/packages/add", authenticateAdmin, packageValidators, validateRequest, addPackage);
router.get("/packages", getPackages);
router.get("/packages/:id", getPackageById);
router.put("/packages/:id", authenticateAdmin, validateRequest, updatePackage);
router.delete("/packages/:id", authenticateAdmin, deletePackage);

module.exports = router;
