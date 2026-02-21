const mongoose = require("mongoose")

const sellerSchema = new mongoose.Schema({
    sellerId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        default: null
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "Seller"
    }
}, { timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema)