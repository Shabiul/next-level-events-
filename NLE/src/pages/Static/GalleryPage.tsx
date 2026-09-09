import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUpRight, ArrowRight, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import type { AdminProduct } from '../../types';
import {
  BIRTHDAY,
  ANNIVERSARY,
  DINNERS,
  MOST_BOOKED,
  HERO_SLIDES,
  CAT_ICONS,
} from '../../data';
import { SERVICE_GALLERY_IMAGES } from '../../data/servicesData';
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

export type GalleryCategory =
  | 'ALL'
  | 'BIRTHDAYS'
  | 'BALLOON DECOR'
  | 'BABY SHOWERS'
  | 'PROPOSALS'
  | 'WEDDINGS'
  | 'ANNIVERSARIES'
  | 'CUSTOM THEMES';

export interface GalleryImageItem {
  id: string;
  title: string;
  category: GalleryCategory;
  serviceName: string;
  serviceRoute: string;
  image: string;
  tag: string;
  price?: string | number;
  description?: string;
  product?: AdminProduct;
}

/* Inline botanical sprig -- matches the Packages / About accent */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 24" fill="none" className={className} aria-hidden="true">
    <path d="M2 12h44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M46 12c6 0 10-4 12-9M46 12c6 0 10 4 12 9M46 12c7 0 12 0 16-3M46 12c7 0 12 0 16 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="70" cy="12" r="2.4" fill="currentColor" />
  </svg>
);

const THEME_TO_GALLERY: Record<string, { category: GalleryCategory; tag: string; serviceName: string }> = {
  'birthdays': { category: 'BIRTHDAYS', tag: 'Birthday Decor', serviceName: 'Birthdays' },
  '1st birthday designs': { category: 'BIRTHDAYS', tag: '1st Birthday', serviceName: '1st Birthday Designs' },
  'boy theme': { category: 'BIRTHDAYS', tag: 'Kids Theme', serviceName: 'Birthdays' },
  'kids activities': { category: 'BIRTHDAYS', tag: 'Kids Activities', serviceName: 'Kids Activities' },
  'baby showers': { category: 'BABY SHOWERS', tag: 'Baby Shower', serviceName: 'Baby Showers' },
  'welcome baby': { category: 'BABY SHOWERS', tag: 'Welcome Baby', serviceName: 'Welcome Baby' },
  'naming ceremonies': { category: 'BABY SHOWERS', tag: 'Naming Ceremony', serviceName: 'Naming Ceremonies' },
  'annaprashan': { category: 'BABY SHOWERS', tag: 'Annaprashan', serviceName: 'Annaprashan' },
  'terrace proposals': { category: 'PROPOSALS', tag: 'Terrace Proposal', serviceName: 'Proposal Setup' },
  'heart arch setup': { category: 'PROPOSALS', tag: 'Heart Arch', serviceName: 'Proposal Setup' },
  'candlelight pathway': { category: 'PROPOSALS', tag: 'Candlelight Pathway', serviceName: 'Proposal Setup' },
  'proposal setup': { category: 'PROPOSALS', tag: 'Proposal Setup', serviceName: 'Proposal Setup' },
  'pre & post wedding': { category: 'WEDDINGS', tag: 'Pre & Post Wedding', serviceName: 'Pre & Post Wedding' },
  'groom-to-be': { category: 'WEDDINGS', tag: 'Groom-to-Be', serviceName: 'Pre & Post Wedding' },
  'bride-to-be': { category: 'WEDDINGS', tag: 'Bride-to-Be', serviceName: 'Pre & Post Wedding' },
  'national festivals': { category: 'WEDDINGS', tag: 'Festival Decor', serviceName: 'National Festivals' },
  'anniversary celebrations': { category: 'ANNIVERSARIES', tag: 'Anniversary', serviceName: 'Anniversary Celebrations' },
  'cabana setups': { category: 'ANNIVERSARIES', tag: 'Cabana Nights', serviceName: 'Cabana Setups' },
  'simple wall decors': { category: 'CUSTOM THEMES', tag: 'Simple Wall Decor', serviceName: 'Simple Wall Decors' },
  'gift hampers': { category: 'CUSTOM THEMES', tag: 'Gift Hampers', serviceName: 'Gift Hampers' },
  'return gifts': { category: 'CUSTOM THEMES', tag: 'Return Gifts', serviceName: 'Return Gifts' },
  'flower bouquets': { category: 'CUSTOM THEMES', tag: 'Flower Bouquets', serviceName: 'Flower Bouquets' },
  'customised cakes': { category: 'CUSTOM THEMES', tag: 'Customised Cakes', serviceName: 'Customised Cakes' },
  'opening decors': { category: 'CUSTOM THEMES', tag: 'Opening Decor', serviceName: 'Opening Decors' },
  'graduation': { category: 'CUSTOM THEMES', tag: 'Graduation', serviceName: 'Graduation' },
  'bike & car deliveries': { category: 'CUSTOM THEMES', tag: 'Bike & Car Surprise', serviceName: 'Bike & Car Deliveries' },
  'car boot surprises': { category: 'CUSTOM THEMES', tag: 'Car Boot Surprise', serviceName: 'Car Boot Surprises' },
  'live eateries / catering': { category: 'CUSTOM THEMES', tag: 'Live Eateries', serviceName: 'Live Eateries / Catering' },
};

interface ProductMeta {
  title: string;
  serviceName: string;
  price?: string;
  description?: string;
  tag?: string;
}

