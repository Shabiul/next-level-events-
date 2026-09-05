import "dotenv/config";
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";

import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import siteContentRoutes from "./routes/siteContentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/ai.routes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addonRoutes from "./routes/addonRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { connectDatabase } from "./src/db/connection.js";
import { ProductRepository } from "./src/db/repositories.js";
import helmet from "helmet";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // API server returning JSON & crawler HTML previews
  })
);

interface ProductShareData {
  _id?: string;
  name?: string;
  description?: string;
  image?: string;
}

const defaultSeoDescription = "Premium surprise and decoration experiences curated for every celebration.";

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildProductSharePage = (_req: Request, product: ProductShareData | null) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.PUBLIC_URL || "https://www.thedecorparty.com";
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const productId = product?._id ? String(product._id) : "";
  const productUrl = productId ? `${normalizedBaseUrl}/product/${productId}` : `${normalizedBaseUrl}/products`;
  const title = product?.name || "TheDecorParty";
  const description = product?.description || defaultSeoDescription;
  const image = product?.image || `${normalizedBaseUrl}/og-default.jpg`;
  // Recommended default OG image dimensions (1200x630) for large preview cards
  const imageWidth = 1200;
  const imageHeight = 630;

  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedImage = escapeHtml(image);
  const escapedUrl = escapeHtml(productUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta property="og:image:width" content="${imageWidth}" />
    <meta property="og:image:height" content="${imageHeight}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="TheDecorParty" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImage}" />
    <meta name="twitter:image:alt" content="${escapedTitle}" />
    <link rel="canonical" href="${escapedUrl}" />
    <meta http-equiv="refresh" content="1;url=${escapedUrl}" />
    <script>
      // Use replace so the share page does not remain in history
      window.location.replace(${JSON.stringify(productUrl)});
    </script>
  </head>
  <body>
    Redirecting to product... If you are not redirected, <a href="${escapedUrl}">click here</a>.
    <noscript>
      <meta http-equiv="refresh" content="1;url=${escapedUrl}" />
      <p>JavaScript is disabled; <a href="${escapedUrl}">click here to continue</a>.</p>
    </noscript>
  </body>
</html>`;
};

// Backend is deployed independently from the frontend repository. Do not
// attempt to read or serve frontend files (Vite/React) from the backend.
// The dedicated share route below generates full HTML directly for crawlers.

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});

// Restrict CORS to known frontends. Set CORS_ORIGINS (comma-separated) to add
// more; FRONTEND_URL and CRM_URL (the standalone admin console) are always
// allowed. In non-production, localhost is allowed.
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.CRM_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"]
      : []),
  ]
    .map((o) => (o || "").trim().replace(/\/$/, ""))
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server) with no Origin header.
      if (!origin) {
        return callback(null, true);
      }
      const clean = origin.replace(/\/$/, "");
      if (allowedOrigins.has(clean)) {
        return callback(null, true);
      }
      // In non-production, allow any localhost/127.0.0.1 port dynamically
      if (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
        return callback(null, true);
      }
      // Allow Vercel preview & production deployments (*.vercel.app)
      if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(clean)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("THIS IS MY NEW SERVER");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/share/product/:productId", async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const product = await ProductRepository.findById(productId);

    if (!product) {
      return res
        .status(404)
        .type("html")
        .send("<!DOCTYPE html><html><body>Product not found</body></html>");
    }

    const html = buildProductSharePage(req, product);

    // Add crawler-friendly headers
    res.type("html");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
    res.setHeader("X-Robots-Tag", "index, follow");
    // ETag for lightweight caching
    const etag = crypto.createHash("md5").update(html, "utf8").digest("hex");
    res.setHeader("ETag", `"${etag}"`);

    return res.send(html);
  } catch (err) {
    console.error("[SHARE] Failed to render share page:", err);
    // Don't leak internal error details to the client.
    return res.status(500).type("html").send("<!DOCTYPE html><html><body>Something went wrong</body></html>");
  }
});

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addons", addonRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth/otp", otpRoutes);
app.use("/api/uploads", uploadRoutes);

app.get("/product/:productId", (req: Request, res: Response) => {
  const frontend = (process.env.FRONTEND_URL || "https://www.thedecorparty.com").replace(/\/$/, "");
  const url = `${frontend}/product/${encodeURIComponent(String(req.params.productId))}`;
  console.log("[SHARE] Redirecting user to frontend product page", url);
  return res.redirect(302, url);
});

// In standalone production (non-Vercel), serve built frontend static assets
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distDir = path.resolve(process.cwd(), "dist");
  app.use(express.static(distDir));
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/share/")) return next();
    res.sendFile(path.join(distDir, "index.html"), (err) => {
      if (err) next();
    });
  });
} else {
  // In dev / non-production, Vite dev server serves frontend assets on :3000.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/")) return next();
    if (req.method === "GET") {
      return res.status(404).send("Not Found");
    }
    return next();
  });
}
// On Vercel the app is imported as a serverless request handler (see
// api/index.ts) -- app.listen() must not run there, Vercel owns the server.
// Everywhere else (local dev, any other Node host) this is the normal entry.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 5000);
  (async () => {
    try {
      await connectDatabase();
    } catch (err) {
      console.error("Database connection initialization error:", err);
    }
    app.listen(port, () => {
      console.log(`🚀 Express server running on port ${port}`);
    });
  })();
} else {
  // In Vercel serverless, run startup diagnostics safely without crashing cold starts
  connectDatabase().catch((err) => {
    console.warn("⚠️ Vercel serverless connectDatabase deferred warning:", err?.message || err);
  });
}

export default app;
