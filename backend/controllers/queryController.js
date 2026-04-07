const Query = require("../models/Query");

exports.createQuery = async (req, res, next) => {
    try {
        const { name, phone, message } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and message are required.",
            });
        }

        const query = await Query.create({
            name: name.trim(),
            phone: String(phone).trim(),
            message: message.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Your query has been submitted successfully.",
            data: query,
        });
    } catch (error) {
        next(error);
    }
};

exports.getQueries = async (req, res, next) => {
    try {
        const queries = await Query.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: queries });
    } catch (error) {
        next(error);
    }
};

exports.updateQueryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "resolved"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either pending or resolved.",
            });
        }

        const query = await Query.findById(id);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found.",
            });
        }

        query.status = status;
        await query.save();

        return res.status(200).json({
            success: true,
            message: "Query status updated.",
            data: query,
        });
    } catch (error) {
        next(error);
    }
};