const SPECIFIC_IMAGE_PRODUCTS: Record<string, ProductMeta> = {
  // Simple Wall Decors
  '/simple-wall-decor.jpg': {
    title: 'Gold Chrome & Black Birthday Ring Arch',
    serviceName: 'Simple Wall Decors',
    price: '₹1,299',
    description: 'Circular ring backdrop with metallic chrome balloons, fairy lights, and happy birthday neon foil banner.',
    tag: 'Simple Wall Decor',
  },
  '/simple-wall-decors.jpg': {
    title: 'Minimalist Pastel Wall Decor',
    serviceName: 'Simple Wall Decors',
    price: '₹1,599',
    description: 'Clean pastel balloon wall arrangement with foil accents and warm ambient fairy lighting.',
    tag: 'Simple Wall Decor',
  },
  '/SIMPLE WALL FOR HOME PAGE.jpg': {
    title: 'Elegant Home Wall Balloon Styling',
    serviceName: 'Simple Wall Decors',
    price: '₹1,899',
    description: 'Sophisticated balloon garland wall styling tailored for apartment living rooms and intimate spaces.',
    tag: 'Simple Wall Decor',
  },

  // Proposals & Romantic
  '/terrace propsal set up.jpg': {
    title: '4ft MARRY ME LED Marquee Terrace Proposal',
    serviceName: 'Proposal Setup',
    price: '₹8,999',
    description: 'Grand proposal setup featuring 4-foot illuminated MARRY ME marquee letters, plush red carpet aisle, and heart arch.',
    tag: 'Terrace Proposal',
  },
  '/terrace-proposal.jpg': {
    title: 'Candlelight Terrace Proposal Setup',
    serviceName: 'Proposal Setup',
    price: '₹6,999',
    description: 'Rooftop candlelight pathway with sheer drapes, lanterns, fresh rose petals and fairy light canopy.',
    tag: 'Terrace Proposal',
  },
  '/terrace.jpg': {
    title: 'Bespoke Open-Air Terrace Proposal',
    serviceName: 'Proposal Setup',
    price: '₹7,999',
    description: 'Romantic terrace ambience with panoramic city views, illuminated heart arch, and candlelit aisle.',
    tag: 'Terrace Proposal',
  },
  '/heart arch set up 1.jpg': {
    title: 'Floral & Balloon Heart Arch Proposal',
    serviceName: 'Proposal Setup',
    price: '₹4,999',
    description: 'Heart-shaped arch styling with premium florals, balloons, fairy lights and red carpet entrance.',
    tag: 'Heart Arch',
  },
  '/heart arch set up 2.jpg': {
    title: 'Red Rose Heart Arch Installation',
    serviceName: 'Proposal Setup',
    price: '₹5,499',
    description: 'Luxe floral heart arch with glowing neon signage and fresh rose petal pathway.',
    tag: 'Heart Arch',
  },
  '/heart arch set up 3.jpg': {
    title: 'Illuminated Neon Heart Arch Setup',
    serviceName: 'Proposal Setup',
    price: '₹5,999',
    description: 'Spectacular illuminated heart backdrop with battery-operated warm candles and rose petals.',
    tag: 'Heart Arch',
  },
  '/candelight pathway 1.jpg': {
    title: 'Romantic Candlelight Pathway & Lanterns',
    serviceName: 'Proposal Setup',
    price: '₹2,999',
    description: 'Warm candlelit walkway lined with glass lanterns, fresh rose petals and ambient fairy string lights.',
    tag: 'Candlelight Pathway',
  },
  '/candelight pathway 2.jpg': {
    title: 'Petal & Lantern Candlelit Walkway',
    serviceName: 'Proposal Setup',
    price: '₹3,399',
    description: 'Intimate candlelit path with glowing lanterns and fresh botanical touches leading to the celebration.',
    tag: 'Candlelight Pathway',
  },
  '/proposal set up.jpg': {
    title: 'Romantic Marry Me Proposal Setup',
    serviceName: 'Proposal Setup',
    price: '₹5,999',
    description: 'Complete proposal styling with marquee lighting, floral heart backdrop, and fairy light canopy.',
    tag: 'Proposal Setup',
  },
  '/proposal set up 1.jpg': {
    title: 'Neon Love & Heart Arch Proposal',
    serviceName: 'Proposal Setup',
    price: '₹6,499',
    description: 'Signature romantic proposal styling with neon typography, pastel balloon clusters and rose petals.',
    tag: 'Proposal Setup',
  },
  '/proposal set up 2.jpg': {
    title: 'Luxe Candlelight Pathway Proposal',
    serviceName: 'Proposal Setup',
    price: '₹6,999',
    description: 'Ambient candle pathway with floral heart frame and backdrop styling for outdoor and indoor venues.',
    tag: 'Proposal Setup',
  },

  // Cabana Setups
  '/kkkk.jpg': {
    title: 'Rooftop Candlelight Cabana Dining',
    serviceName: 'Cabana Setups',
    price: '₹3,499',
    description: 'Dreamy sheer drape cabana with fairy lights, plush floor seating, rose petals, and warm candle illumination.',
    tag: 'Cabana Nights',
  },
  '/cabana.jpg': {
    title: 'Bohemian Terrace Canopy Setup',
    serviceName: 'Cabana Setups',
    price: '₹4,999',
    description: 'Chic boho macrame cabana with pampas grass, warm lanterns, and low-table candlelight dining arrangement.',
    tag: 'Cabana Nights',
  },
  '/cabana set up 2.jpg': {
    title: 'Romantic Sunset Cabana Canopy',
    serviceName: 'Cabana Setups',
    price: '₹3,799',
    description: 'Weather-resistant canopy draped in ivory chiffon with warm fairy light curtains and cosy cushions.',
    tag: 'Cabana Nights',
  },
  '/cabana set up 3.jpg': {
    title: 'Fairytale Fairy Light Cabana Retreat',
    serviceName: 'Cabana Setups',
    price: '₹4,199',
    description: 'Intimate glowing cabana canopy with 200+ warm LED fairy lights and fresh rose floral garland.',
    tag: 'Cabana Nights',
  },
  '/cabana set up 4.jpg': {
    title: 'Private Garden Cabana Dining',
    serviceName: 'Cabana Setups',
    price: '₹4,599',
    description: 'Secluded outdoor cabana setup with low wooden table, lanterns, floral arrangements and floor cushions.',
    tag: 'Cabana Nights',
  },

  // Birthdays & Milestones
  '/birthday.jpg': {
    title: 'Signature Milestone Birthday Arch',
    serviceName: 'Birthdays',
    price: '₹2,499',
    description: 'Grand circular birthday arch with organic pastel and chrome balloon clusters and LED neon signage.',
    tag: 'Birthday Decor',
  },
  '/birthday-landscape.jpg': {
    title: 'Pastel Balloon Ring Birthday Setup',
    serviceName: 'Birthdays',
    price: '₹2,999',
    description: 'Organic pastel balloon ring installation with personalised name banner and fairy string lights.',
    tag: 'Birthday Decor',
  },
  '/BIRTHDAY FOR HOME PAGE.jpg': {
    title: 'Grand Birthday Celebration Backdrop',
    serviceName: 'Birthdays',
    price: '₹3,499',
    description: 'Full-stage birthday styling with balloon garland, cake cylinder tables, and custom backdrop printing.',
    tag: 'Birthday Decor',
  },
  '/1ST BIRTHDAY FOR HOME PAGE.jpg': {
    title: '1st Milestone Birthday Celebration Backdrop',
    serviceName: '1st Birthday Designs',
    price: '₹4,499',
    description: 'Whimsical 1st birthday theme styling with giant milestone numbers, balloon clouds, and props.',
    tag: '1st Birthday',
  },
  '/1ss.jpg': {
    title: 'Prince & Princess 1st Birthday Arch',
    serviceName: '1st Birthday Designs',
    price: '₹3,999',
    description: 'Regal pastel balloon arch with crown props, organic balloon garland, and personalised name board.',
    tag: '1st Birthday',
  },
  '/bb.jpg': {
    title: 'Organic Pastel Birthday Balloon Wall',
    serviceName: 'Birthdays',
    price: '₹2,799',
    description: 'Modern organic balloon wall styling with customised color scheme and ambient backlighting.',
    tag: 'Birthday Decor',
  },
  '/t2.jpg': {
    title: 'Themed Milestone Birthday Decor Suite',
    serviceName: 'Birthdays',
    price: '₹3,199',
    description: 'Milestone birthday decor featuring organic arch, cylinder cake plinths, and warm illumination.',
    tag: 'Birthday Decor',
  },
  '/kids theme.jpg': {
    title: 'Pastel Teddy Bear & Organic Cloud Arch',
    serviceName: 'Birthdays',
    price: '₹3,499',
    description: 'Dreamy pastel balloon arch with 3D teddy bear mascot cutouts, cloud stands, and personalised name board.',
    tag: 'Kids Theme',
  },
  '/boy theme.jpg': {
    title: 'Little Explorer Boy Kids Birthday Theme',
    serviceName: 'Birthdays',
    price: '₹6,999',
    description: 'Themed printed backdrop with balloon arch & cluster styling, cake table, and matching themed props.',
    tag: 'Kids Theme',
  },

  // Baby Showers & Homecoming
  '/baby-shower.jpg': {
    title: 'Dreamy Pastel Baby Shower Decor',
    serviceName: 'Baby Showers',
    price: '₹3,499',
    description: 'Gentle pastel balloon arch with mom-to-be sash, floral cradle garland, and welcome easel board.',
    tag: 'Baby Shower',
  },
  '/welcome-baby.jpg': {
    title: 'Newborn Homecoming Welcome Baby Decor',
    serviceName: 'Welcome Baby',
    price: '₹2,499',
    description: 'Pastel balloon arch, cradle floral garland, personalised welcome board, and warm fairy lighting.',
    tag: 'Welcome Baby',
  },
  '/NAMING CEREMONY CARD.jpg': {
    title: 'Namkaran Traditional Naming Ceremony Setup',
    serviceName: 'Naming Ceremonies',
    price: '₹2,999',
    description: 'Namkaran decor with floral cradle, pastel backdrop, personalised name board, and warm lighting.',
    tag: 'Naming Ceremony',
  },
  '/Annaprashan.jpg': {
    title: 'First Rice Ceremony Annaprashan Decor',
    serviceName: 'Annaprashan',
    price: '₹3,499',
    description: 'Traditional floral backdrop with ceremonial seating, marigold accents, and customized signage.',
    tag: 'Annaprashan',
  },

  // Pre & Post Wedding
  '/PRE AND POST CARD.jpg': {
    title: 'Pre & Post Wedding Celebration Styling',
    serviceName: 'Pre & Post Wedding',
    price: '₹7,999',
    description: 'Engagement / Haldi / Ring Ceremony styling with floral installations, seating decor, and lighting.',
    tag: 'Pre & Post Wedding',
  },
  '/pre and post 2.jpg': {
    title: 'Engagement Floral Stage Backdrop',
    serviceName: 'Pre & Post Wedding',
    price: '₹8,499',
    description: 'Bespoke floral stage installation with elegant drapery, ambient uplighting, and couple seating.',
    tag: 'Pre & Post Wedding',
  },
  '/pre and post 3.jpg': {
    title: 'Ring Ceremony Floral & Drape Installation',
    serviceName: 'Pre & Post Wedding',
    price: '₹8,999',
    description: 'Luxe floral and sheer drape backdrop designed for intimate engagement ring ceremonies.',
    tag: 'Pre & Post Wedding',
  },
  '/pre and post 5.jpg': {
    title: 'Haldi Ceremony Marigold & Drape Setup',
    serviceName: 'Pre & Post Wedding',
    price: '₹7,499',
    description: 'Vibrant marigold floral backdrop with yellow drapes, brass urlis, and festive floor cushions.',
    tag: 'Pre & Post Wedding',
  },
  '/bride to be.jpg': {
    title: 'Bride-to-Be Floral Bachelorette Decor',
    serviceName: 'Pre & Post Wedding',
    price: '₹4,999',
    description: 'Chic bachelorette party setup with pastel balloon arch, bride-to-be neon sign, and photo props.',
    tag: 'Bride-to-Be',
  },
  '/groom to be.jpg': {
    title: 'Groom-to-Be Milestone Celebration Setup',
    serviceName: 'Pre & Post Wedding',
    price: '₹4,999',
    description: 'Midnight celebration decor tailored for the groom with balloon columns and celebratory props.',
    tag: 'Groom-to-Be',
  },

  // Car & Surprises
  '/car bot.jpg': {
    title: 'Midnight Car Boot Surprise Decor',
    serviceName: 'Car Boot Surprises',
    price: '₹1,999',
    description: 'Surprise car trunk styling with fairy lights, helium balloons, photo bunting, and customized banner.',
    tag: 'Car Boot Surprise',
  },
  '/car dilver.jpg': {
    title: 'Grand Entry Car Floral Decoration',
    serviceName: 'Bike & Car Deliveries',
    price: '₹2,999',
    description: 'Fresh floral garlands styled across the bonnet and grille for a grand celebration or wedding entry.',
    tag: 'Bike & Car Surprise',
  },
  '/car deliver5.jpg': {
    title: 'Bridal Bike Floral Decoration',
    serviceName: 'Bike & Car Deliveries',
    price: '₹1,499',
    description: 'Rose and baby’s breath garland styling across the headlamp and handlebars for two-wheelers.',
    tag: 'Bike & Car Surprise',
  },

  // Activities & Other Services
  '/kids.jpg': {
    title: 'Kids Party Games & Entertainment Station',
    serviceName: 'Kids Activities',
    price: '₹2,499',
    description: 'Interactive games station with dedicated coordinator, activity materials, and party prizes.',
    tag: 'Kids Activities',
  },
  '/kids-activities.jpg': {
    title: 'Kids Activities & Entertainment Carnival',
    serviceName: 'Kids Activities',
    price: '₹3,499',
    description: 'Full activity carnival with tattoo artists, balloon modelling, and games coordinator.',
    tag: 'Kids Activities',
  },
  '/tattoo.jpg': {
    title: 'Kids Face Painting & Tattoo Station',
    serviceName: 'Kids Activities',
    price: '₹1,999',
    description: 'Skin-safe temporary tattoo and face painting artistry for children and party guests.',
    tag: 'Kids Activities',
  },
  '/gift hamper.jpg': {
    title: 'Luxury Celebration Gift Hamper',
    serviceName: 'Gift Hampers',
    price: '₹1,499',
    description: 'Curated gourmet celebration hamper with chocolates, scented candle, and personalized note card.',
    tag: 'Gift Hampers',
  },
  '/return gift.jpg': {
    title: 'Curated Celebration Return Gift Pack',
    serviceName: 'Return Gifts',
    price: '₹999',
    description: 'Premium customized party favors and return gifts packed in decorative celebration boxes.',
    tag: 'Return Gifts',
  },
  '/flower bouqets.jpg': {
    title: 'Fresh Botanical Celebration Flower Bouquet',
    serviceName: 'Flower Bouquets',
    price: '₹799',
    description: 'Hand-tied bouquet of fresh exotic roses and seasonal blossoms wrapped in eco-friendly paper.',
    tag: 'Flower Bouquets',
  },
  '/customsid cakes.jpg': {
    title: 'Artisan Customised Celebration Cake',
    serviceName: 'Customised Cakes',
    price: '₹1,899',
    description: 'Freshly baked artisanal designer cake customized to your celebration theme and flavor.',
    tag: 'Customised Cakes',
  },
  '/OPINING CARD.jpg': {
    title: 'Grand Store Opening Ribbon & Balloon Arch',
    serviceName: 'Opening Decors',
    price: '₹4,999',
    description: 'Store/office launch decor with ribbon-cutting arch, balloon columns, and brand-color styling.',
    tag: 'Opening Decor',
  },
  '/GRADUATION CARD.jpg': {
    title: 'Congrats Milestone Graduation Decor',
    serviceName: 'Graduation',
    price: '₹3,499',
    description: 'Graduation party backdrop with balloon garland, congrats bunting, and graduation photo props.',
    tag: 'Graduation',
  },
  '/NATIONAL FISTIVAL CARD.jpg': {
    title: 'Festive Tricolour Celebration Decor',
    serviceName: 'National Festivals',
    price: '₹2,999',
    description: 'Patriotic / national festival decor with themed drapes, balloon columns, and ambient lighting.',
    tag: 'Festival Decor',
  },
  '/about-purple-decor.jpg': {
    title: 'Signature Purple Milestone Suite',
    serviceName: 'Birthdays',
    price: '₹4,999',
    description: 'The Decor Party flagship purple celebration suite with organic balloon arch and fairy lighting.',
    tag: 'Signature Milestone',
  },
  '/about-aesthetic.jpg': {
    title: 'Bespoke Celebration Atmosphere Suite',
    serviceName: 'Anniversary Celebrations',
    price: '₹5,499',
    description: 'Intimate celebration atmosphere styling with warm fairy lights and curated floral installations.',
    tag: 'Atmosphere Styling',
  },
  '/about-purple-banner.jpg': {
    title: 'Luxe Editorial Celebration Backdrop',
    serviceName: 'Birthdays',
    price: '₹4,499',
    description: 'Editorial backdrop with balloon styling and customized lettering for milestone celebrations.',
    tag: 'Editorial Suite',
  },
};

