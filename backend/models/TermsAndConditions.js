const mongoose = require("mongoose");

const PointSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const TermsAndConditionsSchema = new mongoose.Schema(
    {
        points: {
            type: [PointSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TermsAndConditions", TermsAndConditionsSchema);
