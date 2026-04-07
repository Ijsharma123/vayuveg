const cron = require("node-cron");
const Booking = require("../models/Booking");
const Package = require("../models/Package");

async function expirePendingBookings() {
    const expirationThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredBookings = await Booking.find({
        status: "pending",
        createdAt: { $lte: expirationThreshold },
    });

    if (!expiredBookings.length) {
        return;
    }

    for (const booking of expiredBookings) {
        await Package.findByIdAndUpdate(
            booking.packageId,
            {
                $pullAll: { pendingSeats: booking.seatsBooked },
                $inc: { availableSeats: booking.seatsBooked.length },
            },
            { new: true }
        );

        booking.status = "rejected";
        booking.rejectionReason = "expired";
        await booking.save();
    }
}

function startBookingExpiryWorker() {
    cron.schedule("0 * * * *", async () => {
        try {
            await expirePendingBookings();
            console.info("Booking expiry worker completed.");
        } catch (error) {
            console.error("Booking expiry worker failed:", error);
        }
    });
}

module.exports = {
    expirePendingBookings,
    startBookingExpiryWorker,
};
