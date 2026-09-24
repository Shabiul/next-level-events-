const MAX_DIMENSION = 1920;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 300 * 1024;

/**
 * Downscales + re-encodes an image file in-browser before it's uploaded, so
 * a raw 5-20MB phone/DSLR photo doesn't hit the network (or Supabase
 * Storage) at full size. Native Canvas API only -- no dependency.
 * Falls back to the original file on any error, or if the "compressed"
 * result isn't actually smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }
  if (file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
    if (!blob || blob.size >= file.size) return file;

    // Some browsers (older Safari/WebViews) silently fall back to PNG when
    // asked to encode WebP -- trust the blob's actual type, not the request.
    const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
    const newName = file.name.replace(/\.[^./]+$/, '') + `.${ext}`;
    return new File([blob], newName, { type: blob.type || file.type });
  } catch {
    return file;
  }
}
