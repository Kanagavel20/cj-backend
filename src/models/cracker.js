const mongoose = require("mongoose");

const crackerSchema = new mongoose.Schema(
{
    crackerNameEnglish: {
        type: String,
        required: true
    },
    crackerNameTamil: {
        type: String,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    // discountPrice: {
    //     type: Number,
    //     required: true
    // },
    // discountPercentage: {
    //     type: Number,
    //     required: true
    // },
    mainImage: {
        type: String,
        required: true
    },
    subImages: [
        {
            type: String
        }
    ],
    youtubeLink: {
        type: String
    },
    instagramLink: {
        type: String
    },

    // Seller tracking
    createdBy: {
        type: String,
        required: true
    },
    lastUpdatedBy: {
        type: String,
        default: null
    },
    lastUpdatedAt: {
        type: Date,
        default: null
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Cracker", crackerSchema);
