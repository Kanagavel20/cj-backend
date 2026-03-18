const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNo: { type: String, unique: true },
  clientName: String,
  mobileNo: String,
  address: String,
  city: String,
  pinCode: String,
  overallPurchaseAmount: Number,
  deliveryStatus: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);