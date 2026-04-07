const Booking = require("../models/Booking");
const Package = require("../models/Package");
const buildWhatsAppUrl = require("../utils/buildWhatsAppUrl");

function normalizeSeats(seats) {
    return Array.from(
        new Set(
            (Array.isArray(seats) ? seats : [])
                .map((seat) => Number(seat))
                .filter((seat) => Number.isInteger(seat))
        )
    ).sort((firstSeat, secondSeat) => firstSeat - secondSeat);
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function serializePackage(travelPackage) {
    const payload = travelPackage.toObject ? travelPackage.toObject() : travelPackage;

    return {
        id: payload._id,
        title: payload.title,
        destination: payload.destination,
        pricePerSeat: payload.pricePerSeat,
        duration: payload.duration,
        totalSeats: payload.totalSeats,
        availableSeats: payload.availableSeats,
        bookedSeats: (payload.bookedSeats || []).sort((firstSeat, secondSeat) => firstSeat - secondSeat),
        image: payload.image,
        description: payload.description,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
    };
}

exports.bookSeats = async (req, res, next) => {
    const { packageId, name, phone, seatsBooked } = req.body;
    const normalizedSeats = normalizeSeats(seatsBooked);

    if (!packageId || !name || !phone || normalizedSeats.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Package, customer name, phone number and selected seats are required.",
        });
    }
    const sanitizedPhone = normalizePhone(phone);

    if (sanitizedPhone.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid phone number.",
        });
    }

    try {
        const travelPackage = await Package.findById(packageId).select(
            "title destination pricePerSeat duration totalSeats availableSeats image description bookedSeats"
        );

        if (!travelPackage) {
            return res.status(404).json({
                success: false,
                message: "Travel package not found.",
            });
        }
        const invalidSeats = normalizedSeats.filter(
            (seatNumber) => seatNumber < 1 || seatNumber > travelPackage.totalSeats
        );

        if (invalidSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid seat numbers selected: ${invalidSeats.join(", ")}.`,
            });
        }

        const updatedPackage = await Package.findOneAndUpdate(
            {
                _id: packageId,
                availableSeats: { $gte: normalizedSeats.length },
                bookedSeats: { $nin: normalizedSeats },
            },
            {
                $push: { bookedSeats: { $each: normalizedSeats } },
                $inc: { availableSeats: -normalizedSeats.length },
            },
            {
                new: true,
            }
        );

        if (!updatedPackage) {
            return res.status(409).json({
                success: false,
                message: "Some selected seats were just booked. Please refresh and choose available seats.",
            });
        }

        // const whatsappUrl = buildWhatsAppUrl({
        //     phoneNumber: process.env.WHATSAPP_NUMBER,
        //     packageName: travelPackage.title,
        //     seats: normalizedSeats,
        //     customerName: name.trim(),
        // });

        try {
            const booking = await Booking.create({
                packageId,
                packageTitle: travelPackage.title,
                name: name.trim(),
                phone: sanitizedPhone,
                seatsBooked: normalizedSeats,
                paymentProof: req.file ? `${"http://localhost:5000"}${req.file.path.replace(/\\/g, '/')}` : '',
                status: "pending",
                // whatsappUrl,
            });

            return res.status(201).json({
                success: true,
                message: "Request submitted. You will get confirmation within 24 hours.",
                data: {
                    booking: {
                        id: booking._id,
                        packageId: booking.packageId,
                        packageTitle: booking.packageTitle,
                        name: booking.name,
                        phone: booking.phone,
                        seatsBooked: booking.seatsBooked,
                        createdAt: booking.createdAt,
                    },
                    package: serializePackage(updatedPackage),
                    // whatsappUrl,
                },
            });
        } catch (bookingError) {
            await Package.updateOne(
                { _id: packageId },
                {
                    $pullAll: { bookedSeats: normalizedSeats },
                    $inc: { availableSeats: normalizedSeats.length },
                }
            );

            throw bookingError;
        }
    } catch (error) {
        next(error);
    }
};


const approveBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({ message: "Already processed" });
        }

        const travelPackage = await Package.findById(booking.packageId);

        // ✅ Atomic seat booking
        const updatedPackage = await Package.findOneAndUpdate(
            {
                _id: booking.packageId,
                bookedSeats: { $nin: booking.seatsRequested }
            },
            {
                $push: { bookedSeats: { $each: booking.seatsRequested } },
                $inc: { availableSeats: -booking.seatsRequested.length }
            },
            { new: true }
        );

        if (!updatedPackage) {
            booking.status = "rejected";
            await booking.save();

            return res.status(409).json({
                message: "Seats already taken. Booking rejected."
            });
        }

        booking.status = "approved";
        await booking.save();

        return res.json({
            message: "Booking approved",
            booking
        });

    } catch (error) {
        res.status(500).json({ message: "Approval failed", error: error.message });
    }
};
