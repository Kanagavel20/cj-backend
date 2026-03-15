const mongoose = require("mongoose");

const crackerSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
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
        discountPrice: {
            type: Number,
            required: true
        },
        discountPercentage: {
            type: Number,
            required: true
        },
        stockStatus: {
            type: String,
            required: true,
            enum: ["In Stock", "Few Left", "Out of Stock"]
        },
         crackerType: {
            type: String,
            required: true,
        },
        image1: {
            type: String,
            required: true
        },
        image2: {
            type: String,
            default: null
        },
        image3: {
            type: String,
            default: null
        },
        image4: {
            type: String,
            default: null
        },
        image5: {
            type: String,
            default: null
        },
        youtubeLink: {
            type: String
        },
        instagramLink: {
            type: String
        },
        duration: {
            type: String,
            required: true
        },
        soundLevel: {
            type: String,
            required: true
        },
        safety: {
            type: String,
            required: true
        },
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
