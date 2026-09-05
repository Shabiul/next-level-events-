import { supabase } from "../src/db/supabase.js";

/**
 * Single public bucket for every admin-uploaded asset (product/category/
 * addon/activity/slider images), organized by folder path inside it --
 * mirrors how Cloudinary's `folder` field was used ("ems/products", etc.).
 */
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "assets";

let bucketReady: Promise<void> | null = null;

/** Creates the bucket (public, so getPublicUrl works with no signing) if it doesn't exist yet. Idempotent. */
function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data: existing } = await supabase.storage.getBucket(BUCKET);
      if (existing) return;
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: "5MB",
      });
      // Ignore "already exists" races from concurrent requests; surface anything else.
      if (error && !/already exists/i.test(error.message)) throw error;
    })();
  }
  return bucketReady;
}

export interface UploadedAsset {
  url: string;
  path: string;
}

/**
 * Uploads a single file buffer to Supabase Storage under `folder/` and
 * returns its public URL. Used by every admin catalog view (products,
 * categories, add-ons, activities, sliders) in place of the old
 * unsigned-preset Cloudinary upload.
 */
export async function uploadAsset(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  folder: string
): Promise<UploadedAsset> {
  await ensureBucket();

  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "") || "misc";
  const ext = (originalName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${safeFolder}/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimetype,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
