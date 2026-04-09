const TermsAndConditions = require("../models/TermsAndConditions");

exports.getTermsAndConditions = async (req, res, next) => {
    try {
        let termsAndConditions = await TermsAndConditions.findOne();

        // If no T&C exists, create default ones
        if (!termsAndConditions) {
            termsAndConditions = await TermsAndConditions.create({
                points: [
                    { id: "1", text: "Cancellation: Cancellations must be made 7 days before departure with 80% refund" },
                    { id: "2", text: "Payment: Full payment is required at booking confirmation" },
                    { id: "3", text: "Documentation: Valid ID is mandatory for all travelers" },
                    { id: "4", text: "Liability: Company is not responsible for unforeseen circumstances" },
                    { id: "5", text: "Itinerary: Schedule changes may be made due to weather or operations" },
                    { id: "6", text: "Conduct: Travelers must follow all safety guidelines and dress code" },
                ],
            });
        }

        return res.status(200).json({
            success: true,
            data: termsAndConditions,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTermsAndConditions = async (req, res, next) => {
    try {
        const { points } = req.body;

        if (!points || !Array.isArray(points) || points.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Points array is required and must not be empty.",
            });
        }

        let termsAndConditions = await TermsAndConditions.findOne();

        if (!termsAndConditions) {
            termsAndConditions = await TermsAndConditions.create({ points });
        } else {
            termsAndConditions.points = points;
            await termsAndConditions.save();
        }

        return res.status(200).json({
            success: true,
            message: "Terms and conditions updated successfully.",
            data: termsAndConditions,
        });
    } catch (error) {
        next(error);
    }
};
