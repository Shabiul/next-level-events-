const mongoose = require("mongoose");

const CartAddonSchema = new mongoose.Schema(
  {
    addonId: { type: mongoose.Schema.Types.ObjectId, ref: "Addon" },
    name: String, // fallback match for inline product add-ons that have no _id
    qty: { type: Number, default: 1, min: 1, max: 99 },
  },
  { _id: false }
);

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, default: 1, min: 1, max: 99 },
    addons: { type: [CartAddonSchema], default: [] },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
