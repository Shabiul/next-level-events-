const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, sparse: true },
  password: String,
  googleId: String,
  photoURL: String,
  phone: { type: String, unique: true, sparse: true },
  gender: String,
  dateOfBirth: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  role: {
    type: String,
    default: "user"
  },
  // Only meaningful when role === "staff": which admin-console sections
  // (CRM AdminView keys, e.g. "products", "orders", "payments") this staff
  // account may access. Ignored for role "admin" (implicitly all) and
  // "user" (implicitly none).
  permissions: {
    type: [String],
    default: []
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: []
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);