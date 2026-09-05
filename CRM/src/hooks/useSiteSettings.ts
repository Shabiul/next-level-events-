import { useEffect, useState } from 'react';
import { getApiUrl } from '../lib/api';

/**
 * Site-wide settings admins can edit from /admin/settings (contact details,
 * socials, homepage hero copy). Backed by the generic SiteContent store at
 * key "site-settings" -- see SiteSettingsView and NLE-backend's
 * siteContentRoutes.ts DEFAULTS for the same shape.
 */
export interface SiteSettings {
  phone1: string;
  phone2: string;
  whatsappNumber: string;
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  footerTagline: string;
  heroEyebrow: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroHeadlineScript: string;
  heroSubtext: string;
}

// Mirrors the backend defaults -- used until the fetch resolves (or if it
// fails), so the site never renders blank contact info / hero copy.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone1: '+91 70220 58460',
  phone2: '+91 86609 24212',
  whatsappNumber: '917022058460',
  email: 'thedecorparty.team@gmail.com',
  address:
    'Kanakapura Main Rd, near Banashankari Metro Station, Shakambari Nagar, 1st Phase, J. P. Nagar, Bengaluru, Karnataka 560070',
  instagramUrl:
    'https://www.instagram.com/thedecorparty.com_?utm_source=qr&igsh=MW15aTFvOWY0MjU1cg==',
  facebookUrl: 'https://www.facebook.com',
  footerTagline:
    "A Bengaluru-based celebration and décor studio offering bespoke balloon styling, romantic candlelight setups, milestone themes, and custom party experiences across Karnataka.",
  heroEyebrow: 'Curated Celebrations · Beautifully Styled',
  heroHeadlineLine1: 'Make Every Moment',
  heroHeadlineLine2: 'Worth',
  heroHeadlineScript: 'Remembering.',
  heroSubtext:
    'Thoughtfully styled celebrations, beautiful surprises, and unforgettable moments — brought beautifully to life.',
};

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/api/site-content/site-settings'))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.content) return;
        const parsed = JSON.parse(data.content);
        setSettings((prev) => ({ ...prev, ...parsed }));
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

export default useSiteSettings;
