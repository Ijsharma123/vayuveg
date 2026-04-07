const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
    {
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TravelPackage",
            required: true,
        },
        packageTitle: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        seatsBooked: {
            type: [Number],
            required: true,
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: "At least one seat is required for a booking.",
            },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        paymentProof: {
            type: String,
            trim: true,
        },
        bookingTime: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        referenceId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("TravelBooking", BookingSchema);
