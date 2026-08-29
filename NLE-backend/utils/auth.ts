import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Shared authentication helpers. Previously every route re-implemented JWT
 * decoding with a literal `"secret"` fallback -- that meant an unset
 * JWT_SECRET let anyone forge admin tokens. This module is the single source
 * of truth for token signing / verification and route guards.
 */

const isProd = process.env.NODE_ENV === "production";

let cachedSecret: string | null = null;

export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    cachedSecret = secret;
    return secret;
  }

  if (isProd) {
    // Never boot a production server with a weak/absent signing key.
    throw new Error(
      "JWT_SECRET is missing or too short (min 16 chars). Refusing to start in production."
    );
  }

  console.warn(
    "⚠️  JWT_SECRET is not set (or < 16 chars). Using an insecure dev-only fallback. " +
      "Set JWT_SECRET in .env before deploying."
  );
  cachedSecret = "dev-only-insecure-secret-change-me";
  return cachedSecret;
}

export interface TokenPayload {
  id: string;
  role: "user" | "admin";
}

export function signAuthToken(payload: TokenPayload, expiresIn: jwt.SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded && typeof decoded === "object" && "id" in decoded) {
      const d = decoded as Record<string, unknown>;
      return {
        id: String(d.id),
        role: d.role === "admin" ? "admin" : "user",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function extractBearer(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (typeof header !== "string") return undefined;
  return header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim();
}

export type AuthedRequest = Request & { user?: TokenPayload };

/** Attaches `req.user` when a valid token is present; never rejects. */
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) (req as AuthedRequest).user = payload;
  }
  next();
}

/** Rejects the request unless a valid token is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  (req as AuthedRequest).user = payload;
  next();
}

/** Rejects the request unless the caller is an authenticated admin. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  if (payload.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  (req as AuthedRequest).user = payload;
  next();
}

/** Returns the authenticated user id if a valid token is present, else undefined. */
export function optionalUserId(req: Request): string | undefined {
  const token = extractBearer(req);
  const payload = token ? verifyAuthToken(token) : null;
  return payload?.id;
}
