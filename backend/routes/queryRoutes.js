const express = require("express");
const { body } = require("express-validator");
const { createQuery, getQueries, updateQueryStatus } = require("../controllers/queryController");
const { authenticateAdmin } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();

router.post(
    "/query",
    [
        body("name").trim().notEmpty().withMessage("Name is required."),
        body("phone").trim().notEmpty().withMessage("Phone number is required."),
        body("message").trim().notEmpty().withMessage("Message is required."),
    ],
    validateRequest,
    createQuery
);

router.get("/query", authenticateAdmin, getQueries);

router.put(
    "/query/:id",
    authenticateAdmin,
    [body("status").trim().isIn(["pending", "resolved"]).withMessage("Status must be pending or resolved.")],
    validateRequest,
    updateQueryStatus
);

module.exports = router;
