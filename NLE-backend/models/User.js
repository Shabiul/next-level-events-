const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  photoURL: String,
  phone: String,
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
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: []
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);