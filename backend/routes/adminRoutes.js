const express = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/adminController");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();

router.post(
    "/admin/login",
    [
        body("email").trim().isEmail().withMessage("A valid email is required."),
        body("password").trim().notEmpty().withMessage("Password is required."),
    ],
    validateRequest,
    login
);

module.exports = router;