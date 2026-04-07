const Package = require("../models/Package");

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

function buildSeatLayout(totalSeats, bookedSeats = [], pendingSeats = []) {
    return Array.from({ length: totalSeats }, (_, index) => {
        const seatNumber = index + 1;

        return {
            number: seatNumber,
            status: bookedSeats.includes(seatNumber)
                ? "approved"
                : pendingSeats.includes(seatNumber)
                ? "pending"
                : "available",
        };
    });
}

exports.addPackage = async (req, res, next) => {
    try {
        const {
            title,
            destination,
            pricePerSeat,
            duration,
            totalSeats,
            image,
            description,
        } = req.body;

        if (!title || !destination || !pricePerSeat || !duration || !totalSeats || !description) {
            return res.status(400).json({
                success: false,
                message: "Title, destination, price, duration, total seats and description are required.",
            });
        }

        const normalizedTotalSeats = Number(totalSeats);
        const normalizedPrice = Number(pricePerSeat);

        if (!Number.isInteger(normalizedTotalSeats) || normalizedTotalSeats < 1) {
            return res.status(400).json({
                success: false,
                message: "Total seats must be a positive whole number.",
            });
        }

        if (Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price per seat must be greater than zero.",
            });
        }

        const travelPackage = await Package.create({
            title: title.trim(),
            destination: destination.trim(),
            pricePerSeat: normalizedPrice,
            duration: duration.trim(),
            totalSeats: normalizedTotalSeats,
            availableSeats: normalizedTotalSeats,
            image: image?.trim() || "/packages/default.svg",
            description: description.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Travel package created successfully.",
            data: serializePackage(travelPackage),
        });
    } catch (error) {
        next(error);
    }
};

exports.getPackages = async (req, res, next) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: packages.map(serializePackage),
        });
    } catch (error) {
        next(error);
    }
};

exports.getPackageById = async (req, res, next) => {
    try {
        const travelPackage = await Package.findById(req.params.id);

        if (!travelPackage) {
            return res.status(404).json({
                success: false,
                message: "Travel package not found.",
            });
        }

        const serializedPackage = serializePackage(travelPackage);

        return res.status(200).json({
            success: true,
            data: {
                ...serializedPackage,
                seatLayout: buildSeatLayout(
                    serializedPackage.totalSeats,
                    serializedPackage.bookedSeats,
                    serializedPackage.pendingSeats
                ),
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = {};
        const allowedFields = ["title", "destination", "pricePerSeat", "duration", "totalSeats", "image", "description"];

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (updates.totalSeats !== undefined) {
            const normalizedTotalSeats = Number(updates.totalSeats);
            if (!Number.isInteger(normalizedTotalSeats) || normalizedTotalSeats < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Total seats must be a positive whole number.",
                });
            }
            updates.totalSeats = normalizedTotalSeats;
        }

        if (updates.pricePerSeat !== undefined) {
            const normalizedPrice = Number(updates.pricePerSeat);
            if (Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price per seat must be greater than zero.",
                });
            }
            updates.pricePerSeat = normalizedPrice;
        }

        const existingPackage = await Package.findById(id);
        if (!existingPackage) {
            return res.status(404).json({
                success: false,
                message: "Travel package not found.",
            });
        }

        if (updates.totalSeats !== undefined) {
            const lockedSeatsCount = (existingPackage.bookedSeats.length || 0) + (existingPackage.pendingSeats.length || 0);
            if (updates.totalSeats < lockedSeatsCount) {
                return res.status(400).json({
                    success: false,
                    message: "Total seats cannot be smaller than already reserved or booked seats.",
                });
            }
            updates.availableSeats = updates.totalSeats - lockedSeatsCount;
        }

        const travelPackage = await Package.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        return res.status(200).json({
            success: true,
            message: "Travel package updated successfully.",
            data: serializePackage(travelPackage),
        });
    } catch (error) {
        next(error);
    }
};

exports.deletePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const travelPackage = await Package.findByIdAndDelete(id);

        if (!travelPackage) {
            return res.status(404).json({
                success: false,
                message: "Travel package not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Travel package deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};
