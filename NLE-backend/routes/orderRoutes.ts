import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import Addon from "../models/Addon";
import sendEmail from "../utils/sendEmail";
import { requireAuth, requireAdmin, optionalUserId, type AuthedRequest } from "../utils/auth";
import { postOrderToN8n } from "../services/n8n.service";

const router = express.Router();

function getAuthenticatedUserId(req: Request) {
  return optionalUserId(req);
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Recompute the payable amount from the DATABASE -- never trust prices sent by
 * the client. Returns the authoritative totals plus a normalised add-on /
 * activity list priced from Product + Addon documents.
 */
export async function computeAuthoritativePricing(body: any) {
  const product = await Product.findById(body.productId).lean<any>();
  if (!product || product.active === false) {
    throw Object.assign(new Error("Selected package is unavailable."), { statusCode: 400 });
  }

  const packagePrice = toNumber(product.price);

  // Build a price book of everything legitimately attached to this product.
  const priceBook = new Map<string, { name: string; price: number }>();
  const inlineAddOns: any[] = Array.isArray(product.addOns) ? product.addOns : [];
  for (const a of inlineAddOns) {
    if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
  }
  const refIds: string[] = (Array.isArray(product.addons) ? product.addons : [])
    .map((x: any) => String(x))
    .filter((x: string) => mongoose.Types.ObjectId.isValid(x));
  if (refIds.length) {
    const addonDocs = await Addon.find({ _id: { $in: refIds }, active: { $ne: false } }).lean<any[]>();
    for (const a of addonDocs) {
      priceBook.set(String(a._id), { name: a.name, price: toNumber(a.price) });
      if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
    }
  }
  const activityPrices: any[] = Array.isArray(product.activities) ? product.activities : [];
  for (const a of activityPrices) {
    if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
  }

  const priceItem = (item: any, kind: "addon" | "activity") => {
    const byId = item?.id && priceBook.get(String(item.id));
    const byName = item?.name && priceBook.get(String(item.name).toLowerCase());
    const match = byId || byName;
    if (!match) {
      throw Object.assign(
        new Error(`"${item?.name || item?.id || "item"}" is not available for this package.`),
        { statusCode: 400 }
      );
    }
    const qty = Math.max(1, Math.min(99, Math.round(toNumber(item.qty || 1))));
    return { id: String(item.id || ""), name: match.name, price: match.price, qty, kind };
  };

  const rawAddons = Array.isArray(body.addons) ? body.addons : [];
  const rawActivities = Array.isArray(body.activities) ? body.activities : [];
  const addons = rawAddons.map((i: any) => priceItem(i, "addon"));
  const activities = rawActivities.map((i: any) => priceItem(i, "activity"));

  const addonTotal = addons.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const activityTotal = activities.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const subtotal = packagePrice;
  const grandTotal = subtotal + addonTotal + activityTotal;

  return {
    product,
    packagePrice,
    subtotal,
    addonTotal,
    activityTotal,
    grandTotal,
    amount: grandTotal,
    addons,
    activities,
  };
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
  console.log(`[orders] notifying channels for ${order.orderNumber}`);
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

/**
 * Build (but do not save) an Order document from a booking payload. Prices are
 * always recomputed from the DB via computeAuthoritativePricing -- client money
 * fields are ignored. Shared by POST /api/orders and the payment-verify flow.
 */
export async function buildOrderForBooking(
  body: any,
  opts: {
    userId?: string;
    paymentStatus: "pending" | "paid" | "failed" | "cancelled";
    paymentMethod: "razorpay" | "whatsapp";
    razorpay?: { orderId?: string; paymentId?: string; signature?: string };
  }
) {
  const { productId, productName, categoryName, subcategory, bookingDetails } = body;

  if (!productId || !productName || !categoryName || !bookingDetails?.length) {
    throw Object.assign(new Error("Missing required booking information."), { statusCode: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(String(productId))) {
    throw Object.assign(new Error("Invalid package reference."), { statusCode: 400 });
  }

  const pricing = await computeAuthoritativePricing(body);
  const firstBooking = Array.isArray(bookingDetails) ? bookingDetails[0] : {};

  return new Order({
    userId: opts.userId,
    customerId: opts.userId,
    productId,
    productName,
    categoryName,
    subcategory,
    packagePrice: pricing.packagePrice,
    subtotal: pricing.subtotal,
    addonTotal: pricing.addonTotal,
    activityTotal: pricing.activityTotal,
    amount: pricing.amount,
    grandTotal: pricing.grandTotal,
    paymentMethod: opts.paymentMethod,
    paymentStatus: opts.paymentStatus,
    customer: buildCustomerSnapshot(body, firstBooking),
    product: buildProductSnapshot({ ...body, product: { ...(body.product || {}), price: pricing.packagePrice } }),
    booking: buildBookingSnapshot(body, firstBooking),
    addons: pricing.addons,
    activities: pricing.activities,
    bookingDetails: buildBookingDetails(body),
    razorpayOrderId: opts.razorpay?.orderId,
    razorpayPaymentId: opts.razorpay?.paymentId,
    razorpaySignature: opts.razorpay?.signature,
  });
}

export { notifyOrderChannels };

/**
 * Create a booking. Requires an authenticated customer. paymentStatus is ALWAYS
 * "pending" here; it is only promoted to "paid" by the server-verified
 * /api/payment/verify flow.
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user!.id;
    const paymentMethod = req.body.paymentMethod === "razorpay" ? "razorpay" : "whatsapp";

    let order;
    try {
      order = await buildOrderForBooking(req.body, { userId, paymentStatus: "pending", paymentMethod });
    } catch (e: any) {
      return res.status(e?.statusCode || 400).json({ success: false, message: e?.message || "Invalid booking." });
    }

    await order.save();
    console.log("[orders] created", { orderId: order._id, orderNumber: order.orderNumber, userId, amount: order.amount });

    try {
      await notifyOrderChannels(order);
    } catch (err) {
      console.error("[orders] notifyOrderChannels failed", err);
    }

    return res.status(201).json(order);
  } catch (err: unknown) {
    console.error("[orders] create failed", err);
    const message = err instanceof Error ? err.message : "Unable to create the booking order.";
    return res.status(500).json({ success: false, message });
  }
});

router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user!.id;
    const orders = await Order.find({ $or: [{ userId }, { customerId: userId }] }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch your orders.";
    res.status(500).json({ success: false, message });
  }
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch orders.";
    res.status(500).json({ success: false, message });
  }
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthedRequest;
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const owns = String(order.userId) === user!.id || String(order.customerId) === user!.id;
    if (!owns && user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have access to this order." });
    }
    return res.json(order);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch the order.";
    return res.status(500).json({ success: false, message });
  }
});

export default router;
