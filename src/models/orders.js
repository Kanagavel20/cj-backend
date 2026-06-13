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
  pdfUrl: String,
  pdfFileId: String,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);