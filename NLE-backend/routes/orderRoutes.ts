import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Order from "../models/Order";
import sendEmail from "../utils/sendEmail";
import authMiddleware from "../middleware/authMiddleware";
import { postOrderToN8n } from "../services/n8n.service";

const router = express.Router();

function getAuthenticatedUserId(req: Request) {
  const authorization = req.headers.authorization;
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(authorization.slice(7).trim(), process.env.JWT_SECRET || "secret") as { id?: string };
    return decoded.id;
  } catch {
    return undefined;
  }
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildCustomerSnapshot(body: any, firstBooking: any) {
  const fallbackName = body.customer?.name || firstBooking?.name || "";
  const fallbackEmail = body.customer?.email || "";
  const fallbackPhone = body.customer?.phone || firstBooking?.mobile || "";

  return {
    name: body.customer?.name || fallbackName,
    email: body.customer?.email || fallbackEmail,
    phone: body.customer?.phone || fallbackPhone,
    address: body.customer?.address || "",
    city: body.customer?.city || "",
    state: body.customer?.state || "",
    country: body.customer?.country || "",
    pincode: body.customer?.pincode || "",
  };
}

function buildProductSnapshot(body: any) {
  return {
    id: body.product?.id || body.productId || "",
    name: body.product?.name || body.productName || "",
    categoryName: body.product?.categoryName || body.categoryName || "",
    subcategory: body.product?.subcategory || body.subcategory || "",
    image: body.product?.image || body.productImage || body.image || "",
    price: toNumber(body.product?.price || body.packagePrice || body.amount || 0),
    originalPrice: toNumber(body.product?.originalPrice || body.packagePrice || body.amount || 0),
  };
}

function buildBookingSnapshot(body: any, firstBooking: any) {
  return {
    name: body.booking?.name || firstBooking?.name || "",
    mobile: body.booking?.mobile || firstBooking?.mobile || "",
    location: body.booking?.location || firstBooking?.location || "",
    eventDate: body.booking?.eventDate || firstBooking?.eventDate || "",
    eventTime: body.booking?.eventTime || firstBooking?.eventTime || "",
    requests: body.booking?.requests || firstBooking?.requests || "",
  };
}

function normalizeOrderStatus(status: unknown) {
  const raw = String(status || "").trim();
  if (!raw) return "Pending";

  const mapping: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    "team assigned": "Team Assigned",
    "team-assigned": "Team Assigned",
    "preparation started": "Preparation Started",
    "preparation-started": "Preparation Started",
    "decoration in progress": "Decoration In Progress",
    "decoration-in-progress": "Decoration In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    in_progress: "Decoration In Progress",
    "in progress": "Decoration In Progress",
  };

  return mapping[raw.toLowerCase()] || raw;
}

function getBookingDetailItems(body: any) {
  const bookingDetails = Array.isArray(body.bookingDetails) ? body.bookingDetails : [];
  return bookingDetails.flatMap((detail: any) => Array.isArray(detail.addOns) ? detail.addOns : []);
}

function buildAddonsSnapshot(body: any) {
  const source = Array.isArray(body.addons) ? body.addons : [];

  if (source.length > 0) {
    return source.map((item: any) => ({
      id: item.id || item._id || "",
      name: item.name || "",
      price: toNumber(item.price || 0),
      qty: toNumber(item.qty || 1),
      kind: item.kind || "addon",
    }));
  }

  const bookingItems = getBookingDetailItems(body).filter((item: any) => (item.kind || "addon") !== "activity");
  return bookingItems.map((item: any) => ({
    id: item.id || item._id || "",
    name: item.name || "",
    price: toNumber(item.price || 0),
    qty: toNumber(item.qty || 1),
    kind: item.kind || "addon",
  }));
}

function buildActivitiesSnapshot(body: any) {
  const source = Array.isArray(body.activities) ? body.activities : [];

  if (source.length > 0) {
    return source.map((item: any) => ({
      id: item.id || item._id || "",
      name: item.name || "",
      price: toNumber(item.price || 0),
      qty: toNumber(item.qty || 1),
      kind: "activity",
    }));
  }

  const bookingItems = getBookingDetailItems(body).filter((item: any) => (item.kind || "addon") === "activity");
  return bookingItems.map((item: any) => ({
    id: item.id || item._id || "",
    name: item.name || "",
    price: toNumber(item.price || 0),
    qty: toNumber(item.qty || 1),
    kind: "activity",
  }));
}

