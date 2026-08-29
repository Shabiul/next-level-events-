import express, { Request, Response } from "express";
import Enquiry from "../models/Enquiry";
import sendEmail from "../utils/sendEmail";
import { optionalUserId, requireAdmin } from "../utils/auth";

const router = express.Router();

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean = (v: unknown, max = 4000) => String(v ?? "").trim().slice(0, max);

// naive in-memory throttle: max 5 submissions / 10 min per IP
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

/** Public: submit a contact enquiry. Persists to DB, then emails the team. */
router.post("/", async (req: Request, res: Response) => {
  try {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimited(ip)) {
      return res.status(429).json({ success: false, message: "Too many messages. Please try again shortly." });
    }

    const name = clean(req.body.name, 120);
    const phone = clean(req.body.phone, 20);
    const email = clean(req.body.email, 160).toLowerCase();
    const message = clean(req.body.message, 4000);
    const eventType = clean(req.body.eventType, 120);
    const eventDate = clean(req.body.eventDate, 40);

    if (name.length < 2) return res.status(422).json({ success: false, message: "Please enter your name." });
    if (!/^[+\d][\d\s-]{6,}$/.test(phone)) {
      return res.status(422).json({ success: false, message: "Please enter a valid phone number." });
    }
    if (email && !isEmail(email)) {
      return res.status(422).json({ success: false, message: "Please enter a valid email address." });
    }
    if (message.length < 5) return res.status(422).json({ success: false, message: "Please add a short message." });

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      message,
      eventType,
      eventDate,
      userId: optionalUserId(req) || null,
      source: clean(req.body.source, 40) || "contact-form",
    });

    // Notify the team -- non-blocking, never fails the request.
    void sendEmail(
      process.env.CONTACT_INBOX || process.env.EMAIL_USER || "thedecorparty.team@gmail.com",
      `New enquiry from ${name}`,
      `<h2>New website enquiry</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Phone:</strong> ${phone}</p>
       <p><strong>Email:</strong> ${email || "—"}</p>
       <p><strong>Event:</strong> ${eventType || "—"} ${eventDate ? `on ${eventDate}` : ""}</p>
       <p><strong>Message:</strong></p>
       <p>${message.replace(/</g, "&lt;")}</p>`
    ).catch((e) => console.error("[contact] email failed", e?.message || e));

    return res.status(201).json({ success: true, message: "Thanks! We'll be in touch shortly.", id: enquiry._id });
  } catch (err) {
    console.error("[contact] submit failed", err);
    return res.status(500).json({ success: false, message: "Could not send your message. Please try again." });
  }
});

/** Admin: list enquiries. */
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
    const filter: Record<string, unknown> =
      req.query.status && req.query.status !== "all" ? { status: String(req.query.status) } : {};
    const [items, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Enquiry.countDocuments(filter),
    ]);
    res.json({ success: true, data: { items, total, page, limit } });
  } catch (err) {
    console.error("[contact] list failed", err);
    res.status(500).json({ success: false, message: "Failed to load enquiries." });
  }
});

/** Admin: update enquiry status. */
router.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allowed = ["new", "in_progress", "responded", "closed"];
    const status = String(req.body.status || "");
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const updated = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Enquiry not found." });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("[contact] update failed", err);
    res.status(500).json({ success: false, message: "Failed to update enquiry." });
  }
});

export default router;
