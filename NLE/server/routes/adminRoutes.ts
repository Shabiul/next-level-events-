import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAdmin, requirePermission } from "../utils/auth.js";
import { getRazorpayInstance, hasRazorpayKeys } from "../utils/razorpay.js";
import { OrderRepository, UserRepository, DbUser } from "../src/db/repositories.js";
import { supabase } from "../src/db/supabase.js";
import {
  syncUserToSupabaseAuth,
  updateSupabaseAuthMetadata,
  deleteUserFromSupabaseAuth,
} from "../src/db/supabaseAuth.js";

const router = express.Router();

const STAFF_SCOPES = [
  "categories", "products", "addons", "activities",
  "orders", "payments", "enquiries", "users", "settings",
] as const;

function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((p): p is string => typeof p === "string" && (STAFF_SCOPES as readonly string[]).includes(p));
}

function publicStaff(user: DbUser) {
  return {
    id: user.id,
    _id: user.id,
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    email: user.email || "",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    createdAt: user.created_at,
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

router.get("/products", authMiddleware, (req: Request, res: Response) => {
  if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
    return res.status(403).json({ msg: "Not admin" });
  }

  res.json("Admin access granted");
});

router.get("/orders", requirePermission("orders"), async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const sortBy = String(req.query.sortBy || "createdAt");
    const sortDir = String(req.query.sortDir || "desc") as "asc" | "desc";

    const result = await OrderRepository.listAdmin({
      search,
      status,
      page,
      limit,
      sortBy,
      sortDir,
    });

    return res.json({
      orders: result.orders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    console.error("ADMIN ORDERS ERROR", err);
    return res.status(500).json({ error: err.message || "Failed to load orders" });
  }
});

router.get("/orders/:id", requirePermission("orders"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const order = await OrderRepository.findById(id);
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
    const id = String(req.params.id);
    const { orderStatus, paymentStatus } = req.body || {};
    const nextOrderStatus = typeof orderStatus === "string" ? normalizeOrderStatus(orderStatus) : undefined;
    const nextPaymentStatus = typeof paymentStatus === "string" ? paymentStatus : undefined;

    const updated = await OrderRepository.updateStatus(id, nextOrderStatus, nextPaymentStatus);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("[ADMIN ORDER STATUS UPDATED]", {
      order: updated.orderNumber || id,
      newStatus: updated.orderStatus,
      newPaymentStatus: updated.paymentStatus,
      time: new Date().toISOString(),
    });

    return res.status(200).json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}

router.patch("/orders/:id/status", requirePermission("orders"), updateOrderStatus);
router.put("/orders/:id/status", requirePermission("orders"), updateOrderStatus);

router.delete("/orders/:id", requirePermission("orders"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await OrderRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ success: true, message: "Order deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to delete order.";
    return res.status(500).json({ error: message });
  }
});

router.get("/payments", requirePermission("payments"), async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const sortBy = String(req.query.sortBy || "createdAt");
    const sortDir = String(req.query.sortDir || "desc") as "asc" | "desc";

    const result = await OrderRepository.listAdmin({
      search,
      paymentMethod: "razorpay",
      paymentStatus: status,
      page,
      limit,
      sortBy,
      sortDir,
    });

    // Compute summary totals for collected amounts
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("grand_total")
      .eq("payment_method", "razorpay")
      .eq("payment_status", "paid");

    const totalCollected = (paidOrders || []).reduce((acc, row) => acc + Number(row.grand_total || 0), 0);
    const paidCount = paidOrders?.length || 0;

    return res.json({
      payments: result.orders,
      summary: { totalCollected, paidCount },
      pagination: { page, limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load payments" });
  }
});

router.patch("/payments/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const paymentStatus = String(req.body?.paymentStatus || "").trim();
    if (!["pending", "paid", "failed", "cancelled"].includes(paymentStatus)) {
      return res.status(400).json({ error: "paymentStatus must be one of pending, paid, failed, cancelled" });
    }

    const updated = await OrderRepository.updateStatus(id, undefined, paymentStatus);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});

router.get("/payments/razorpay-status", requirePermission("payments"), async (_req: Request, res: Response) => {
  if (!hasRazorpayKeys) {
    return res.json({ configured: false, connected: false, message: "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set." });
  }

  const razorpay = getRazorpayInstance()!;
  const maskedKeyId = String(process.env.RAZORPAY_KEY_ID).replace(/^(.{8}).+(.{4})$/, "$1…$2");

  try {
    await razorpay.orders.all({ count: 1 });
    return res.json({ configured: true, connected: true, keyId: maskedKeyId, message: "Razorpay credentials are valid and working." });
  } catch (err: any) {
    const statusCode = err?.statusCode || err?.status;
    const description = err?.error?.description || err?.message || "Unknown error";
    const authFailed = statusCode === 401;
    return res.json({
      configured: true,
      connected: false,
      keyId: maskedKeyId,
      message: authFailed
        ? "Razorpay rejected these credentials (401 Unauthorized) -- key_id/key_secret are wrong or revoked."
        : `Razorpay API call failed: ${description}`,
    });
  }
});

router.get("/staff", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const staff = await UserRepository.listStaff();
    return res.json({ staff: staff.map(publicStaff), scopes: STAFF_SCOPES });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load staff" });
  }
});

router.post("/staff", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, permissions } = req.body || {};
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "First name, email, and password are required." });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const sanitizedPermissions = sanitizePermissions(permissions);

    // Register user in Supabase Auth with email_confirm: true (no email verification required)
    const authResult = await syncUserToSupabaseAuth({
      email: normalizedEmail,
      password: String(password),
      role: "staff",
      firstName: String(firstName).trim(),
      lastName: String(lastName || "").trim(),
      permissions: sanitizedPermissions,
      confirmEmail: true,
    });

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const staff = await UserRepository.create({
      ...(authResult.authId ? { id: authResult.authId } : {}),
      first_name: String(firstName).trim(),
      last_name: String(lastName || "").trim(),
      email: normalizedEmail,
      password_hash: hashedPassword,
      role: "staff",
      permissions: sanitizedPermissions,
    });

    return res.status(201).json({ staff: publicStaff(staff) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create staff" });
  }
});

router.patch("/staff/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const target = await UserRepository.findById(id);
    if (!target || target.role !== "staff") {
      return res.status(404).json({ error: "Staff account not found." });
    }

    const updates: Partial<DbUser> = {};
    if (req.body?.permissions !== undefined) updates.permissions = sanitizePermissions(req.body.permissions);
    if (typeof req.body?.firstName === "string") updates.first_name = req.body.firstName.trim();
    if (typeof req.body?.lastName === "string") updates.last_name = req.body.lastName.trim();

    const updated = await UserRepository.update(id, updates);
    if (updated && updated.email) {
      void updateSupabaseAuthMetadata(updated.email, {
        first_name: updated.first_name,
        last_name: updated.last_name,
        permissions: updated.permissions,
        role: "staff",
      });
    }
    return res.json({ staff: updated ? publicStaff(updated) : null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update staff" });
  }
});

router.delete("/staff/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const target = await UserRepository.findById(id);
    if (!target || target.role !== "staff") {
      return res.status(404).json({ error: "Staff account not found." });
    }
    await UserRepository.delete(id);
    if (target.email) {
      void deleteUserFromSupabaseAuth(target.email);
    }
    return res.json({ success: true, message: "Staff account removed." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to remove staff" });
  }
});

export default router;
