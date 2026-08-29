import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User";
import OtpToken from "../models/OtpToken";
import { signAuthToken } from "../utils/auth";
import { sendSms } from "../services/sms.service";
import { rateLimit } from "../middleware/rateLimit";

const router = express.Router();

const CODE_TTL_MS = 5 * 60 * 1000; // OTP valid for 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // min gap between sends to one number
const MAX_VERIFY_ATTEMPTS = 5;
const isProd = process.env.NODE_ENV === "production";

// Per-IP cap on OTP requests (the per-phone cooldown is enforced separately).
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many OTP requests. Please wait a few minutes.",
});

/** Normalise an Indian/E.164 mobile number to `+<digits>`. */
function normalizePhone(raw: unknown): string | null {
  let s = String(raw ?? "").replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) s = "+" + s.slice(1).replace(/\D/g, "");
  else {
    const digits = s.replace(/\D/g, "");
    if (digits.length === 10) s = "+91" + digits;
    else if (digits.length === 12 && digits.startsWith("91")) s = "+" + digits;
    else if (digits.length === 11 && digits.startsWith("0")) s = "+91" + digits.slice(1);
    else s = "+" + digits;
  }
  return /^\+\d{10,15}$/.test(s) ? s : null;
}

/** POST /request { phone } -> generates + sends a fresh OTP. */
router.post("/request", requestLimiter, async (req: Request, res: Response) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      return res.status(422).json({ success: false, message: "Enter a valid mobile number." });
    }

    const recent = await OtpToken.findOne({ phone }).sort({ createdAt: -1 });
    if (recent && Date.now() - new Date(recent.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - new Date(recent.lastSentAt).getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait}s before requesting another code.`, retryAfter: wait });
    }

    // one active code per number
    await OtpToken.deleteMany({ phone });

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 10);
    await OtpToken.create({
      phone,
      codeHash,
      purpose: "login",
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    const sms = await sendSms(phone, `${code} is your The Decor Party verification code. It expires in 5 minutes.`);
    if (!sms.success) {
      await OtpToken.deleteMany({ phone });
      return res.status(502).json({ success: false, message: "Couldn't send the code right now. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent.",
      resendIn: RESEND_COOLDOWN_MS / 1000,
      // Surface the code ONLY in dev when no real SMS provider delivered it.
      ...(sms.mocked && !isProd ? { devCode: code } : {}),
    });
  } catch (err) {
    console.error("[otp] request failed", err);
    return res.status(500).json({ success: false, message: "Could not start verification." });
  }
});

/** POST /verify { phone, code } -> logs the user in, creating the account if new. */
router.post("/verify", requestLimiter, async (req: Request, res: Response) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code ?? "").replace(/\D/g, "");
    if (!phone || code.length !== 6) {
      return res.status(422).json({ success: false, message: "Enter the 6-digit code." });
    }

    const token = await OtpToken.findOne({ phone }).sort({ createdAt: -1 });
    if (!token || new Date(token.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "This code has expired. Request a new one." });
    }
    if (token.attempts >= MAX_VERIFY_ATTEMPTS) {
      await OtpToken.deleteMany({ phone });
      return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code." });
    }

    const ok = await bcrypt.compare(code, token.codeHash);
    if (!ok) {
      token.attempts += 1;
      await token.save();
      const left = MAX_VERIFY_ATTEMPTS - token.attempts;
      return res.status(400).json({ success: false, message: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Incorrect code." });
    }

    await OtpToken.deleteMany({ phone });

    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      user = new User({ phone, password: "", role: "user", firstName: "", lastName: "" });
      await user.save();
      isNewUser = true;
    }

    const role = user.role === "admin" ? "admin" : "user";
    const authToken = signAuthToken({ id: String(user._id), role });

    return res.status(200).json({
      success: true,
      token: authToken,
      isNewUser,
      user: {
        id: String(user._id),
        wishlist: Array.isArray(user.wishlist) ? user.wishlist.map((w: unknown) => String(w)) : [],
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || phone,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role,
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pincode: user.pincode || "",
        photoURL: user.photoURL || "",
        avatar: user.photoURL || "",
      },
    });
  } catch (err) {
    console.error("[otp] verify failed", err);
    return res.status(500).json({ success: false, message: "Could not verify the code." });
  }
});

export default router;
