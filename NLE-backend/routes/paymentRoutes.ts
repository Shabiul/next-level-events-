import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import "dotenv/config";
import Order from "../models/Order";
import { requireAuth, type AuthedRequest } from "../utils/auth";
import {
  buildOrderForBooking,
  computeAuthoritativePricing,
  notifyOrderChannels,
} from "./orderRoutes";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";
const hasRazorpayKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/**
 * The offline "mock" simulator used to run silently whenever the Razorpay keys
 * were absent -- which meant a client could self-issue a "paid" booking. It is
 * now OFF unless explicitly enabled for local dev, and can never run in prod.
 */
const mockAllowed = !isProd && process.env.ALLOW_MOCK_PAYMENTS === "true";

if (!hasRazorpayKeys) {
  console.log(
    mockAllowed
      ? "ℹ️  Razorpay keys not set. ALLOW_MOCK_PAYMENTS=true -> dev mock payment simulator is ENABLED."
      : "⚠️  Razorpay keys not set and mock disabled. /api/payment/* will return 503 until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured."
  );
}

const getRazorpayInstance = () => {
  if (!hasRazorpayKeys) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
};

function paymentsUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    message: "Online payments are not configured. Please contact support to complete your booking.",
  });
}

/** Amount (in paise) the customer must actually pay, computed from the DB. */
async function authoritativeAmountPaise(orderPayload: any): Promise<number> {
  const pricing = await computeAuthoritativePricing(orderPayload);
  return Math.round(pricing.amount * 100);
}

/**
 * Create a payment order. Requires auth. The amount is derived from the booking
 * payload against the database -- the client-supplied `amount` is ignored.
 */
router.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const orderPayload = req.body.orderPayload || req.body;
    let amountPaise: number;
    try {
      amountPaise = await authoritativeAmountPaise(orderPayload);
    } catch (e: any) {
      return res.status(e?.statusCode || 400).json({ success: false, message: e?.message || "Invalid booking." });
    }
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const receipt = String(req.body.receipt || `rcpt_${Date.now()}`).slice(0, 40);
    const notes = { ...(req.body.notes || {}), userId: (req as AuthedRequest).user!.id };

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      if (!mockAllowed) return paymentsUnavailable(res);
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        entity: "order",
        amount: amountPaise,
        amount_paid: 0,
        amount_due: amountPaise,
        currency: "INR",
        receipt,
        status: "created",
        attempts: 0,
        notes,
        created_at: Math.floor(Date.now() / 1000),
      };
      console.log("💳 [dev mock] created", mockOrder.id, amountPaise);
      return res.status(200).json(mockOrder);
    }

    const order = await razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt, notes });
    return res.status(200).json(order);
  } catch (error: any) {
    console.error("[payment] create-order error", error?.error?.description || error?.message || error);
    return res.status(500).json({ success: false, message: "Unable to create order" });
  }
});

/**
 * Verify a payment and persist the booking as PAID. The backend is the sole
 * source of truth: it checks the Razorpay signature, re-fetches the Razorpay
 * order to confirm the paid amount + currency, recomputes the booking price
 * from the DB, and is idempotent on razorpay_payment_id.
 */
router.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user!.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderPayload } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }
    if (!orderPayload) {
      return res.status(400).json({ success: false, message: "Missing booking payload" });
    }

    const isMock = String(razorpay_order_id).startsWith("order_mock_");
    if (isMock && !mockAllowed) {
      return res.status(400).json({ success: false, message: "Invalid payment order" });
    }
    if (!isMock && !hasRazorpayKeys) {
      return paymentsUnavailable(res);
    }

    // Idempotency -- a payment id can only ever back one booking.
    const existing = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) {
      return res.status(200).json({ success: true, message: "Payment already verified", order: existing });
    }

    // 1. Recompute what this booking should cost, from the database.
    let expectedPaise: number;
    try {
      expectedPaise = await authoritativeAmountPaise(orderPayload);
    } catch (e: any) {
      return res.status(e?.statusCode || 400).json({ success: false, message: e?.message || "Invalid booking." });
    }

    if (!isMock) {
      // 2. Signature check.
      const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }

      // 3. Confirm the money actually captured at Razorpay matches.
      const razorpay = getRazorpayInstance()!;
      const rzOrder = await razorpay.orders.fetch(razorpay_order_id);
      const paidPaise = Number(rzOrder.amount_paid ?? rzOrder.amount);
      if (String(rzOrder.currency).toUpperCase() !== "INR") {
        return res.status(400).json({ success: false, message: "Unsupported payment currency" });
      }
      if (paidPaise !== expectedPaise) {
        console.warn("[payment] amount mismatch", { razorpay_order_id, paidPaise, expectedPaise });
        return res.status(400).json({ success: false, message: "Payment amount mismatch" });
      }
    }

    // 4. Persist the booking as PAID -- prices come from the DB, not the client.
    let order;
    try {
      order = await buildOrderForBooking(orderPayload, {
        userId,
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });
    } catch (e: any) {
      return res.status(e?.statusCode || 400).json({ success: false, message: e?.message || "Invalid booking." });
    }

    try {
      await order.save();
    } catch (e: any) {
      // Unique index race on razorpayPaymentId -> another request won; return it.
      if (e?.code === 11000) {
        const winner = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
        if (winner) return res.status(200).json({ success: true, message: "Payment verified", order: winner });
      }
      throw e;
    }

    try {
      await notifyOrderChannels(order);
    } catch (err) {
      console.error("[payment] notifyOrderChannels failed", err);
    }

    return res.status(200).json({ success: true, message: "Payment verified successfully", order });
  } catch (error: any) {
    console.error("[payment] verify error", error?.message || error);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

export default router;