function buildBookingDetails(body: any) {
  const bookingDetails = Array.isArray(body.bookingDetails) ? body.bookingDetails : [];
  if (bookingDetails.length > 0) {
    return bookingDetails.map((item: any) => ({
      name: item.name || "",
      mobile: item.mobile || "",
      location: item.location || "",
      eventDate: item.eventDate || "",
      eventTime: item.eventTime || "",
      requests: item.requests || "",
      addOns: Array.isArray(item.addOns) ? item.addOns.map((addon: any) => ({
        id: addon.id || addon._id || "",
        name: addon.name || "",
        price: toNumber(addon.price || 0),
        qty: toNumber(addon.qty || 1),
        kind: addon.kind || "addon",
      })) : [],
    }));
  }

  const firstBooking = body.booking || {};
  return [{
    name: firstBooking.name || body.customer?.name || "",
    mobile: firstBooking.mobile || body.customer?.phone || "",
    location: firstBooking.location || "",
    eventDate: firstBooking.eventDate || "",
    eventTime: firstBooking.eventTime || "",
    requests: firstBooking.requests || "",
    addOns: [...buildAddonsSnapshot(body), ...buildActivitiesSnapshot(body)],
  }];
}

function buildEmailHtml(order: any) {
  const booking = order.booking || {};
  const customer = order.customer || {};
  const addons = Array.isArray(order.addons) ? order.addons : [];
  const activities = Array.isArray(order.activities) ? order.activities : [];
  const addonHtml = addons.length > 0 ? addons.map((item: any) => `<li>${item.name} — ₹${toNumber(item.price).toLocaleString("en-IN")}</li>`).join("") : "<li>None</li>";
  const activityHtml = activities.length > 0 ? activities.map((item: any) => `<li>${item.name} — ₹${toNumber(item.price).toLocaleString("en-IN")}</li>`).join("") : "<li>None</li>";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #7c3aed;">New booking received — TheDecorParty</h2>
      <p><strong>Booking ID:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${customer.name || booking.name || "N/A"}</p>
      <p><strong>Phone:</strong> ${customer.phone || booking.mobile || "N/A"}</p>
      <p><strong>Product:</strong> ${order.product?.name || order.productName || "N/A"}</p>
      <p><strong>Venue:</strong> ${booking.location || "N/A"}</p>
      <p><strong>Date:</strong> ${booking.eventDate || "N/A"}</p>
      <p><strong>Time:</strong> ${booking.eventTime || "N/A"}</p>
      <p><strong>Grand Total:</strong> ₹${toNumber(order.grandTotal || order.amount).toLocaleString("en-IN")}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus || "pending"}</p>
      <h3>Add-ons</h3>
      <ul>${addonHtml}</ul>
      <h3>Activities</h3>
      <ul>${activityHtml}</ul>
    </div>
  `;
}

async function notifyOrderChannels(order: any) {
  console.log("======================================");
console.log("INSIDE notifyOrderChannels()");
console.log("Order Number:", order.orderNumber);
console.log("Customer:", order.customer?.name);
console.log("======================================");
  const customerEmail = order.customer?.email;

  if (customerEmail) {
    await sendEmail(
      customerEmail,
      `Your booking confirmation — ${order.orderNumber}`,
      buildEmailHtml(order)
    );
  }

  await sendEmail(
    "thedecorparty.team@gmail.com",
    `New booking received — ${order.orderNumber}`,
    buildEmailHtml(order)
  );

  await postOrderToN8n({
    orderNumber: order.orderNumber,
    customer: order.customer,
    booking: order.booking,
    product: order.product,
    addons: order.addons,
    activities: order.activities,
    payment: {
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
    },
    totals: {
      subtotal: order.subtotal,
      addonTotal: order.addonTotal,
      activityTotal: order.activityTotal,
      grandTotal: order.grandTotal,
    },
    timestamps: {
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      productName,
      categoryName,
      subcategory,
      packagePrice,
      amount,
      paymentMethod,
      paymentStatus,
      bookingDetails,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    console.log("[orders] CREATE ORDER START", {
      hasAuthToken: Boolean(req.headers.authorization),
      userId: getAuthenticatedUserId(req),
      productId,
      productName,
      paymentStatus,
      paymentMethod,
      hasBookingDetails: Boolean(bookingDetails?.length),
      razorpayPaymentId,
    });

    if (!productId || !productName || !categoryName || !packagePrice || !amount || !bookingDetails?.length) {
      return res.status(400).json({ error: "Missing required booking information." });
    }

    if (razorpayPaymentId) {
      const existingOrder = await Order.findOne({ razorpayPaymentId });
      if (existingOrder) {
        console.log("[orders] duplicate order avoided", { orderId: existingOrder._id, orderNumber: existingOrder.orderNumber, razorpayPaymentId });
        return res.status(200).json(existingOrder);
      }
    }

    console.log("========== ORDER REQUEST ==========");
    console.log(req.body.addons);
    console.log(req.body.bookingDetails?.[0]?.addOns);
    console.log("[orders] ORDER DATA", req.body);

    const firstBooking = Array.isArray(bookingDetails) ? bookingDetails[0] : {};
    const customerSnapshot = buildCustomerSnapshot(req.body, firstBooking);
    const productSnapshot = buildProductSnapshot(req.body);
    const bookingSnapshot = buildBookingSnapshot(req.body, firstBooking);
    const addonsSnapshot = buildAddonsSnapshot(req.body);
    const activitiesSnapshot = buildActivitiesSnapshot(req.body);

    const subtotal = toNumber(req.body.subtotal || packagePrice || amount || 0);
    const addonTotal = toNumber(req.body.addonTotal || addonsSnapshot.reduce((sum: number, item: any) => sum + toNumber(item.price) * toNumber(item.qty || 1), 0));
    const activityTotal = toNumber(req.body.activityTotal || activitiesSnapshot.reduce((sum: number, item: any) => sum + toNumber(item.price) * toNumber(item.qty || 1), 0));
    const grandTotal = toNumber(req.body.grandTotal || amount || subtotal + addonTotal + activityTotal);

    const initialOrderStatus = normalizeOrderStatus(req.body.orderStatus || "Pending");

    const rawUserId = getAuthenticatedUserId(req) || req.body.userId || req.body.customer?.id;
    const validUserId = (rawUserId && mongoose.Types.ObjectId.isValid(String(rawUserId))) ? String(rawUserId) : undefined;

    const order = new Order({
      userId: validUserId,
      customerId: req.body.customerId || req.body.customer?.id || (validUserId ? String(validUserId) : undefined),
      productId,
      productName,
      categoryName,
      subcategory,
      packagePrice: toNumber(packagePrice),
      subtotal,
      addonTotal,
      activityTotal,
      amount: toNumber(amount),
      grandTotal,
      paymentMethod,
      paymentStatus,
      customer: customerSnapshot,
      product: productSnapshot,
      booking: bookingSnapshot,
      addons: addonsSnapshot,
      activities: activitiesSnapshot,
      bookingDetails: buildBookingDetails(req.body),
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    console.log("========== ORDER BEFORE SAVE ==========");
    console.log(order.addons);
    console.log(order.bookingDetails);
    console.log(order.addonTotal);

    await order.save();

console.log("[orders] ORDER SAVE SUCCESS", {
  orderId: order._id,
  orderNumber: order.orderNumber,
  userId: order.userId,
  customerId: order.customerId,
  paymentStatus: order.paymentStatus,
});

console.log("[orders] ORDER ID", order._id);

console.log("======================================");
console.log("Calling notifyOrderChannels()");
console.log("======================================");

try {
  await notifyOrderChannels(order);
  console.log("notifyOrderChannels() SUCCESS");
} catch (err) {
  console.error("notifyOrderChannels() FAILED");
  console.error(err);
}

res.status(201).json(order);

  } catch (err: unknown) {
    console.error("[orders] ORDER SAVE FAILED", err);
    const message = err instanceof Error ? err.message : "Unable to create the booking order.";
    res.status(500).json({ error: message });
  }
});

router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: { id?: string; email?: string } }).user;
    const userId = user?.id;
    const userEmail = user?.email?.toLowerCase().trim();

    const queryConditions: any[] = [];
    if (userId) {
      queryConditions.push({ userId }, { customerId: userId });
    }
    if (userEmail) {
      const emailRegex = new RegExp(`^${userEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      queryConditions.push(
        { "customer.email": emailRegex },
        { "booking.email": emailRegex },
        { "bookingDetails.0.email": emailRegex },
        { "bookingDetails.email": emailRegex }
      );
    }

    const orders = await Order.find(queryConditions.length > 0 ? { $or: queryConditions } : {}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch your orders.";
    res.status(500).json({ error: message });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch orders.";
    res.status(500).json({ error: message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json(order);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch the order.";
    return res.status(500).json({ error: message });
  }
});

export default router;