const SPECIFIC_META_BY_STEM: Record<string, ProductMeta> = {};
for (const [imgUrl, meta] of Object.entries(SPECIFIC_IMAGE_PRODUCTS)) {
  const stem = getImageDeduplicationKey(imgUrl);
  if (stem) {
    SPECIFIC_META_BY_STEM[stem] = meta;
  }
}

const findSpecificMeta = (url: string): ProductMeta | undefined => {
  if (!url) return undefined;
  const stem = getImageDeduplicationKey(url);
  return SPECIFIC_META_BY_STEM[stem] || SPECIFIC_IMAGE_PRODUCTS[url];
};

// Curated sequence of existing premier setups for the gallery.
// Any newly added images (from database/CRM/dynamic uploads) will automatically appear at the bottom.
const PRESET_GALLERY_SEQUENCE: string[] = [
  // 1-30: Premier showcase spanning all celebration categories
  '/terrace propsal set up.jpg',       // 1. Proposal - 4ft Marry Me
  '/birthday.jpg',                     // 2. Birthday - Signature Arch
  '/cabana.jpg',                       // 3. Cabana - Bohemian Canopy
  '/baby-shower.jpg',                  // 4. Baby Shower - Dreamy Pastel
  '/simple-wall-decor.jpg',            // 5. Wall Decor - Gold Chrome Ring Arch
  '/heart arch set up 1.jpg',          // 6. Proposal - Heart Arch
  '/1ST BIRTHDAY FOR HOME PAGE.jpg',   // 7. 1st Birthday - Milestone Backdrop
  '/bride to be.jpg',                  // 8. Wedding - Bride to be Floral
  '/candelight pathway 1.jpg',         // 9. Proposal - Romantic Candlelight Pathway
  '/cabana set up 2.jpg',              // 10. Cabana - Romantic Sunset Canopy
  '/kids theme.jpg',                   // 11. Kids - Pastel Teddy Bear Cloud Arch
  '/welcome-baby.jpg',                 // 12. Baby - Newborn Homecoming
  '/pre and post 5.jpg',               // 13. Wedding - Haldi Ceremony Marigold
  '/car bot.jpg',                      // 14. Car Surprise - Midnight Boot
  '/terrace-proposal.jpg',             // 15. Proposal - Candlelight Terrace
  '/BIRTHDAY FOR HOME PAGE.jpg',       // 16. Birthday - Grand Celebration
  '/kkkk.jpg',                         // 17. Cabana - Rooftop Dining
  '/NAMING CEREMONY CARD.jpg',         // 18. Baby - Namkaran Ceremony
  '/pre and post 2.jpg',               // 19. Wedding - Engagement Floral Stage
  '/1ss.jpg',                          // 20. 1st Birthday - Prince & Princess
  '/groom to be.jpg',                  // 21. Wedding - Groom to be Setup
  '/simple-wall-decors.jpg',           // 22. Wall Decor - Minimalist Pastel Wall
  '/cabana set up 3.jpg',              // 23. Cabana - Fairytale Fairy Light
  '/heart arch set up 2.jpg',          // 24. Proposal - Red Rose Heart Arch
  '/boy theme.jpg',                    // 25. Kids - Little Explorer Theme
  '/Annaprashan.jpg',                  // 26. Baby - First Rice Annaprashan
  '/proposal set up 1.jpg',            // 27. Proposal - Neon Love Arch
  '/car dilver.jpg',                   // 28. Car - Grand Entry Floral
  '/about-purple-decor.jpg',           // 29. Birthday - Signature Purple Milestone
  '/pre and post 3.jpg',               // 30. Wedding - Ring Ceremony Installation

  // 31-54: Remaining curated setups
  '/terrace.jpg',
  '/SIMPLE WALL FOR HOME PAGE.jpg',
  '/heart arch set up 3.jpg',
  '/candelight pathway 2.jpg',
  '/proposal set up.jpg',
  '/proposal set up 2.jpg',
  '/cabana set up 4.jpg',
  '/birthday-landscape.jpg',
  '/bb.jpg',
  '/t2.jpg',
  '/PRE AND POST CARD.jpg',
  '/car deliver5.jpg',
  '/kids.jpg',
  '/kids-activities.jpg',
  '/tattoo.jpg',
  '/gift hamper.jpg',
  '/return gift.jpg',
  '/flower bouqets.jpg',
  '/customsid cakes.jpg',
  '/OPINING CARD.jpg',
  '/GRADUATION CARD.jpg',
  '/NATIONAL FISTIVAL CARD.jpg',
  '/about-aesthetic.jpg',
  '/about-purple-banner.jpg',
];

