const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
    name: String,
    marketValue: Number,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Card", CardSchema);