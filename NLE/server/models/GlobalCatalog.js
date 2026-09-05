const mongoose = require("mongoose");

const GlobalCatalogSchema = new mongoose.Schema({
  addons: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
    category: { type: String, default: "General" },
  }],
  activities: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
    category: { type: String, default: "General" },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model("GlobalCatalog", GlobalCatalogSchema);
