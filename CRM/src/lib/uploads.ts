import { getApiUrl } from './api';

/**
 * Every admin catalog view (products, categories, add-ons, activities,
 * sliders) uploads images here -- the backend stores them in Supabase
 * Storage and hands back a public URL. Response shape matches what the
 * old direct-to-Cloudinary upload returned (`secure_url`), so call sites
 * only needed their URL constant swapped, nothing else.
 */
export const UPLOAD_URL = getApiUrl('/api/uploads');
