const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model("Test", TestSchema);