import express, { Request, Response } from "express";
import { OrderRepository, ProductRepository } from "../src/db/repositories";
import sendEmail from "../utils/sendEmail";
import { requireAuth, requireAdmin, type AuthedRequest } from "../utils/auth";
import { postOrderToN8n } from "../services/n8n.service";
import { priceSelections } from "../utils/pricing";

const router = express.Router();

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Recompute the payable amount from the DATABASE -- never trust prices sent by
 * the client. Returns authoritative totals plus normalised add-on / activity list.
 */
export async function computeAuthoritativePricing(body: any) {
  const clampQty = (v: unknown) => Math.max(1, Math.min(99, Math.round(toNumber(v) || 1)));

  // If multiple items are provided (e.g. multi-package cart checkout)
  if (Array.isArray(body.items) && body.items.length > 0) {
    let totalPackagePrice = 0;
    let totalAddonPrice = 0;
    let totalActivityPrice = 0;
    const allAddons: any[] = [];
    const allActivities: any[] = [];
    let primaryProduct: any = null;

    for (const it of body.items) {
      const prodId = String(it.productId || it.product?._id || it.product?.id || it.id || it._id || "");
      if (!prodId) continue;
      let product = await ProductRepository.findById(prodId);
      if (!product && (it.name || it.productName || it.product?.name)) {
        product = await ProductRepository.findByName(String(it.name || it.productName || it.product?.name));
      }
      if (!product || product.active === false) {
        throw Object.assign(new Error(`Selected package "${it.name || it.productName || prodId}" is unavailable.`), { statusCode: 400 });
      }
      if (!primaryProduct) primaryProduct = product;

      const qty = clampQty(it.qty || 1);
      const linePackagePrice = toNumber(product.price) * qty;
      totalPackagePrice += linePackagePrice;

      const priceBook = new Map<string, { name: string; price: number }>();
      for (const a of Array.isArray(product.addOns) ? product.addOns : []) {
        if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
      }
      for (const a of Array.isArray(product.addons) ? product.addons : []) {
        const id = a._id || a.id;
        if (id) priceBook.set(String(id), { name: a.name, price: toNumber(a.price) });
        if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
      }
      for (const a of Array.isArray(product.activities) ? product.activities : []) {
        if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
      }

      const rawAddons = Array.isArray(it.addons) ? it.addons : (Array.isArray(it.addOns) ? it.addOns : []);
      const rawActivities = Array.isArray(it.activities) ? it.activities : [];
      const priced = await priceSelections(rawAddons, rawActivities, priceBook);

      for (const a of priced.addons) {
        if (a) {
          allAddons.push(a);
          totalAddonPrice += a.price * a.qty;
        }
      }
      for (const act of priced.activities) {
        if (act) {
          allActivities.push(act);
          totalActivityPrice += act.price * act.qty;
        }
      }
    }

    // Also price any top-level global addons/activities on the booking
    const topAddons = Array.isArray(body.addons) ? body.addons : [];
    const topActivities = Array.isArray(body.activities) ? body.activities : [];
    if (topAddons.length || topActivities.length) {
      const topBook = new Map<string, { name: string; price: number }>();
      const pricedTop = await priceSelections(topAddons, topActivities, topBook);
      for (const a of pricedTop.addons) {
        if (a) {
          allAddons.push(a);
          totalAddonPrice += a.price * a.qty;
        }
      }
      for (const act of pricedTop.activities) {
        if (act) {
          allActivities.push(act);
          totalActivityPrice += act.price * act.qty;
        }
      }
    }

    const grandTotal = totalPackagePrice + totalAddonPrice + totalActivityPrice;

    return {
      product: primaryProduct,
      packagePrice: totalPackagePrice,
      subtotal: totalPackagePrice,
      addonTotal: totalAddonPrice,
      activityTotal: totalActivityPrice,
      grandTotal,
      amount: grandTotal,
      addons: allAddons,
      activities: allActivities,
    };
  }

  // Single-product booking fallback
  const productId = String(body.productId || body.product?.id || body.product?._id || "");
  let product = await ProductRepository.findById(productId);
  if (!product && (body.productName || body.product?.name)) {
    product = await ProductRepository.findByName(String(body.productName || body.product?.name));
  }
  if (!product || product.active === false) {
    throw Object.assign(new Error("Selected package is unavailable."), { statusCode: 400 });
  }

  const packagePrice = toNumber(product.price);

  // Build price book of everything legitimately attached to this product
  const priceBook = new Map<string, { name: string; price: number }>();
  const inlineAddOns: any[] = Array.isArray(product.addOns) ? product.addOns : [];
  for (const a of inlineAddOns) {
    if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
  }

  const refAddons: any[] = Array.isArray(product.addons) ? product.addons : [];
  for (const a of refAddons) {
    if (a?._id || a?.id) {
      const id = String(a._id || a.id);
      priceBook.set(id, { name: a.name, price: toNumber(a.price) });
    }
    if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
  }

  const activityPrices: any[] = Array.isArray(product.activities) ? product.activities : [];
  for (const a of activityPrices) {
    if (a?.name) priceBook.set(String(a.name).toLowerCase(), { name: a.name, price: toNumber(a.price) });
  }

  const rawAddons = Array.isArray(body.addons) ? body.addons : (Array.isArray(body.addOns) ? body.addOns : []);
  const rawActivities = Array.isArray(body.activities) ? body.activities : [];
  const priced = await priceSelections(rawAddons, rawActivities, priceBook);

  const missingAddonIdx = priced.addons.findIndex((p) => p === null);
  if (missingAddonIdx >= 0) {
    const item = rawAddons[missingAddonIdx];
    throw Object.assign(new Error(`"${item?.name || item?.id || "item"}" is not available for this package.`), { statusCode: 400 });
  }
  const missingActivityIdx = priced.activities.findIndex((p) => p === null);
  if (missingActivityIdx >= 0) {
    const item = rawActivities[missingActivityIdx];
    throw Object.assign(new Error(`"${item?.name || item?.id || "item"}" is not available for this package.`), { statusCode: 400 });
  }

  const addons = priced.addons as NonNullable<(typeof priced.addons)[number]>[];
  const activities = priced.activities as NonNullable<(typeof priced.activities)[number]>[];

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
    id: body.product?.id || body.product?._id || body.productId || "",
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
      addOns: Array.isArray(item.addOns)
        ? item.addOns.map((addon: any) => ({
            id: addon.id || addon._id || "",
            name: addon.name || "",
            price: toNumber(addon.price || 0),
            qty: toNumber(addon.qty || 1),
            kind: addon.kind || "addon",
          }))
        : [],
    }));
  }

  const firstBooking = body.booking || {};
  return [
    {
      name: firstBooking.name || body.customer?.name || "",
      mobile: firstBooking.mobile || body.customer?.phone || "",
      location: firstBooking.location || "",
      eventDate: firstBooking.eventDate || "",
      eventTime: firstBooking.eventTime || "",
      requests: firstBooking.requests || "",
      addOns: [],
    },
  ];
}

