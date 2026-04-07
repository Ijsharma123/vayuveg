const path = require("path");
const Booking = require("../models/Booking");
const Package = require("../models/Package");

function normalizeSeats(seats) {
    return Array.from(
        new Set(
            (Array.isArray(seats) ? seats : [])
                .map((seat) => Number(seat))
                .filter((seat) => Number.isInteger(seat) && seat > 0)
        )
    ).sort((firstSeat, secondSeat) => firstSeat - secondSeat);
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function buildReferenceId() {
    return `VBG-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function buildFileUrl(req, filePath) {
    if (!filePath) {
        return "";
    }
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    return `${req.protocol}://${req.get("host")}/${relativePath}`;
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
        bookedSeats: (payload.bookedSeats || []).sort((a, b) => a - b),
        pendingSeats: (payload.pendingSeats || []).sort((a, b) => a - b),
        image: payload.image,
        description: payload.description,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
    };
}

function serializeBooking(booking) {
    return {
        id: booking._id,
        packageId: booking.packageId,
        packageTitle: booking.packageTitle,
        name: booking.name,
        phone: booking.phone,
        seatsBooked: booking.seatsBooked,
        status: booking.status,
        paymentProof: booking.paymentProof,
        bookingTime: booking.bookingTime,
        referenceId: booking.referenceId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    };
}

exports.createBooking = async (req, res, next) => {
    const { packageId, name, phone, seatsBooked } = req.body;
    const normalizedSeats = normalizeSeats(seatsBooked);
    const sanitizedPhone = normalizePhone(phone);

    if (!packageId || !name || !phone || normalizedSeats.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Package, customer name, phone number and selected seats are required.",
        });
    }

    if (sanitizedPhone.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid phone number.",
        });
    }

    try {
        const travelPackage = await Package.findById(packageId).select(
            "title destination pricePerSeat duration totalSeats availableSeats image description bookedSeats pendingSeats"
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

        const blockedSeats = new Set([...(travelPackage.bookedSeats || []), ...(travelPackage.pendingSeats || [])]);
        const unavailableSeats = normalizedSeats.filter((seat) => blockedSeats.has(seat));

        if (unavailableSeats.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Selected seats are no longer available: ${unavailableSeats.join(", ")}.`,
            });
        }

        const updatedPackage = await Package.findOneAndUpdate(
            {
                _id: packageId,
                bookedSeats: { $nin: normalizedSeats },
                pendingSeats: { $nin: normalizedSeats },
                availableSeats: { $gte: normalizedSeats.length },
            },
            {
                $push: { pendingSeats: { $each: normalizedSeats } },
                $inc: { availableSeats: -normalizedSeats.length },
            },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(409).json({
                success: false,
                message: "Some selected seats were just reserved by another customer. Please refresh and choose available seats.",
            });
        }

        const fileUrl = req.file ? buildFileUrl(req, req.file.path) : "";

        try {
            const booking = await Booking.create({
                packageId,
                packageTitle: travelPackage.title,
                name: name.trim(),
                phone: sanitizedPhone,
                seatsBooked: normalizedSeats,
                status: "pending",
                paymentProof: fileUrl,
                bookingTime: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                referenceId: buildReferenceId(),
            });

            return res.status(201).json({
                success: true,
                message: "Your booking request is pending approval. Seats are temporarily reserved for 24 hours.",
                data: {
                    booking: serializeBooking(booking),
                    package: serializePackage(updatedPackage),
                },
            });
        } catch (bookingError) {
            await Package.findByIdAndUpdate(packageId, {
                $pullAll: { pendingSeats: normalizedSeats },
                $inc: { availableSeats: normalizedSeats.length },
            });
            throw bookingError;
        }
    } catch (error) {
        next(error);
    }
};

exports.getSeatStatus = async (req, res, next) => {
    try {
        const { packageId } = req.params;

        const travelPackage = await Package.findById(packageId).select("bookedSeats pendingSeats");
        if (!travelPackage) {
            return res.status(404).json({
                success: false,
                message: "Travel package not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                bookedSeats: (travelPackage.bookedSeats || []).sort((a, b) => a - b),
                pendingSeats: (travelPackage.pendingSeats || []).sort((a, b) => a - b),
            },
        });
    } catch (error) {
        next(error);
    }
};

async function processBookingStatusChange(booking, status) {
    if (status === "approved") {
        const updatedPackage = await Package.findOneAndUpdate(
            {
                _id: booking.packageId,
                bookedSeats: { $nin: booking.seatsBooked },
            },
            {
                $pullAll: { pendingSeats: booking.seatsBooked },
                $push: { bookedSeats: { $each: booking.seatsBooked } },
            },
            { new: true }
        );

        if (!updatedPackage) {
            booking.status = "rejected";
            booking.rejectionReason = "approval_conflict";
            booking.processedAt = new Date();
            await booking.save();
            return null;
        }
    } else if (status === "rejected") {
        await Package.findByIdAndUpdate(booking.packageId, {
            $pullAll: { pendingSeats: booking.seatsBooked },
            $inc: { availableSeats: booking.seatsBooked.length },
        });
    }

    booking.status = status;
    booking.rejectionReason = status === "rejected" ? "admin_rejected" : undefined;
    booking.processedAt = new Date();
    await booking.save();
    return booking;
}

exports.getBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query.status = status;
        }

        const bookings = await Booking.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected.",
            });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be approved or rejected.",
            });
        }

        const updatedBooking = await processBookingStatusChange(booking, status);
        if (!updatedBooking) {
            return res.status(409).json({
                success: false,
                message: "Cannot approve booking because seats were already reserved.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Booking ${status} successfully.`,
            data: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, status } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (name) {
            booking.name = String(name).trim();
        }

        if (phone) {
            booking.phone = String(phone).trim();
        }

        if (status) {
            if (!["approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be approved or rejected.",
                });
            }

            if (booking.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending bookings can be updated with a status change.",
                });
            }

            const updatedBooking = await processBookingStatusChange(booking, status);
            if (!updatedBooking) {
                return res.status(409).json({
                    success: false,
                    message: "Cannot approve booking because seats were already reserved.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Booking updated successfully.",
                data: updatedBooking,
            });
        }

        await booking.save();
        return res.status(200).json({
            success: true,
            message: "Booking updated successfully.",
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (booking.status === "pending") {
            await Package.findByIdAndUpdate(booking.packageId, {
                $pullAll: { pendingSeats: booking.seatsBooked },
                $inc: { availableSeats: booking.seatsBooked.length },
            });
        }

        if (booking.status === "approved") {
            await Package.findByIdAndUpdate(booking.packageId, {
                $pullAll: { bookedSeats: booking.seatsBooked },
                $inc: { availableSeats: booking.seatsBooked.length },
            });
        }

        await booking.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

