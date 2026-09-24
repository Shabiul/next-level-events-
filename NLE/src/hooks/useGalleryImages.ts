import { useState } from 'react';
import { getApiUrl } from '../services/api.service';
import { useLiveSync } from './useLiveSync';

export interface AdminGalleryImage {
  _id: string;
  imageUrl: string;
  title?: string;
  category?: string;
  order: number;
  active: boolean;
}

const CACHE_KEY = 'tdp_cached_gallery_images';

let memoryImages: AdminGalleryImage[] = [];
try {
  const saved = localStorage.getItem(CACHE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) memoryImages = parsed;
  }
} catch {
  // ignore storage failures
}

/** Gallery images added/removed/reordered from the CRM Gallery tab, kept live via useLiveSync. */
export function useGalleryImages() {
  const [images, setImages] = useState<AdminGalleryImage[]>(memoryImages);

  useLiveSync(async (force) => {
    try {
      const cacheBuster = force ? `?_t=${Date.now()}` : '';
      const res = await fetch(getApiUrl(`/api/gallery${cacheBuster}`), { cache: 'no-store' });
      const data = res.ok ? await res.json() : [];
      if (Array.isArray(data)) {
        memoryImages = data;
        setImages(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // ignore storage errors
        }
      }
    } catch {
      // keep whatever's already in state (cached or empty)
    }
  });

  return { galleryImages: images };
}
