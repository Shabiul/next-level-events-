import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OtpRepository, UserRepository, WishlistRepository } from "../src/db/repositories";
import { signAuthToken } from "../utils/auth";
import { sendSms } from "../services/sms.service";
import { rateLimit } from "../middleware/rateLimit";

const router = express.Router();

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30s
const MAX_VERIFY_ATTEMPTS = 5;
const isProd = process.env.NODE_ENV === "production";

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many OTP requests. Please wait a few minutes.",
});

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

router.post("/request", requestLimiter, async (req: Request, res: Response) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      return res.status(422).json({ success: false, message: "Enter a valid mobile number." });
    }

    const recent = await OtpRepository.findRecent(phone);
    if (recent && Date.now() - new Date(recent.last_sent_at).getTime() < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - new Date(recent.last_sent_at).getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait}s before requesting another code.`, retryAfter: wait });
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 10);
    await OtpRepository.create({
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    const sms = await sendSms(phone, `${code} is your The Decor Party verification code. It expires in 5 minutes.`);
    if (!sms.success) {
      await OtpRepository.deleteForPhone(phone);
      return res.status(502).json({ success: false, message: "Couldn't send the code right now. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent.",
      resendIn: RESEND_COOLDOWN_MS / 1000,
      ...(sms.mocked && !isProd ? { devCode: code } : {}),
    });
  } catch (err) {
    console.error("[otp] request failed", err);
    return res.status(500).json({ success: false, message: "Could not start verification." });
  }
});

router.post("/verify", requestLimiter, async (req: Request, res: Response) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code ?? "").replace(/\D/g, "");
    if (!phone || code.length !== 6) {
      return res.status(422).json({ success: false, message: "Enter the 6-digit code." });
    }

    const token = await OtpRepository.findRecent(phone);
    if (!token || new Date(token.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "This code has expired. Request a new one." });
    }
    if (token.attempts >= MAX_VERIFY_ATTEMPTS) {
      await OtpRepository.deleteForPhone(phone);
      return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code." });
    }

    const ok = await bcrypt.compare(code, token.code_hash);
    if (!ok) {
      await OtpRepository.incrementAttempts(token.id, token.attempts + 1);
      const left = MAX_VERIFY_ATTEMPTS - (token.attempts + 1);
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Incorrect code.",
      });
    }

    await OtpRepository.deleteForPhone(phone);

    let user = await UserRepository.findByPhone(phone);
    let isNewUser = false;
    if (!user) {
      user = await UserRepository.create({
        phone,
        password_hash: "",
        role: "user",
        first_name: "",
        last_name: "",
      });
      isNewUser = true;
    }

    const role = user.role === "admin" ? "admin" : "user";
    const authToken = signAuthToken({ id: user.id, role });
    const wishlist = await WishlistRepository.getByUserId(user.id);

    return res.status(200).json({
      success: true,
      token: authToken,
      isNewUser,
      user: {
        id: user.id,
        _id: user.id,
        wishlist,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || phone,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role,
        gender: user.gender || "",
        dateOfBirth: user.date_of_birth || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pincode: user.pincode || "",
        photoURL: user.photo_url || "",
        avatar: user.photo_url || "",
      },
    });
  } catch (err) {
    console.error("[otp] verify failed", err);
    return res.status(500).json({ success: false, message: "Could not verify the code." });
  }
});

export default router;
