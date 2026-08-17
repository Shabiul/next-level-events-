import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import Order from "../models/Order";

const router = express.Router();

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

router.get("/products", authMiddleware, (req: Request, res: Response) => {
  if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
    return res.status(403).json({ msg: "Not admin" });
  }

  res.json("Admin access granted");
});
router.get("/orders", authMiddleware, async (req: Request, res: Response) => {
  console.log("====================================");
  console.log("ADMIN /orders HIT");
  console.log("User:", (req as any).user);
  console.log("Query:", req.query);

  try {
    if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
      console.log("NOT ADMIN");
      return res.status(403).json({ msg: "Not admin" });
    }

    console.log("ADMIN VERIFIED");

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const sortBy = String(req.query.sortBy || "createdAt");
    const sortDir = String(req.query.sortDir || "desc");

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    console.log("Mongo Query:", query);

    const orders = await Order.find(query)
      .sort({ [sortBy]: sortDir === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("Orders Found:", orders.length);

    const total = await Order.countDocuments(query);

    console.log("Total:", total);

    return res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("ADMIN ORDERS ERROR");
    console.error(err);

    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/orders/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
      return res.status(403).json({ msg: "Not admin" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json(order);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch order.";
    return res.status(500).json({ error: message });
  }
});

async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userRole = (req as Request & { user?: { role?: string } }).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ msg: "Not admin" });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { orderStatus, paymentStatus } = req.body || {};
    const nextOrderStatus = typeof orderStatus === "string" ? normalizeOrderStatus(orderStatus) : undefined;
    const nextPaymentStatus = typeof paymentStatus === "string" ? paymentStatus : undefined;

    const updateOps: Record<string, unknown> = {};

    if (nextOrderStatus && existingOrder.orderStatus !== nextOrderStatus) {
      updateOps.$set = { ...(updateOps.$set || {}), orderStatus: nextOrderStatus };
      updateOps.$push = {
        statusHistory: {
          status: nextOrderStatus,
          updatedAt: new Date(),
        },
      };
    }

    if (nextPaymentStatus && ["pending", "paid", "failed", "cancelled"].includes(nextPaymentStatus)) {
      updateOps.$set = { ...(updateOps.$set || {}), paymentStatus: nextPaymentStatus as "pending" | "paid" | "failed" | "cancelled" };
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateOps, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log('[ADMIN ORDER STATUS UPDATED]', {
      order: updatedOrder.orderNumber || req.params.id,
      oldStatus: existingOrder.orderStatus,
      newStatus: updatedOrder.orderStatus,
      updatedBy: (req as Request & { user?: { id?: string; email?: string } }).user?.id || (req as Request & { user?: { id?: string; email?: string } }).user?.email || 'unknown',
      time: new Date().toISOString(),
    });

    return res.status(200).json(updatedOrder);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}

router.patch("/orders/:id/status", authMiddleware, updateOrderStatus);
router.put("/orders/:id/status", authMiddleware, updateOrderStatus);

router.delete("/orders/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
      return res.status(403).json({ msg: "Not admin" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ success: true, message: "Order deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to delete order.";
    return res.status(500).json({ error: message });
  }
});

export default router;
