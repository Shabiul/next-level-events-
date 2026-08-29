import { Request, Response, NextFunction } from "express";

/**
 * Tiny dependency-free fixed-window rate limiter keyed by client IP. Good
 * enough to blunt brute-force / abuse on auth + form endpoints without adding
 * a new dependency. For multi-instance deployments swap the Map for Redis.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

export function rateLimit(opts: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max } = opts;
  const message = opts.message || "Too many requests. Please try again later.";
  const buckets = new Map<string, Bucket>();

  // periodic cleanup so the Map cannot grow unbounded
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
  }, windowMs);
  if (typeof sweep.unref === "function") sweep.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}