function buildEmailHtml(order: any) {
  const booking = order.booking || {};
  const customer = order.customer || {};
  const addons = Array.isArray(order.addons) ? order.addons : [];
  const activities = Array.isArray(order.activities) ? order.activities : [];
  const addonHtml =
    addons.length > 0
      ? addons.map((item: any) => `<li>${item.name} — ₹${toNumber(item.price).toLocaleString("en-IN")}</li>`).join("")
      : "<li>None</li>";
  const activityHtml =
    activities.length > 0
      ? activities.map((item: any) => `<li>${item.name} — ₹${toNumber(item.price).toLocaleString("en-IN")}</li>`).join("")
      : "<li>None</li>";

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
    ).catch((e) => console.error("[orders] customer email failed", e));
  }

  await sendEmail(
    "thedecorparty.team@gmail.com",
    `New booking received — ${order.orderNumber}`,
    buildEmailHtml(order)
  ).catch((e) => console.error("[orders] team email failed", e));

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
  }).catch((e) => console.error("[orders] n8n post failed", e));
}

export async function buildOrderForBooking(
  body: any,
  opts: {
    userId?: string;
    paymentStatus: "pending" | "paid" | "failed" | "cancelled";
    paymentMethod: "razorpay" | "whatsapp";
    razorpay?: { orderId?: string; paymentId?: string; signature?: string };
  }
) {
  const isMultiItem = Array.isArray(body.items) && body.items.length > 0;
  const firstItem = isMultiItem ? body.items[0] : null;

  const productId = String(
    body.productId ||
    (firstItem ? firstItem.productId || firstItem.product?._id || firstItem.product?.id || firstItem.id || firstItem._id : "") ||
    body.product?.id ||
    body.product?._id ||
    ""
  );

  const productName = String(
    body.productName ||
    (isMultiItem ? body.items.map((i: any) => i.name || i.productName || i.product?.name).filter(Boolean).join(" + ") : "") ||
    body.product?.name ||
    ""
  );

  const categoryName = String(
    body.categoryName ||
    (firstItem ? firstItem.categoryName || firstItem.product?.categoryName : "") ||
    body.product?.categoryName ||
    (isMultiItem ? "Multi-Package" : "")
  );

  const subcategory = String(
    body.subcategory ||
    (firstItem ? firstItem.subcategory || firstItem.product?.subcategory : "") ||
    ""
  );

  const bookingDetails = Array.isArray(body.bookingDetails) && body.bookingDetails.length > 0
    ? body.bookingDetails
    : (isMultiItem && body.items.some((i: any) => Array.isArray(i.bookingDetails) && i.bookingDetails.length > 0)
        ? body.items.flatMap((i: any) => i.bookingDetails || [])
        : [body.booking || body.customer || {}]);

  if (!productName || !bookingDetails?.length) {
    throw Object.assign(new Error("Missing required booking information."), { statusCode: 400 });
  }

  const pricing = await computeAuthoritativePricing(body);
  const firstBooking = Array.isArray(bookingDetails) ? bookingDetails[0] : {};

  return {
    user_id: opts.userId || null,
    customer_id: opts.userId || null,
    product_id: productId || null,
    product_name: productName,
    category_name: categoryName,
    subcategory: subcategory || "",
    package_price: pricing.packagePrice,
    subtotal: pricing.subtotal,
    addon_total: pricing.addonTotal,
    activity_total: pricing.activityTotal,
    amount: pricing.amount,
    grand_total: pricing.grandTotal,
    payment_method: opts.paymentMethod,
    payment_status: opts.paymentStatus,
    order_status: "Pending",
    customer_snapshot: buildCustomerSnapshot(body, firstBooking),
    product_snapshot: isMultiItem
      ? {
          items: body.items.map((i: any) => ({
            id: i.productId || i.product?._id || i.product?.id || i.id,
            name: i.name || i.productName || i.product?.name,
            qty: i.qty || 1,
            price: toNumber(i.price || i.packagePrice || 0),
            categoryName: i.categoryName || i.product?.categoryName || "",
            image: i.image || i.productImage || i.product?.image || "",
          })),
        }
      : buildProductSnapshot({ ...body, product: { ...(body.product || {}), price: pricing.packagePrice } }),
    booking_snapshot: buildBookingSnapshot(body, firstBooking),
    addons_snapshot: pricing.addons,
    activities_snapshot: pricing.activities,
    booking_details: buildBookingDetails(body),
    status_history: [{ status: "Pending", updatedAt: new Date() }],
    razorpay_order_id: opts.razorpay?.orderId || null,
    razorpay_payment_id: opts.razorpay?.paymentId || null,
    razorpay_signature: opts.razorpay?.signature || null,
  };
}

export { notifyOrderChannels };

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user!.id;
    const paymentMethod = req.body.paymentMethod === "razorpay" ? "razorpay" : "whatsapp";

    const orderPayload = await buildOrderForBooking(req.body, { userId, paymentStatus: "pending", paymentMethod });
    const order = await OrderRepository.create(orderPayload);

    console.log("[orders] created", { orderId: order.id, orderNumber: (order as any).orderNumber, userId, amount: order.amount });

    if (order.product_id) {
      ProductRepository.incrementOrderCount(order.product_id).catch(() => {});
    }

    void notifyOrderChannels(order);

    return res.status(201).json(order);
  } catch (err: any) {
    console.error("[orders] create failed", err);
    return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || "Unable to create booking." });
  }
});

router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user!.id;
    const orders = await OrderRepository.listByUser(userId);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Unable to fetch orders." });
  }
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { orders } = await OrderRepository.listAdmin({ limit: 100 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Unable to fetch orders." });
  }
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthedRequest;
    const id = String(req.params.id);
    const order = await OrderRepository.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const owns = String(order.userId) === user!.id || String(order.customerId) === user!.id;
    if (!owns && user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have access to this order." });
    }

    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Unable to fetch order." });
  }
});

export default router;