const PRESET_SEQUENCE_STEM_MAP = new Map<string, number>();
PRESET_GALLERY_SEQUENCE.forEach((url, rank) => {
  const stem = getImageDeduplicationKey(url);
  if (stem && !PRESET_SEQUENCE_STEM_MAP.has(stem)) {
    PRESET_SEQUENCE_STEM_MAP.set(stem, rank);
  }
});

// Also map any remaining specific image products after the curated sequence
let nextSeqRank = PRESET_GALLERY_SEQUENCE.length;
for (const key of Object.keys(SPECIFIC_IMAGE_PRODUCTS)) {
  const stem = getImageDeduplicationKey(key);
  if (stem && !PRESET_SEQUENCE_STEM_MAP.has(stem)) {
    PRESET_SEQUENCE_STEM_MAP.set(stem, nextSeqRank++);
  }
}

const CATEGORIES: GalleryCategory[] = [
  'ALL',
  'BIRTHDAYS',
  'BALLOON DECOR',
  'BABY SHOWERS',
  'PROPOSALS',
  'WEDDINGS',
  'ANNIVERSARIES',
  'CUSTOM THEMES',
];

const isRealPhoto = (url?: string): url is string =>
  !!url && !/unsplash\.com|placehold|via\.placeholder|dummyimage/i.test(url);

