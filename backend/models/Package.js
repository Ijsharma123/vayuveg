const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        destination: {
            type: String,
            required: true,
            trim: true,
        },
        pricePerSeat: {
            type: Number,
            required: true,
            min: 1,
        },
        duration: {
            type: String,
            required: true,
            trim: true,
        },
        totalSeats: {
            type: Number,
            required: true,
            min: 1,
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            default: "/packages/default.svg",
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        bookedSeats: {
            type: [Number],
            default: [],
        },
        pendingSeats: {
            type: [Number],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

PackageSchema.pre("validate", function () {
    const uniqueBooked = Array.from(
        new Set(
            (this.bookedSeats || [])
                .map((seat) => Number(seat))
                .filter((seat) => Number.isInteger(seat) && seat > 0)
        )
    ).sort((a, b) => a - b);

    const uniquePending = Array.from(
        new Set(
            (this.pendingSeats || [])
                .map((seat) => Number(seat))
                .filter((seat) => Number.isInteger(seat) && seat > 0)
        )
    ).sort((a, b) => a - b);

    this.bookedSeats = uniqueBooked;
    this.pendingSeats = uniquePending;

    if (typeof this.availableSeats !== "number") {
        this.availableSeats = Math.max(this.totalSeats - uniqueBooked.length - uniquePending.length, 0);
    }

    if (this.availableSeats < 0) {
        this.availableSeats = 0;
    }

    // next();
});

module.exports = mongoose.model("TravelPackage", PackageSchema);
