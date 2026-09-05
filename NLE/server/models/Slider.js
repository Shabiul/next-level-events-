const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  chip: String,
  headline: {
    type: String,
    required: true
  },
  subtext: String,
  gradient: {
    type: String,
    default: "linear-gradient(135deg, rgba(107,33,168,0.85), rgba(236,72,153,0.75))"
  },
  ctaText: {
    type: String,
    default: "Book Now"
  },
  ctaLink: {
    type: String,
    default: "#"
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Slider", SliderSchema);
