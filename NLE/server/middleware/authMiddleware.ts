import { Request, Response, NextFunction } from "express";
import { verifyAuthToken, type AuthedRequest } from "../utils/auth.js";

/**
 * Legacy default export kept for backwards compatibility with existing route
 * imports. New code should use `requireAuth` / `requireAdmin` from utils/auth.
 */
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = typeof header === "string"
    ? (header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim())
    : undefined;

  if (!token) return res.status(401).json({ msg: "No token" });

  const payload = verifyAuthToken(token);
  if (!payload) return res.status(401).json({ msg: "Invalid token" });

  (req as AuthedRequest).user = payload;
  next();
}
