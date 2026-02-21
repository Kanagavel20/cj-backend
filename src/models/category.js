const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    categoryNameEnglish: {
      type: String,
      required: true,
      trim: true
    },
    categoryNameTamil: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: String
    },
    lastUpdatedBy: {
      type: String
    },
    lastUpdatedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);