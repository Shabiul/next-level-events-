// Shared pure helpers for the public Gallery page (dedup, category mapping,
// placeholder filtering). Curation data now lives entirely in the
// CRM-managed gallery_images table -- see useGalleryImages / GalleryView.

export type GalleryCategory =
  | 'ALL'
  | 'BIRTHDAYS'
  | 'BALLOON DECOR'
  | 'BABY SHOWERS'
  | 'PROPOSALS'
  | 'WEDDINGS'
  | 'ANNIVERSARIES'
  | 'CUSTOM THEMES';

export const normalizeToWebp = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url.startsWith('/') && !url.startsWith('http')) {
    url = '/' + url;
  }
  if (url.startsWith('http')) return url;
  // Strictly convert any .jpg, .jpeg, .png to .webp
  return url.replace(/\.(jpe?g|png)$/i, '.webp');
};

export const getImageDeduplicationKey = (rawUrl: string): string => {
  if (!rawUrl) return '';
  const clean = decodeURIComponent(rawUrl).split('?')[0].split('#')[0].toLowerCase();
  const parts = clean.split('/');
  const filename = parts[parts.length - 1] || clean;
  // Remove file extension, non-alphanumeric chars, and trailing plural 's'
  const stem = filename
    .replace(/\.(jpg|jpeg|png|webp|avif|gif)$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, '');
  return stem || clean;
};

export const isRealPhoto = (url?: string): url is string =>
  !!url && !/unsplash\.com|placehold|via\.placeholder|dummyimage/i.test(url);

export const mapCategoryToFilter = (catName?: string, name?: string): GalleryCategory => {
  const c = (catName || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (c.includes('birthday') || n.includes('birthday') || n.includes('bday') || n.includes('kids')) return 'BIRTHDAYS';
  if (c.includes('balloon') || n.includes('balloon') || n.includes('arch') || n.includes('garland') || n.includes('ring')) return 'BALLOON DECOR';
  if (c.includes('baby') || n.includes('baby') || n.includes('cradle') || n.includes('shower') || n.includes('welcome baby')) return 'BABY SHOWERS';
  if (c.includes('proposal') || n.includes('proposal') || n.includes('marry me') || n.includes('rose day')) return 'PROPOSALS';
  if (c.includes('wedding') || n.includes('wedding') || n.includes('haldi') || n.includes('mehendi') || n.includes('sangeet') || c.includes('festival')) return 'WEDDINGS';
  if (c.includes('anniversary') || n.includes('anniversary') || c.includes('romantic') || n.includes('cabana') || n.includes('candlelight') || c.includes('dinner')) return 'ANNIVERSARIES';
  return 'CUSTOM THEMES';
};
