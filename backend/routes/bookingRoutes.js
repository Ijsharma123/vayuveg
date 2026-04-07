const express = require("express");
const { bookSeats } = require("../controllers/bookingController");
const upload = require("../utils/multer");

const router = express.Router();

router.post("/book", upload.single("paymentProof"), bookSeats);

module.exports = router;
