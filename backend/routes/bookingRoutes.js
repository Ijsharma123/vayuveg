const express = require("express");
const { body } = require("express-validator");
const {
    createBooking,
    getSeatStatus,
    getBookings,
    updateBookingStatus,
    updateBooking,
    deleteBooking,
} = require("../controllers/bookingController");
const upload = require("../utils/multer");
const { authenticateAdmin } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();

const seatValidator = [
    body("packageId").trim().notEmpty().withMessage("Package ID is required."),
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("seatsBooked")
        .custom((value) => {
            if (!value) {
                return false;
            }

            if (Array.isArray(value)) {
                return value.length > 0;
            }

            if (typeof value === "string") {
                if (value.trim().length === 0) {
                    return false;
                }

                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) && parsed.length > 0;
                } catch {
                    return true;
                }
            }

            return false;
        })
        .withMessage("At least one seat must be selected."),
];

router.post("/book", upload.single("paymentProof"), seatValidator, validateRequest, createBooking);
router.post("/bookings", upload.single("paymentProof"), seatValidator, validateRequest, createBooking);
router.get("/bookings/seats/:packageId", getSeatStatus);
router.get("/bookings", authenticateAdmin, getBookings);
router.put(
    "/bookings/:id/status",
    authenticateAdmin,
    [body("status").trim().isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected.")],
    validateRequest,
    updateBookingStatus
);
router.put(
    "/bookings/:id",
    authenticateAdmin,
    [
        body("status").optional().trim().isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected."),
        body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
        body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty."),
    ],
    validateRequest,
    updateBooking
);
router.delete("/bookings/:id", authenticateAdmin, deleteBooking);

module.exports = router;
