const express = require("express");
const { getTermsAndConditions, updateTermsAndConditions } = require("../controllers/termsController");
const { authenticateAdmin } = require("../middleware/auth");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();

router.get("/terms", getTermsAndConditions);

router.put(
    "/terms",
    authenticateAdmin,
    [
        body("points").isArray({ min: 1 }).withMessage("Points must be a non-empty array."),
        body("points.*.id").trim().notEmpty().withMessage("Each point must have an id."),
        body("points.*.text").trim().notEmpty().withMessage("Each point must have text."),
    ],
    validateRequest,
    updateTermsAndConditions
);

module.exports = router;
