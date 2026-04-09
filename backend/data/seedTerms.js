const TermsAndConditions = require("../models/TermsAndConditions");

async function seedTermsAndConditions() {
    try {
        const existingTerms = await TermsAndConditions.findOne();
        if (existingTerms) {
            return existingTerms;
        }

        const terms = await TermsAndConditions.create({
            points: [
                { id: "1", text: "Cancellation: Cancellations must be made 7 days before departure with 80% refund" },
                { id: "2", text: "Payment: Full payment is required at booking confirmation" },
                { id: "3", text: "Documentation: Valid ID is mandatory for all travelers" },
                { id: "4", text: "Liability: Company is not responsible for unforeseen circumstances" },
                { id: "5", text: "Itinerary: Schedule changes may be made due to weather or operations" },
                { id: "6", text: "Conduct: Travelers must follow all safety guidelines and dress code" },
            ],
        });

        console.info("Terms and conditions seeded:", terms._id);
        return terms;
    } catch (error) {
        console.error("Error seeding terms and conditions:", error);
        throw error;
    }
}

module.exports = seedTermsAndConditions;
