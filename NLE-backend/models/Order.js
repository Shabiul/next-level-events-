const mongoose = require("mongoose");
const Counter = require("./Counter");

const BookingAddonSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  qty: {
    type: Number,
    default: 1,
  },
  kind: {
    type: String,
    enum: ["addon", "activity"],
  },
}, { _id: false });

const CustomerSnapshotSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
}, { _id: false });

const ProductSnapshotSchema = new mongoose.Schema({
  id: String,
  name: String,
  categoryName: String,
  subcategory: String,
  image: String,
  price: Number,
  originalPrice: Number,
}, { _id: false });

const BookingSnapshotSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  location: String,
  eventDate: String,
  eventTime: String,
  requests: {
    type: String,
    default: "",
  },
}, { _id: false });

const BookingDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: String,
    required: true,
    trim: true,
  },
  eventTime: {
    type: String,
    required: true,
    trim: true,
  },
  requests: {
    type: String,
    trim: true,
    default: "",
  },
  addOns: {
    type: [BookingAddonSchema],
    default: [],
  },
}, { _id: false });

const ORDER_STATUS_VALUES = [
  "Pending",
  "Confirmed",
  "Team Assigned",
  "Preparation Started",
  "Decoration In Progress",
  "Completed",
  "Cancelled",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  customerId: String,
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  orderStatus: {
    type: String,
    enum: ORDER_STATUS_VALUES,
    default: "Pending",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
    default: "",
  },
  packagePrice: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  addonTotal: {
    type: Number,
    default: 0,
  },
  activityTotal: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["razorpay", "whatsapp"],
    default: "whatsapp",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "cancelled"],
    default: "pending",
  },
  customer: {
    type: CustomerSnapshotSchema,
    default: {},
  },
  product: {
    type: ProductSnapshotSchema,
    default: {},
  },
  booking: {
    type: BookingSnapshotSchema,
    default: {},
  },
  addons: {
    type: [BookingAddonSchema],
    default: [],
  },
  activities: {
    type: [BookingAddonSchema],
    default: [],
  },
  statusHistory: {
    type: [{
      status: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  bookingDetails: {
    type: [BookingDetailsSchema],
    default: [],
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
}, {
  timestamps: true,
});

OrderSchema.pre("save", async function () {
  try {
    if (this.isNew && !this.orderNumber) {
      const OrderModel = mongoose.model("Order");
      const highestExistingOrder = await OrderModel.findOne(
        { orderNumber: { $regex: /^TDP\d{6}$/ } },
        { orderNumber: 1, _id: 0 }
      )
        .sort({ orderNumber: -1 })
        .lean();

      const highestExistingSequence = highestExistingOrder?.orderNumber
        ? Number(highestExistingOrder.orderNumber.replace(/^TDP/, ""))
        : 0;

      let counter = await Counter.findOneAndUpdate(
        { _id: "order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      if (counter && counter.seq <= highestExistingSequence) {
        counter = await Counter.findOneAndUpdate(
          { _id: "order" },
          { $set: { seq: highestExistingSequence + 1 } },
          { new: true, upsert: true }
        );
      }

      const seqNumber = counter ? counter.seq : (highestExistingSequence + 1);
      this.orderNumber = `TDP${String(seqNumber).padStart(6, "0")}`;
    }

    if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
      this.statusHistory = [{ status: this.orderStatus || "Pending", updatedAt: new Date() }];
    }
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model("Order", OrderSchema);
