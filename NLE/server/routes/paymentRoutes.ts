import express, { Request, Response } from "express";
import crypto from "crypto";
import "dotenv/config";
import { OrderRepository, ProductRepository } from "../src/db/repositories";
import { requireAuth, type AuthedRequest } from "../utils/auth";
import { getRazorpayInstance, hasRazorpayKeys } from "../utils/razorpay";
import {
  buildOrderForBooking,
  computeAuthoritativePricing,
  notifyOrderChannels,
} from "./orderRoutes";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";
const mockAllowed = !isProd && process.env.ALLOW_MOCK_PAYMENTS === "true";

if (!hasRazorpayKeys) {
  console.log(
    mockAllowed
      ? "ℹ️  Razorpay keys not set. ALLOW_MOCK_PAYMENTS=true -> dev mock payment simulator is ENABLED."
      : "⚠️  Razorpay keys not set and mock disabled. /api/payment/* will return 503 until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured."
  );
}

function paymentsUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    message: "Online payments are not configured. Please contact support to complete your booking.",
  });
}

async function authoritativeAmountPaise(orderPayload: any): Promise<number> {
  const pricing = await computeAuthoritativePricing(orderPayload);
  return Math.round(pricing.amount * 100);
}

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

    // Idempotency check against database
    const existing = await OrderRepository.findByPaymentId(razorpay_payment_id);
    if (existing) {
      return res.status(200).json({ success: true, message: "Payment already verified", order: existing });
    }

    let expectedPaise: number;
    try {
      expectedPaise = await authoritativeAmountPaise(orderPayload);
    } catch (e: any) {
      return res.status(e?.statusCode || 400).json({ success: false, message: e?.message || "Invalid booking." });
    }

    if (!isMock) {
      const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }

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

    let orderData;
    try {
      orderData = await buildOrderForBooking(orderPayload, {
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

    let order;
    try {
      order = await OrderRepository.create(orderData);
    } catch (e: any) {
      // Unique constraint conflict on razorpay_payment_id
      const winner = await OrderRepository.findByPaymentId(razorpay_payment_id);
      if (winner) return res.status(200).json({ success: true, message: "Payment verified", order: winner });
      throw e;
    }

    if (order.product_id) {
      ProductRepository.incrementOrderCount(order.product_id).catch(() => {});
    }

    try {
      void notifyOrderChannels(order);
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
