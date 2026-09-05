import { getApiUrl } from './api';

/**
 * Returns the dynamic upload endpoint based on current configured API base URL.
 */
export const getUploadUrl = () => getApiUrl('/api/uploads');

/**
 * Every admin catalog view (products, categories, add-ons, activities,
 * sliders) uploads images here -- the backend stores them in Supabase
 * Storage and hands back a public URL.
 * Evaluates dynamically to support live-swapped API endpoints.
 */
export const UPLOAD_URL = {
  toString: getUploadUrl,
  valueOf: getUploadUrl,
  [Symbol.toPrimitive]: getUploadUrl,
} as unknown as string;
