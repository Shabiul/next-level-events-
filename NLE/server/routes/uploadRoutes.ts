import express, { Request, Response } from "express";
import multer from "multer";
import { requireAuth, type AuthedRequest } from "../utils/auth";
import { uploadAsset } from "../utils/storage";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches every admin view's own client-side check
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/uploads -- multipart form: `file` (required), `folder` (optional,
 * e.g. "ems/products"). Replaces the old direct-to-Cloudinary unsigned-preset
 * upload: every admin catalog view (products, categories, add-ons,
 * activities, sliders) now uploads here instead, landing in Supabase
 * Storage. Response shape (`secure_url`) intentionally matches Cloudinary's
 * so the existing frontend upload code needed no changes beyond the URL.
 *
 * Gated on `requireAuth` only (not a specific scope): uploading an image
 * doesn't mutate any catalog data by itself -- the follow-up POST/PUT to
 * create or save the record is what's scope-checked. An orphan upload with
 * no admin/staff account behind it is inert.
 */
router.post("/", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!(req as AuthedRequest).user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const folder = typeof req.body?.folder === "string" && req.body.folder.trim() ? req.body.folder.trim() : "misc";
    const { url } = await uploadAsset(req.file.buffer, req.file.originalname, req.file.mimetype, folder);

    return res.json({ success: true, url, secure_url: url });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Upload failed" });
  }
});

export default router;
