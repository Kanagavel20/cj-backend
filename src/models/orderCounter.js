const mongoose = require("mongoose")

const counterSchema = new mongoose.Schema({
  date: String,   // YYYYMMDD
  seq: Number,
});

module.exports = mongoose.model("orderCounters", counterSchema);