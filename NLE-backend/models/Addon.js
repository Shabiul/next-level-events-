const mongoose = require("mongoose");

const AddonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    default: "",
    trim: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: [],
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model("Addon", AddonSchema);