const mapCategoryToFilter = (catName?: string, name?: string): GalleryCategory => {
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

interface GalleryCardProps {
  item: GalleryImageItem;
  index: number;
  shouldLoad: boolean;
  onLoaded: (index: number) => void;
  onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, index, shouldLoad, onLoaded, onClick }) => {
  const [src, setSrc] = useState<string>(item.image);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasReportedDone, setHasReportedDone] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync state if item.image changes
  useEffect(() => {
    setSrc(item.image);
    setImageLoaded(false);
    setHasReportedDone(false);
  }, [item.image]);

  const handleDone = useCallback(() => {
    if (hasReportedDone) return;
    setHasReportedDone(true);
    onLoaded(index);
  }, [hasReportedDone, onLoaded, index]);

  // Check if image is already cached/complete once shouldLoad is true
  useEffect(() => {
    if (!shouldLoad || imageLoaded || hasReportedDone) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
      handleDone();
    }
  }, [shouldLoad, imageLoaded, hasReportedDone, handleDone]);

  // Safety timer: if network stalls for >1000ms, unlock next image anyway so queue never hangs
  useEffect(() => {
    if (!shouldLoad || imageLoaded || hasReportedDone) return;
    const timer = setTimeout(() => {
      handleDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [shouldLoad, imageLoaded, hasReportedDone, handleDone]);

  return (
    <div className="w-full select-none">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: (index % 10) * 0.02, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-[20px] border border-[#E6D7C5] bg-[#FFF3E6] text-left shadow-[0_12px_34px_-24px_rgba(56,25,50,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-26px_rgba(56,25,50,0.45)]"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#E6D7C5]/25">
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E6D7C5]/15 via-[#FFF3E6]/40 to-[#E6D7C5]/15 animate-pulse" />
              <div className="relative z-10 flex flex-col items-center gap-1.5 opacity-35">
                <Sparkles size={16} className="text-[#381932]" />
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#381932]">
                  {item.tag || 'Setup'} #{index + 1}
                </span>
              </div>
            </div>
          )}

          {shouldLoad && (
            <img
              ref={imgRef}
              src={src}
              alt={item.title}
              decoding="async"
              onLoad={() => {
                setImageLoaded(true);
                handleDone();
              }}
              onError={() => {
                if (src.endsWith('.webp')) {
                  setSrc(src.replace(/\.webp$/i, '.jpg'));
                } else {
                  handleDone();
                }
              }}
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.04] ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
              }`}
            />
          )}

          {/* Caption overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#25101f]/90 via-[#381932]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-poppins font-semibold uppercase tracking-[0.14em] text-[#C8B5C3]">
                  <Heart size={10} className="fill-[#C8B5C3] text-[#C8B5C3]" />
                  {item.serviceName || item.tag}
                </span>
                <p className="font-serif text-[13px] font-bold uppercase tracking-tight text-[#FFF3E6] leading-tight line-clamp-2 mt-0.5">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.price && (
                    <span className="text-[11px] font-semibold text-[#FFF3E6]/90">{item.price}</span>
                  )}
                  <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#FFF3E6] bg-[#381932]/80 px-2 py-0.5 rounded-full border border-[#FFF3E6]/20">
                    View Details ↗
                  </span>
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] shadow-md transition-transform duration-300 group-hover:scale-110">
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleBookImage = (item: GalleryImageItem) => {
    const matchedProduct = products.find(
      (p) =>
        p._id === item.id ||
        (item.id && item.id.startsWith(`pkg-${p._id}`)) ||
        p.name.toLowerCase() === item.title.toLowerCase() ||
        normalizeToWebp(p.image) === item.image
    );

    const bookingProduct: AdminProduct = matchedProduct || item.product || {
      _id: item.id,
      name: item.title,
      categoryId: (item.serviceName || item.category).toLowerCase().replace(/\s+/g, '-'),
      categoryName: item.serviceName || item.tag || item.category,
      subcategory: item.tag,
      price:
        typeof item.price === 'number'
          ? item.price
          : typeof item.price === 'string'
            ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 4999
            : 4999,
      description: item.description || `${item.title} — Premium surprise and celebration decoration package styled in Bengaluru with 100% picture-match guarantee.`,
      image: item.image,
      moreImages: [],
      badgeColor: 'purple',
      rating: 5,
      reviewCount: 18,
      inclusions: ['Premium balloon styling', 'Fairy lights & ambient backdrop', 'On-site setup by master stylist'],
      addOns: [],
      active: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    navigate(`/booking/${bookingProduct._id}`, {
      state: { product: bookingProduct, preferredMethod: 'razorpay' },
    });
  };

  const allImages = useMemo(() => {
    const list: GalleryImageItem[] = [];
    const seenUrls = new Set<string>();
    const seenKeys = new Set<string>();

    const pushItem = (item: GalleryImageItem) => {
      if (!isRealPhoto(item.image)) return;
      const webpUrl = normalizeToWebp(item.image);
      const key = getImageDeduplicationKey(webpUrl);
      const urlLower = webpUrl.toLowerCase();

      if (!key || seenUrls.has(urlLower) || seenKeys.has(key)) return;
      seenUrls.add(urlLower);
      seenKeys.add(key);

      const specific = findSpecificMeta(item.image) || findSpecificMeta(webpUrl);

      list.push({
        ...item,
        title: specific?.title || item.title,
        serviceName: specific?.serviceName || item.serviceName,
        serviceRoute: `/services/${encodeURIComponent(specific?.serviceName || item.serviceName)}`,
        tag: specific?.tag || item.tag,
        price: specific?.price || item.price,
        description: specific?.description || item.description,
        image: webpUrl,
      });
    };

    // 1. Live Admin Products
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        const cat = mapCategoryToFilter(p.categoryName, p.name);
        const price = p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined;
        const serviceName = p.categoryName || p.subcategory || 'Birthdays';
        const serviceRoute = `/services/${encodeURIComponent(serviceName)}`;

        pushItem({
          id: `pkg-${p._id}-main`,
          title: p.name,
          category: cat,
          serviceName,
          serviceRoute,
          image: p.image,
          tag: p.badge || p.subcategory || p.categoryName || 'Celebration Package',
          price,
          description: p.description,
          product: p,
        });

        if (Array.isArray(p.moreImages)) {
          p.moreImages.forEach((imgUrl, idx) => {
            pushItem({
              id: `pkg-${p._id}-more-${idx}`,
              title: `${p.name} — Detail View ${idx + 2}`,
              category: cat,
              serviceName,
              serviceRoute,
              image: imgUrl,
              tag: p.badge || p.categoryName || 'Gallery Showcase',
              price,
              description: p.description,
              product: p,
            });
          });
        }
      });
    }

    // 2. Static package sets (BIRTHDAY, ANNIVERSARY, DINNERS, MOST_BOOKED)
    const staticPackageSets = [
      { items: BIRTHDAY, cat: 'BIRTHDAYS' as GalleryCategory, defaultTag: 'Birthday Package', defaultService: 'Birthdays' },
      { items: ANNIVERSARY, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Anniversary Package', defaultService: 'Anniversary Celebrations' },
      { items: DINNERS, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Candlelight Dinner', defaultService: 'Anniversary Celebrations' },
      { items: MOST_BOOKED, cat: 'CUSTOM THEMES' as GalleryCategory, defaultTag: 'Most Booked', defaultService: 'Birthdays' },
    ];

    staticPackageSets.forEach(({ items, cat, defaultTag, defaultService }) => {
      items.forEach((p, idx) => {
        const specific = SPECIFIC_IMAGE_PRODUCTS[p.img];
        const serviceName = specific?.serviceName || (p.badge?.includes('Romantic') ? 'Anniversary Celebrations' : defaultService);
        pushItem({
          id: `static-pkg-${cat}-${idx}`,
          title: specific?.title || p.title,
          category: mapCategoryToFilter(cat, p.title),
          serviceName,
          serviceRoute: `/services/${encodeURIComponent(serviceName)}`,
          image: p.img,
          tag: specific?.tag || p.badge || defaultTag,
          price: specific?.price || p.price,
          description: specific?.description,
        });
      });
    });

    // 3. Hero and curated category icons
    HERO_SLIDES.forEach((slide, idx) => {
      const specific = SPECIFIC_IMAGE_PRODUCTS[slide.img];
      const serviceName = specific?.serviceName || 'Birthdays';
      pushItem({
        id: `hero-slide-${idx}`,
        title: specific?.title || slide.headline.replace('\n', ' '),
        category: mapCategoryToFilter(slide.chip, slide.headline),
        serviceName,
        serviceRoute: `/services/${encodeURIComponent(serviceName)}`,
        image: slide.img,
        tag: specific?.tag || slide.chip,
        price: specific?.price,
        description: specific?.description || slide.sub,
      });
    });

    CAT_ICONS.forEach((icon, idx) => {
      const specific = SPECIFIC_IMAGE_PRODUCTS[icon.img];
      const serviceName = specific?.serviceName || icon.label.replace('\n', ' ');
      pushItem({
        id: `cat-icon-${idx}`,
        title: specific?.title || `${icon.label.replace('\n', ' ')} Setup`,
        category: mapCategoryToFilter(icon.label, icon.label),
        serviceName,
        serviceRoute: `/services/${encodeURIComponent(serviceName)}`,
        image: icon.img,
        tag: specific?.tag || 'Curated Service',
        price: specific?.price,
        description: specific?.description,
      });
    });

    // 4. Themes from servicesData
    for (const [theme, meta] of Object.entries(THEME_TO_GALLERY)) {
      const images = SERVICE_GALLERY_IMAGES[theme] || [];
      images.forEach((image, idx) => {
        const specific = SPECIFIC_IMAGE_PRODUCTS[image];
        const title = specific?.title || `${meta.tag} Celebration Setup ${idx + 1}`;
        const serviceName = specific?.serviceName || meta.serviceName;
        const price = specific?.price || '₹2,999';
        const description = specific?.description || `Premium ${serviceName} styled in Bengaluru with 100% picture-match guarantee.`;
        const tag = specific?.tag || meta.tag;

        pushItem({
          id: `gal-${theme.replace(/[^a-z0-9]/g, '')}-${idx}`,
          title,
          category: meta.category,
          serviceName,
          serviceRoute: `/services/${encodeURIComponent(serviceName)}`,
          image,
          tag,
          price,
          description,
        });
      });
    }

    // Sort items: preset existing images appear first in their curated sequence,
    // while any newly added images (from database/CRM/admin) appear strictly at the bottom.
    list.sort((a, b) => {
      const keyA = getImageDeduplicationKey(a.image);
      const keyB = getImageDeduplicationKey(b.image);
      const rankA = PRESET_SEQUENCE_STEM_MAP.has(keyA)
        ? PRESET_SEQUENCE_STEM_MAP.get(keyA)!
        : 1000000;
      const rankB = PRESET_SEQUENCE_STEM_MAP.has(keyB)
        ? PRESET_SEQUENCE_STEM_MAP.get(keyB)!
        : 1000000;

      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return 0;
    });

    return list;
  }, [products]);

  // Caching metadata & cookie for server load reduction
  useEffect(() => {
    if (allImages.length > 0) {
      try {
        sessionStorage.setItem(
          'tdp_gallery_meta',
          JSON.stringify({ count: allImages.length, timestamp: Date.now() })
        );
        document.cookie = 'tdp_gallery_cached=1; path=/; max-age=86400; SameSite=Lax';
      } catch {
        // ignore
      }
    }
  }, [allImages.length]);

  const filteredImages = useMemo(() => {
    return activeCategory === 'ALL'
      ? allImages
      : allImages.filter((item) => item.category === activeCategory);
  }, [activeCategory, allImages]);

  // Progressive sequential loading (30 images initial batch & 50% scroll trigger)
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const halfwaySentinelRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLElement>(null);

  // Progressive loading: first 30 images load immediately, then subsequent images come in queue view
  const [loadedUpToIndex, setLoadedUpToIndex] = useState<number>(PAGE_SIZE);

  const handleImageLoaded = useCallback((cardIndex: number) => {
    setLoadedUpToIndex((prev) => Math.max(prev, cardIndex + 1));
  }, []);

  // Reset pagination and queue when category filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadedUpToIndex(PAGE_SIZE);
    setLoadingMore(false);
  }, [activeCategory]);

  const visibleImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;

  const loadMore = useCallback(() => {
    if (loadingMore || visibleCount >= filteredImages.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredImages.length));
      setLoadingMore(false);
    }, 120);
  }, [loadingMore, visibleCount, filteredImages.length]);

  // 1. Observer for halfway sentinel: triggers as soon as user scrolls past 50% of the loaded images
  useEffect(() => {
    const el = halfwaySentinelRef.current;
    if (!el || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '150px 0px 150px 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadingMore, hasMore, visibleCount]);

  // 2. Observer for bottom sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadingMore, hasMore]);

  // 3. Scroll progress fallback: trigger when scrolled past 50% of current grid height
  useEffect(() => {
    if (loadingMore || !hasMore) return;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const grid = gridContainerRef.current;
        if (!grid || loadingMore || !hasMore) return;
        const rect = grid.getBoundingClientRect();
        const scrolledPastTop = window.innerHeight - rect.top;
        if (rect.height > 0 && scrolledPastTop / rect.height >= 0.5) {
          loadMore();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      const next = prev < filteredImages.length - 1 ? prev + 1 : 0;
      if (next >= visibleCount) {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredImages.length));
      }
      return next;
    });
  }, [filteredImages.length, visibleCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showPrev, showNext]);

  return (
    <>
      <SeoHead
        title="Celebration Gallery — The Decor Party Bangalore | Real Decor Photos & Setups"
        description="A curated board of real celebrations, balloon decor installations, milestone birthdays, and romantic setups styled across Bengaluru with 100% picture-match guarantee."
        keywords={[
          'party decoration photos bangalore',
          'balloon decoration gallery bengaluru',
          'event decor portfolio bangalore',
          'birthday decoration real photos',
        ]}
        image="https://thedecorparty.com/about-purple-decor.jpg"
        url="https://thedecorparty.com/gallery"
        schema={[
          {
            '@type': 'ImageGallery',
            name: 'The Decor Party Bangalore Celebration Gallery',
            description: 'Curated real celebration decor photos and balloon installations across Bangalore.',
            url: 'https://thedecorparty.com/gallery',
          },
        ]}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Gallery', item: '/gallery' },
        ]}
      />

      <div className="flex flex-col w-full bg-[#FFF3E6] text-[#381932] font-poppins antialiased min-h-screen">
        {/* =============================================================== */}
        {/* 1. HERO                                                         */}
        {/* =============================================================== */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-4"
            >
              <Sprig className="w-14 h-5 text-[#A78A9F]" />
              Real Celebrations
              <Sprig className="w-14 h-5 text-[#A78A9F] -scale-x-100" />
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold uppercase tracking-tight text-[#381932] leading-[1.05] mb-3 [text-wrap:balance]"
            >
              A Little Inspiration for Your{' '}
              <span className="text-[#A78A9F]">Next Celebration</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans font-medium text-base sm:text-lg text-[#A78A9F] mt-2"
            >
              details &amp; beautiful spaces, styled by The Decor Party
            </motion.p>
          </div>

          {/* 2. FILTERS */}
          <div className="mt-8 sm:mt-10 flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2.5 px-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'ALL'
                  ? allImages.length
                  : allImages.filter((item) => item.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative shrink-0 rounded-full border px-4 sm:px-5 py-2 text-[11px] font-serif font-semibold uppercase tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] shadow-sm'
                      : 'border-[#E6D7C5] bg-[#FFF3E6] text-[#381932] hover:border-[#A78A9F]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? 'bg-[#FFF3E6]/20 text-[#FFF3E6]' : 'bg-[#A78A9F]/15 text-[#381932]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. FIXED POSITION GRID & SEQUENTIAL QUEUE                        */}
        {/* =============================================================== */}
        <section
          ref={gridContainerRef}
          className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {visibleImages.map((item, index) => {
              const isHalfway = index === Math.max(0, Math.floor(visibleImages.length * 0.5) - 1);
              return (
                <React.Fragment key={item.id}>
                  <GalleryCard
                    item={item}
                    index={index}
                    shouldLoad={index < PAGE_SIZE || index <= loadedUpToIndex}
                    onLoaded={handleImageLoaded}
                    onClick={() => openLightbox(index)}
                  />
                  {isHalfway && (
                    <div
                      ref={halfwaySentinelRef}
                      data-halfway-sentinel={visibleImages.length}
                      className="col-span-full h-px w-full opacity-0 pointer-events-none -my-px"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Infinite Scroll Sentinel & Counter */}
          <div ref={sentinelRef} className="w-full py-10 flex flex-col items-center justify-center">
            {hasMore ? (
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#381932]/5 border border-[#381932]/10 backdrop-blur-sm text-xs font-serif font-bold uppercase tracking-wider text-[#381932]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78A9F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#381932]"></span>
                </span>
                <span>Loading more setups ({visibleImages.length} of {filteredImages.length})</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center text-xs font-serif uppercase tracking-widest text-[#A78A9F]">
                <span>Showing all {filteredImages.length} real celebration setups</span>
                <span className="text-[10px] lowercase font-sans font-normal opacity-70">100% picture-match guarantee across bangalore</span>
              </div>
            )}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 4. ENLARGED LIGHTBOX VIEW                                        */}
        {/* =============================================================== */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredImages[lightboxIndex] && (() => {
            const current = filteredImages[lightboxIndex];
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#25101f]/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto"
                onClick={closeLightbox}
              >
                {/* Header Bar */}
                <div
                  className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#FFF3E6]/10 border border-[#FFF3E6]/15 px-3 py-1 text-xs font-semibold text-[#FFF3E6]">
                      {lightboxIndex + 1} / {filteredImages.length}
                    </span>
                    <span className="rounded-full bg-[#A78A9F]/30 border border-[#A78A9F]/40 px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-wide text-[#FFF3E6]">
                      {current.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(current.serviceRoute);
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E6]/15 hover:bg-[#FFF3E6]/25 border border-[#FFF3E6]/20 px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-wide text-[#FFF3E6] transition-colors cursor-pointer"
                    >
                      <Sparkles size={11} className="text-[#E6D7C5]" />
                      <span>Service: {current.serviceName}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeLightbox();
                    }}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Left Arrow */}
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-20"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Center Content */}
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-h-[90vh] max-w-[92vw] flex flex-col items-center justify-center z-10 my-auto pt-10 sm:pt-12 pb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Enlarged Image */}
                  <img
                    src={current.image}
                    alt={current.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.endsWith('.webp')) {
                        target.src = target.src.replace(/\.webp$/i, '.jpg');
                      }
                    }}
                    className="max-h-[58vh] sm:max-h-[64vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-[#FFF3E6]/15"
                  />

                  {/* Info & Redirection Card */}
                  <div className="w-full max-w-xl mt-3 sm:mt-4 rounded-2xl bg-[#381932]/95 backdrop-blur-xl border border-[#FFF3E6]/20 p-4 sm:p-5 shadow-2xl text-[#FFF3E6]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(current.serviceRoute);
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-serif font-bold uppercase tracking-wider text-[#C8B5C3] hover:text-[#FFF3E6] transition-colors cursor-pointer group"
                        >
                          <Sparkles size={12} className="text-[#E6D7C5]" />
                          <span>{current.serviceName}</span>
                          <span className="text-[#C8B5C3]/70 group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                        <h2
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(current.serviceRoute);
                          }}
                          className="font-serif text-base sm:text-lg font-bold uppercase tracking-tight text-[#FFF3E6] hover:text-[#E6D7C5] transition-colors cursor-pointer leading-snug mt-0.5 line-clamp-2"
                        >
                          {current.title}
                        </h2>
                      </div>
                      {current.price && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-serif tracking-wider text-[#C8B5C3] block">Starting from</span>
                          <span className="text-base sm:text-lg font-bold text-[#FFF3E6]">{current.price}</span>
                        </div>
                      )}
                    </div>

                    {current.description && (
                      <p className="text-xs text-[#FFF3E6]/80 mt-2 line-clamp-2 leading-relaxed font-sans">
                        {current.description}
                      </p>
                    )}

                    <div className="mt-3.5 pt-3 border-t border-[#FFF3E6]/15 flex items-center gap-2 sm:gap-3">
                      {/* Designated Service Redirection Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(current.serviceRoute);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FFF3E6] text-[#381932] px-4 sm:px-6 py-2.5 text-xs font-serif font-bold uppercase tracking-wider shadow-lg hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Explore {current.serviceName} Service</span>
                        <ArrowUpRight size={14} />
                      </button>

                      {/* Quick Book Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookImage(current);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#FFF3E6]/30 bg-white/10 hover:bg-white/20 text-[#FFF3E6] px-4 sm:px-5 py-2.5 text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Book Setup</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Right Arrow */}
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-20"
                >
                  <ChevronRight size={24} />
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </>
  );
};

export default GalleryPage;

