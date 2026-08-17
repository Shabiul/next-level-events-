import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/User";
import sendEmail from "../utils/sendEmail";

const ADMIN_EMAIL = "admin@nextlevelevents.com";
const isKnownAdminEmail = (email: string) => email.toLowerCase() === ADMIN_EMAIL;

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const normalizedEmail = typeof user.email === "string" ? user.email : "";
    const role = user.role === "admin" || isKnownAdminEmail(normalizedEmail) ? "admin" : "user";
    if (role === "admin" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: String(user._id),
        wishlist: Array.isArray(user.wishlist) ? user.wishlist.map((item) => String(item)) : [],
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        firstName: user.firstName || email.split("@")[0],
        lastName: user.lastName || "",
        email: user.email,
        role,
        phone: user.phone || "",
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
    res.status(500).json({ msg: "Server error" });
  }
};

export default { login };
