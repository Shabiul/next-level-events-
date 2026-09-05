const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    eventType: { type: String, trim: true, maxlength: 120, default: "" },
    eventDate: { type: String, trim: true, maxlength: 40, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    source: { type: String, trim: true, default: "contact-form" },
    status: {
      type: String,
      enum: ["new", "in_progress", "responded", "closed"],
      default: "new",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

EnquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Enquiry", EnquirySchema);
