import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Order from "../models/Order";
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

/**
 * Check Razorpay configuration
 */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.log("ℹ️ Razorpay keys not configured. Running with built-in Offline Mock Payment Simulator.");
}

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create Payment Order (supports real Razorpay & offline mock simulation)
 */
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        entity: "order",
        amount: Math.round(Number(amount) * 100),
        amount_paid: 0,
        amount_due: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: receipt || `receipt_${Date.now()}`,
        status: "created",
        attempts: 0,
        notes: notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
      console.log("💳 [Offline Mode] Generated mock payment order:", mockOrder.id);
      return res.status(200).json(mockOrder);
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log("========== Creating Razorpay Order ==========");
    console.log("Options:", options);

    const order = await razorpay.orders.create(options);

    console.log("========== Razorpay Order Created ==========");
    console.log(order);

    return res.status(200).json(order);
  } catch (error: any) {
    console.error("========== Razorpay Create Order Error ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to create order",
      error,
    });
  }
});

/**
 * Verify Payment (supports real signatures & offline mock signatures)
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = req.body;

    console.log("[payment] verify request", {
      razorpay_order_id,
      razorpay_payment_id,
      hasOrderPayload: Boolean(orderPayload),
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const isMockPayment = String(razorpay_order_id).startsWith("order_mock_") || !process.env.RAZORPAY_KEY_SECRET;

    if (!isMockPayment) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }
    } else {
      console.log("✅ [Offline Mode] Verified mock payment order:", razorpay_order_id);
    }

    if (razorpay_payment_id) {
      const existingOrder = await Order.findOne({
        razorpayPaymentId: razorpay_payment_id,
      });

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          order: existingOrder,
        });
      }
    }

    if (orderPayload) {
      const rawUserId = getAuthenticatedUserId(req) || orderPayload.userId || orderPayload.customer?.id;
      const validUserId = (rawUserId && mongoose.Types.ObjectId.isValid(String(rawUserId))) ? String(rawUserId) : undefined;
      const payload = {
        ...orderPayload,
        userId: validUserId,
        customerId: orderPayload.customerId || orderPayload.customer?.id || (validUserId ? String(validUserId) : undefined),
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      };

      console.log("[payment] saving verified order payload", payload);

      const order = new Order(payload);
      await order.save();

      console.log("[payment] verified order saved", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      });

      // Non-blocking notification
      void postOrderToN8n({
        orderNumber: order.orderNumber,
        orderId: order._id,
        customer: order.customer,
        productId: order.productId,
        productName: order.productName,
        categoryName: order.categoryName,
        subcategory: order.subcategory,
        packagePrice: order.packagePrice,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        bookingDetails: order.bookingDetails,
        addons: order.addons,
        activities: order.activities,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        razorpaySignature: order.razorpaySignature,
        createdAt: order.createdAt,
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("========== Payment Verify Error ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Payment verification failed",
    });
  }
});

export default router;