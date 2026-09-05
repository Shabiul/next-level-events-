const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: String
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: String,
  image: String,
  slug: {
    type: String,
    unique: true
  },
  active: Boolean,
  order: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  subcategories: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
});

module.exports = mongoose.model("Category", CategorySchema);