import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Share2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { BackButton } from '../../components/ui/BackButton';
import { ShareDialog } from '../../components/ui/ShareDialog';
import { SeoHead } from '../../components/layout/SeoHead';
import { findServiceSubItems, getSubServiceImage, getServiceGalleryImages } from '../../data/servicesData';
import type { AdminProduct } from '../../types';

/**
 * Nicer copy for known services when we turn their public/ photo gallery into
 * cards. Anything not listed falls back to the generic entry.
 */
const GALLERY_CARD_META: Record<string, {
  noun: string; badge: string; badgeColor: AdminProduct['badgeColor'];
  base: number; step: number; desc: string; inclusions: string[];
}> = {
  'welcome baby': { noun: 'Welcome Baby Setup', badge: 'Homecoming', badgeColor: 'pink', base: 2499, step: 300,
    desc: 'Newborn homecoming decor with pastel balloon arches, a cradle garland, a personalised welcome board, and soft fairy lighting.',
    inclusions: ['Pastel Balloon Arch', 'Cradle / Crib Floral Garland', 'Personalised Welcome Board', 'Warm Fairy Lighting'] },
  'naming ceremonies': { noun: 'Naming Ceremony Setup', badge: 'Blessing', badgeColor: 'purple', base: 2999, step: 400,
    desc: 'Namkaran / naming ceremony decor with a floral cradle, pastel backdrop, personalised name board and warm ambient lighting.',
    inclusions: ['Floral Cradle Styling', 'Pastel Themed Backdrop', 'Personalised Name Board', 'Warm Ambient Lighting'] },
  'boy theme': { noun: 'Boy Kids Theme Decor', badge: 'Kids Favorite', badgeColor: 'pink', base: 6999, step: 700,
    desc: 'Boy kids birthday theme decor with a themed backdrop, balloon styling, cake table setup and matching props.',
    inclusions: ['Themed Printed Backdrop', 'Balloon Arch & Cluster Styling', 'Cake & Cylinder Table', 'Matching Theme Props'] },
  'boy kids themes': { noun: 'Boy Kids Theme Decor', badge: 'Kids Favorite', badgeColor: 'pink', base: 6999, step: 700,
    desc: 'Boy kids birthday theme decor with a themed backdrop, balloon styling, cake table setup and matching props.',
    inclusions: ['Themed Printed Backdrop', 'Balloon Arch & Cluster Styling', 'Cake & Cylinder Table', 'Matching Theme Props'] },
  'cabana setups': { noun: 'Cabana Setup', badge: 'Rooftop', badgeColor: 'gold', base: 5999, step: 600,
    desc: 'Private candlelight cabana styling with drapes, fairy lights, floral accents and a cosy lounge seating layout.',
    inclusions: ['Cabana Drape Styling', 'Fairy Light Canopy', 'Fresh Floral Accents', 'Lounge Seating Layout'] },
  'graduation': { noun: 'Graduation Decor', badge: 'Milestone', badgeColor: 'purple', base: 3499, step: 400,
    desc: 'Graduation celebration decor with a congrats backdrop, balloon garland, photo corner and cap-and-scroll props.',
    inclusions: ['Congrats Printed Backdrop', 'Balloon Garland', 'Photo Corner Styling', 'Cap & Scroll Props'] },
  'opening decors': { noun: 'Opening / Launch Decor', badge: 'Grand Opening', badgeColor: 'gold', base: 4999, step: 600,
    desc: 'Store / office opening decor with a ribbon-cutting arch, balloon columns, floral garlands and a branded backdrop.',
    inclusions: ['Ribbon-Cutting Arch', 'Balloon Columns', 'Floral Garlands', 'Branded Backdrop'] },
  'national festivals': { noun: 'Festival Decor', badge: 'Festive', badgeColor: 'gold', base: 2999, step: 350,
    desc: 'Patriotic / festival decor with tricolour drapes, themed balloon arches, lighting and a photo backdrop.',
    inclusions: ['Themed Drapes', 'Balloon Arch', 'Ambient Lighting', 'Photo Backdrop'] },
  'pre & post wedding': { noun: 'Pre & Post Wedding Decor', badge: 'Wedding', badgeColor: 'purple', base: 7999, step: 900,
    desc: 'Engagement / haldi / ring ceremony styling with floral installations, seating decor, backdrops and lighting.',
    inclusions: ['Floral Stage Installation', 'Seating & Aisle Decor', 'Custom Backdrop', 'Event Lighting'] },
  'terrace proposals': { noun: 'Terrace Proposal Setup', badge: 'Romantic', badgeColor: 'pink', base: 5999, step: 700,
    desc: 'Rooftop proposal styling with a Marry-Me marquee, candle pathway, florals and fairy lighting.',
    inclusions: ['Marry-Me / Heart Marquee', 'Candle Pathway', 'Fresh Florals', 'Fairy Light Canopy'] },
  'heart arch setup': { noun: 'Heart Arch Setup', badge: 'Romantic', badgeColor: 'pink', base: 4499, step: 500,
    desc: 'Heart-shaped arch styling with balloons or florals, drapes and warm lighting for proposals and anniversaries.',
    inclusions: ['Heart Arch Frame', 'Balloon / Floral Styling', 'Drape Backdrop', 'Warm Lighting'] },
  'candlelight pathway': { noun: 'Candlelight Pathway', badge: 'Romantic', badgeColor: 'pink', base: 2999, step: 350,
    desc: 'Candlelit walkway styling with lanterns, petals and fairy lights leading to the celebration focal point.',
    inclusions: ['Lantern / Candle Line', 'Rose Petal Path', 'Fairy Light Accents', 'Focal Point Styling'] },
  'annaprashan': { noun: 'Annaprashan Setup', badge: 'Blessing', badgeColor: 'purple', base: 2999, step: 400,
    desc: 'First-rice ceremony decor with a floral seating area, themed backdrop, name board and traditional accents.',
    inclusions: ['Floral Seating Area', 'Themed Backdrop', 'Personalised Name Board', 'Traditional Accents'] },
  'bike & car deliveries': { noun: 'Bike & Car Surprise', badge: 'Express', badgeColor: 'gold', base: 1999, step: 300,
    desc: 'On-vehicle surprise decor with balloons, ribbons, a message card and themed props, set up at your location.',
    inclusions: ['Balloon & Ribbon Styling', 'Personalised Message Card', 'Themed Props', 'On-Location Setup'] },
};

const GENERIC_GALLERY_META = {
  badge: 'Curated', badgeColor: 'purple' as AdminProduct['badgeColor'], base: 3499, step: 400,
  desc: 'Curated The Decor Party styling for this theme — balloon and floral work, a themed backdrop, table styling and ambient lighting, fully set up at your venue.',
  inclusions: ['Themed Backdrop', 'Balloon / Floral Styling', 'Table & Focal Styling', 'Ambient Lighting'],
};

/**
 * Turn a service's public/ photo gallery into ProductCard-compatible cards,
 * skipping any image the real DB list already shows. Each card opens the
 * shared detail carousel of every sibling photo.
 */
function buildGalleryCards(serviceLabel: string, images: string[], existingImages: Set<string>): AdminProduct[] {
  if (!images.length) return [];
  const key = serviceLabel.trim().toLowerCase();
  const meta = GALLERY_CARD_META[key];
  const noun = meta?.noun || `${serviceLabel} Setup`;
  const badge = meta?.badge || GENERIC_GALLERY_META.badge;
  const badgeColor = meta?.badgeColor || GENERIC_GALLERY_META.badgeColor;
  const base = meta?.base ?? GENERIC_GALLERY_META.base;
  const step = meta?.step ?? GENERIC_GALLERY_META.step;
  const desc = meta?.desc || GENERIC_GALLERY_META.desc;
  const inclusions = meta?.inclusions || GENERIC_GALLERY_META.inclusions;
  const slug = key.replace(/[^a-z0-9]/g, '') || 'svc';

  return images
    .filter((img) => !existingImages.has(img))
    .map((img, idx) => ({
      _id: `gallery_${slug}_${idx}`,
      categoryId: `cat_${slug}`,
      name: `${noun} ${idx + 1}`,
      categoryName: 'Curated Decors',
      subcategory: serviceLabel,
      price: base + idx * step,
      originalPrice: Math.round((base + idx * step) * 1.28),
      description: desc,
      image: img,
      moreImages: images.filter((x) => x !== img),
      inclusions,
      addOns: [],
      badge,
      badgeColor,
      rating: 4.9,
      reviewCount: 70 + idx * 10,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    } as AdminProduct));
}

// All distinct Cabana Setups photos in public/ -- every card gets the full
// set as its gallery (moreImages) so the product page shows a premium
// swipe carousel + thumbnails across every angle of the experience.
const CABANA_IMAGES = [
  '/kkkk.jpeg',
  '/cabana.jpeg',
  '/cabana set up 2.jpeg',
  '/cabana set up 3.jpeg',
  '/cabana set up 4.jpeg',
  '/cabana set up 5.jpeg',
  '/cabana set up 6.jpeg',
];

const CABANA_META: { name: string; desc: string; inclusions: string[]; badge: string; badgeColor: string; price: number; originalPrice: number }[] = [
  { name: 'Rooftop Candlelight Cabana Dining', desc: 'Dreamy sheer drape cabana with fairy lights, plush floor seating, rose petals, and warm candle illumination.', inclusions: ['4-Pillar Weather Canopy', '100+ LED Battery Candles', 'Fresh Red Rose Petal Pathway', 'Fairy Light Drapes'], badge: 'Bestseller', badgeColor: 'purple', price: 3499, originalPrice: 4500 },
  { name: 'Bohemian Terrace Canopy Setup', desc: 'Chic boho macrame cabana with pampas grass, warm lanterns, and low-table candlelight dining arrangement.', inclusions: ['Boho Canopy Frame', 'Macrame & Cushion Seating', 'Pampas Floral Vases', 'Warm Lantern Pathway'], badge: 'Luxury', badgeColor: 'gold', price: 4999, originalPrice: 6500 },
];

const ACTIVITIES_FALLBACK_MAP: Record<string, AdminProduct[]> = {
  'cabana setups': CABANA_IMAGES.map((img, i) => {
    const meta = CABANA_META[i] ?? {
      name: `Cabana Setup ${i + 1}`,
      desc: 'Sheer drape cabana with fairy lights, plush floor seating, fresh florals, and warm candlelight dining.',
      inclusions: ['Weather Canopy Frame', 'Fairy Light Drapes', 'Plush Floor Seating', 'Fresh Floral Styling'],
      badge: 'Bestseller',
      badgeColor: 'purple',
      price: 3799 + (i - 2) * 400,
      originalPrice: 4800 + (i - 2) * 400,
    };
    return {
      _id: `exp_cab_${i + 1}`,
      categoryId: 'cat_exp',
      name: meta.name,
      categoryName: 'Experiences',
      subcategory: 'Cabana Setups',
      price: meta.price,
      originalPrice: meta.originalPrice,
      description: meta.desc,
      image: img,
      moreImages: CABANA_IMAGES.filter((x) => x !== img),
      inclusions: meta.inclusions,
      addOns: [],
      badge: meta.badge,
      badgeColor: meta.badgeColor,
      rating: 4.9,
      reviewCount: 120 + i * 15,
      active: true,
      featured: i === 0,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    } as AdminProduct;
  }),
  'proposal setup': [
    {
      _id: 'exp_prop_1',
      categoryId: 'cat_exp',
      name: '4ft MARRY ME LED Marquee Terrace Proposal',
      categoryName: 'Experiences',
      subcategory: 'Terrace Proposals',
      price: 8999,
      originalPrice: 11000,
      description: 'Grand proposal setup featuring 4-foot illuminated MARRY ME marquee letters, plush red carpet aisle, and heart arch.',
      image: '/terrace propsal set up.jpeg',
      moreImages: ['/terrace propsal set up 3.jpeg', '/terrace propsal set up 4.jpeg', '/terrace propsal set up 5.jpeg', '/terrace propsal set up 6.jpeg', '/terrace-proposal.jpeg', '/terrace.jpeg'],
      inclusions: ['4ft MARRY ME Illuminated Letters', '20ft Plush Red Carpet Aisle', 'Heart Floral Arch', 'Cold Pyro Sparklers (4 Shots)'],
      addOns: [],
      badge: 'Most Romantic',
      badgeColor: 'pink',
      rating: 5.0,
      reviewCount: 310,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    ...(['/proposal set up.jpeg', '/proposal set up 1.jpeg', '/proposal set up 2.jpeg', '/proposal set up 3.jpeg', '/proposal set up 4.jpeg', '/proposal set up 5.jpeg', '/propsal set up 6.jpeg', '/propsal set up 7.jpeg'].map((img, i) => ({
      _id: `exp_prop_${i + 2}`,
      categoryId: 'cat_exp',
      name: `Proposal Setup ${i + 2}`,
      categoryName: 'Experiences',
      subcategory: 'Proposal Setup',
      price: 5999 + i * 600,
      originalPrice: 7500 + i * 600,
      description: 'Romantic proposal styling with candlelight pathway, fresh florals, fairy lights, and a personalised backdrop.',
      image: img,
      moreImages: [],
      inclusions: ['Candlelight Pathway', 'Fresh Floral Arch', 'Fairy Light Curtain', 'Personalised Backdrop'],
      addOns: [],
      badge: 'Most Romantic',
      badgeColor: 'pink',
      rating: 4.9,
      reviewCount: 90 + i * 14,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
    // Terrace Proposals -- every "terrace propsal set up" photo in public/
    ...((['/terrace propsal set up.jpeg', '/terrace propsal set up 3.jpeg', '/terrace propsal set up 4.jpeg', '/terrace propsal set up 5.jpeg', '/terrace propsal set up 6.jpeg', '/terrace-proposal.jpeg', '/terrace.jpeg']).map((img, i) => ({
      _id: `exp_terrace_${i + 1}`,
      categoryId: 'cat_exp',
      name: `Terrace Proposal Setup ${i + 1}`,
      categoryName: 'Experiences',
      subcategory: 'Terrace Proposals',
      price: 6999 + i * 700,
      originalPrice: 8500 + i * 700,
      description: 'Rooftop terrace proposal styling with candlelight pathway, fresh florals, lanterns, fairy lights and a personalised backdrop.',
      image: img,
      moreImages: ['/terrace propsal set up.jpeg', '/terrace propsal set up 3.jpeg', '/terrace propsal set up 4.jpeg', '/terrace propsal set up 5.jpeg', '/terrace propsal set up 6.jpeg', '/terrace-proposal.jpeg', '/terrace.jpeg'].filter((x) => x !== img),
      inclusions: ['Candlelight Petal Pathway', 'Fresh Floral Heart Arch', 'Lantern & Fairy-Light Ambience', 'Personalised Terrace Backdrop'],
      addOns: [],
      badge: 'Most Romantic',
      badgeColor: 'pink',
      rating: 4.9,
      reviewCount: 80 + i * 12,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
    // Heart Arch Setup -- every "heart arch set up" photo in public/
    ...((['/heart arch set up 1.jpeg', '/heart arch set up 2.jpeg', '/heart arch set up 3.jpeg']).map((img, i) => ({
      _id: `exp_heartarch_${i + 1}`,
      categoryId: 'cat_exp',
      name: `Heart Arch Setup ${i + 1}`,
      categoryName: 'Experiences',
      subcategory: 'Heart Arch Setup',
      price: 4999 + i * 500,
      originalPrice: 6500 + i * 500,
      description: 'Romantic heart-shaped floral and balloon arch with fairy lights, drapes and a rose-petal aisle.',
      image: img,
      moreImages: ['/heart arch set up 1.jpeg', '/heart arch set up 2.jpeg', '/heart arch set up 3.jpeg'].filter((x) => x !== img),
      inclusions: ['Heart-Shaped Arch Frame', 'Fresh Floral & Balloon Styling', 'Fairy Light Drapes', 'Rose Petal Aisle'],
      addOns: [],
      badge: 'Most Romantic',
      badgeColor: 'pink',
      rating: 4.9,
      reviewCount: 70 + i * 10,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
    // Candlelight Pathway -- every "candelight pathway" photo in public/
    ...((['/candelight pathway 1.jpeg', '/candelight pathway 2.jpeg', '/candelight pathway 3.jpeg', '/candelight pathway 4.jpeg']).map((img, i) => ({
      _id: `exp_candlepath_${i + 1}`,
      categoryId: 'cat_exp',
      name: `Candlelight Pathway ${i + 1}`,
      categoryName: 'Experiences',
      subcategory: 'Candlelight Pathway',
      price: 3999 + i * 400,
      originalPrice: 5200 + i * 400,
      description: 'A warm candlelit walkway lined with lanterns, fresh rose petals and fairy lights leading to the setup.',
      image: img,
      moreImages: ['/candelight pathway 1.jpeg', '/candelight pathway 2.jpeg', '/candelight pathway 3.jpeg', '/candelight pathway 4.jpeg'].filter((x) => x !== img),
      inclusions: ['100+ LED Battery Candles', 'Lantern Pathway Markers', 'Fresh Rose Petal Trail', 'Fairy Light Accents'],
      addOns: [],
      badge: 'Most Romantic',
      badgeColor: 'pink',
      rating: 4.9,
      reviewCount: 60 + i * 9,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
  ],
  'car boot surprises': [
    {
      _id: 'exp_boot_1',
      categoryId: 'cat_exp',
      name: 'Midnight Car Boot Surprise Decor',
      categoryName: 'Experiences',
      subcategory: 'Car Boot Surprises',
      price: 1999,
      originalPrice: 2800,
      description: 'Surprise car trunk styling with fairy light stringing, helium balloons, customised photo bunting, and gift boxes.',
      image: '/car bot.jpeg',
      moreImages: ['/car deliver 4.jpeg'],
      inclusions: ['Custom Car Trunk Styling', 'Fairy Light Garland', '10 Printed Memories Photo Bunting', 'Surprise Banner'],
      addOns: [],
      badge: 'Surprise Favorite',
      badgeColor: 'purple',
      rating: 4.85,
      reviewCount: 195,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    ...(['/car bot 1.jpeg', '/car bot 2.jpeg', '/car bot 3.jpeg', '/car bot3.jpeg'].map((img, i) => ({
      _id: `exp_boot_${i + 2}`,
      categoryId: 'cat_exp',
      name: `Car Boot Surprise Setup ${i + 2}`,
      categoryName: 'Experiences',
      subcategory: 'Car Boot Surprises',
      price: 1799 + i * 200,
      originalPrice: 2500 + i * 200,
      description: 'Surprise car trunk styling with balloons, fairy lights, fresh flower bouquets, and personalised banners.',
      image: img,
      moreImages: [],
      inclusions: ['Custom Car Trunk Styling', 'Balloons & Fairy Lights', 'Fresh Flower Bouquet', 'Personalised Banner'],
      addOns: [],
      badge: 'Surprise Favorite',
      badgeColor: 'purple',
      rating: 4.8,
      reviewCount: 90 + i * 12,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
  ],
  'car & bike decoration': [
    {
      _id: 'exp_car_1',
      categoryId: 'cat_exp',
      name: 'Grand Entry Car Floral Decoration',
      categoryName: 'Experiences',
      subcategory: 'Car & Bike Decoration',
      price: 2999,
      originalPrice: 3800,
      description: 'Fresh floral garlands styled across the bonnet and grille for a grand wedding or celebration car entry.',
      image: '/car dilver.jpeg',
      moreImages: [
        '/car deliver.jpeg',
        '/car deliver (2).jpeg',
        '/car deliver 5.jpeg',
      ],
      inclusions: ['Fresh Flower Bonnet Garland', 'Grille & Mirror Floral Accents', 'On-Location Styling', 'Same-Day Setup'],
      addOns: [],
      badge: 'Grand Entry',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 84,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      _id: 'exp_car_2',
      categoryId: 'cat_exp',
      name: 'Bridal Bike Floral Decoration',
      categoryName: 'Experiences',
      subcategory: 'Car & Bike Decoration',
      price: 1499,
      originalPrice: 1999,
      description: 'Rose and baby\'s breath garland styling across the headlamp and handlebars for a stylish two-wheeler entry.',
      image: '/car deliver5.jpeg',
      moreImages: [],
      inclusions: ['Fresh Rose & Baby\'s Breath Garland', 'Headlamp & Handlebar Styling', 'On-Location Setup'],
      addOns: [],
      badge: 'Popular',
      badgeColor: 'pink',
      rating: 4.8,
      reviewCount: 47,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'kids themes': [
    {
      _id: 'exp_kids_1',
      categoryId: 'cat_exp',
      name: 'Pastel Teddy Bear & Organic Cloud Arch',
      categoryName: 'Experiences',
      subcategory: 'Kids Themes',
      price: 3499,
      originalPrice: 4500,
      description: 'Dreamy pastel balloon arch with 3D teddy bear mascot cutouts, cloud stands, and personalised name board.',
      image: '/kids theme.jpeg',
      moreImages: [],
      inclusions: ['Organic Pastel Balloon Arch', 'Giant Plush Teddy Bear Props', 'Customised Name Board', 'LED Warm Backdrop Lights'],
      addOns: [],
      badge: 'Kids Favorite',
      badgeColor: 'pink',
      rating: 4.9,
      reviewCount: 280,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'simple wall decors': [
    {
      _id: 'exp_wall_1',
      categoryId: 'cat_wall',
      name: 'Gold Chrome & Black Birthday Ring Arch',
      categoryName: 'Curated Decors',
      subcategory: 'Simple wall decors',
      price: 1299,
      originalPrice: 1850,
      description: 'Elegant balloon ring arch backdrop with gold metallic chrome accent balloons, LED fairy lights, and happy birthday neon foil letters.',
      image: '/simple-wall-decor.jpg',
      moreImages: [],
      inclusions: ['Circular Ring Backdrop Stand', '150+ Metallic & Chrome Balloons', 'LED Fairy String Lights', 'Happy Birthday Foil Banner'],
      addOns: [],
      badge: 'Popular',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 410,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'caricature artist': [
    {
      _id: 'act_1',
      categoryId: 'cat_act',
      name: 'Live Caricature Artist (2 Hours)',
      categoryName: 'Kids Activities',
      subcategory: 'Caricature Artist',
      price: 2499,
      originalPrice: 3200,
      description: 'Professional live caricature artist providing instant hand-drawn portrait sketches for up to 30 guests.',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['2 Hours Artist Service', 'A4 Paper Sheets & Pens', 'Over 30 Sketches Covered'],
      addOns: [],
      badge: 'Bestseller',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 140,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'emcee anchor': [
    {
      _id: 'act_3',
      categoryId: 'cat_act',
      name: 'Party Emcee & Game Host (2 Hours)',
      categoryName: 'Kids Activities',
      subcategory: 'Emcee Anchor',
      price: 3999,
      originalPrice: 5000,
      description: 'High-energy bilingual party anchor conducting party games, music cues, and cake cutting ceremony.',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['2 Hours Live Anchoring', 'Game Props & Winner Gifts', 'Bilingual Host (EN/KN/HI)'],
      addOns: [],
      badge: 'High Energy',
      badgeColor: 'pink',
      rating: 5.0,
      reviewCount: 210,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'birthday tattoo artist': [
    {
      _id: 'act_4',
      categoryId: 'cat_act',
      name: 'Glitter & Temporary Tattoo Counter',
      categoryName: 'Kids Activities',
      subcategory: 'Birthday Tattoo Artist',
      price: 1999,
      originalPrice: 2800,
      description: 'Skin-safe organic glitter tattoos and waterproof temporary ink art counter for kids and adults.',
      image: 'https://images.unsplash.com/photo-1561053720-76cd73ff8185?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['2 Hours Unlimited Tattoos', 'Skin-Safe Non-Toxic Materials', '100+ Stencil Designs'],
      addOns: [],
      badge: 'Kids Favorite',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 310,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'live eateries': [
    {
      _id: 'act_5',
      categoryId: 'cat_eat',
      name: 'Turkish Trick Ice Cream Stall',
      categoryName: 'Live Eateries',
      subcategory: 'Turkish Ice Cream',
      price: 4499,
      originalPrice: 5500,
      description: 'Authentic Dondurma trick ice cream stall with funny trick shows while serving 50 scoops.',
      image: 'https://images.unsplash.com/photo-1567206563064-6f60f4078b57?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['50 Portions Included', 'Live Trick Show Artist', 'Choice of 3 Flavors'],
      addOns: [],
      badge: 'Interactive',
      badgeColor: 'gold',
      rating: 4.9,
      reviewCount: 420,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    ...(([
      ['Instant Maggi Counter', 'Instant Maggi', '/instant maggi.jpeg', 'Hot masala Maggi cooked live to order with veggies & cheese toppings.'],
      ['Live Chaat Counter', 'Chaat Counters', '/chat counter.jpeg', 'Pani puri, bhel, sev puri & dahi chaat served fresh from a live counter.'],
      ['Fresh Fruit Salad Bar', 'Fruit Salad', '/fruit salad.jpeg', 'Seasonal cut fruit bar with toppings, dry fruits & flavoured yoghurt.'],
      ['Live Pani Puri Stall', 'Live Pani Puri', '/pani puri.jpeg', 'Crisp puris with 5 flavoured waters, served live by a dedicated stall artist.'],
      ['Ice Cream Flavours Cart', 'Ice Cream Flavours', '/ice cream.jpeg', 'Scoop cart with 6 flavours, cones, cups & assorted sprinkles.'],
    ] as const).map(([nm, sc, img, desc], i) => ({
      _id: `act_eat_${i + 6}`,
      categoryId: 'cat_eat',
      name: nm,
      categoryName: 'Live Eateries',
      subcategory: sc,
      price: 2999 + i * 500,
      originalPrice: 3800 + i * 500,
      description: desc,
      image: img,
      moreImages: [],
      inclusions: ['2 Hours Live Service', 'Trained Stall Artist', 'All Ingredients & Serveware', 'Setup & Cleanup'],
      addOns: [],
      badge: 'Live Counter',
      badgeColor: 'purple',
      rating: 4.85,
      reviewCount: 120 + i * 20,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as AdminProduct[]),
  ],
  'photography': [
    {
      _id: 'act_7',
      categoryId: 'cat_media',
      name: 'Milestone Event Photography (3 Hours)',
      categoryName: 'Photography & Videography',
      subcategory: 'Event Photography',
      price: 2999,
      originalPrice: 4000,
      description: 'Professional event photographer capturing candid moments, stage portraits, and color-graded HD gallery.',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['3 Hours On-Site Coverage', 'All Raw Photos', '50 Color-Graded Retouched Images'],
      addOns: [],
      badge: '4K Capture',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 260,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      _id: 'act_8',
      categoryId: 'cat_media',
      name: 'Cinematic Event Videography & Teaser Reel (4 Hours)',
      categoryName: 'Photography & Videography',
      subcategory: 'Cinematic Videography',
      price: 4999,
      originalPrice: 6500,
      description: '4K ultra HD cinematic video recording with gimbal stabilization, curated music overlay, and 60-second teaser reel for Instagram.',
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['4 Hours Cinematic Shoot', '4K Edited Full Video (3-5 Mins)', '60-Sec Instagram Teaser Reel', 'Licensed Music Overlay'],
      addOns: [],
      badge: 'Trending',
      badgeColor: 'gold',
      rating: 4.95,
      reviewCount: 185,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      _id: 'act_9',
      categoryId: 'cat_media',
      name: 'Complete Photo + Video Combo Package (Full Event)',
      categoryName: 'Photography & Videography',
      subcategory: 'Photo + Video Combo',
      price: 6999,
      originalPrice: 9500,
      description: 'Dedicated 2-member crew (1 candid photographer + 1 cinematic videographer) covering the entire celebration with full editing.',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      moreImages: [],
      inclusions: ['2 Professional Crew Members', 'Unlimited High-Res Photos', 'Full 4K Cinematic Film', 'Express 5-Day Delivery'],
      addOns: [],
      badge: 'Best Value',
      badgeColor: 'green',
      rating: 5.0,
      reviewCount: 310,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
};

// Alias lookup keys that describe the exact same items under a different
// name onto the same array reference (rather than duplicating the data),
// so the `allMocks`/dedupe-by-_id logic below never has to reconcile two
// copies of the same service with different ids.
ACTIVITIES_FALLBACK_MAP['photography & videography'] = ACTIVITIES_FALLBACK_MAP['photography'];
ACTIVITIES_FALLBACK_MAP['experiences'] = [
  ...ACTIVITIES_FALLBACK_MAP['cabana setups'],
  ...ACTIVITIES_FALLBACK_MAP['proposal setup'],
  ...ACTIVITIES_FALLBACK_MAP['car boot surprises'],
  ...ACTIVITIES_FALLBACK_MAP['car & bike decoration'],
];

const THEME_FAQS_MAP: Record<string, { question: string; answer: string }[]> = {
  birthday: [
    {
      question: 'How early should I book a birthday balloon setup in Bengaluru?',
      answer: 'We recommend booking 3–7 days in advance. For urgent requirements, we also offer Express Delivery across all Bengaluru pincodes.'
    },
    {
      question: 'Can we customise the balloon color palette and neon name signs?',
      answer: 'Yes! All milestone birthday setups include customisable balloon color schemes (Pastel, Metallic, Gold, Chrome) and custom LED neon name signage.'
    },
    {
      question: 'Are the balloons safe for indoor living rooms and apartments?',
      answer: 'Absolutely. We use 100% organic, non-toxic, eco-friendly latex balloons with safe wall-friendly painter tape mounts that leave no marks.'
    },
    {
      question: 'How long does an artisanal balloon ring installation take on location?',
      answer: 'Our verified master decorators complete full ring arches and backdrop setups within 45 to 75 minutes on location.'
    }
  ],
  anniversary: [
    {
      question: 'Can candlelight cabana setups be installed on private terraces or rooftops?',
      answer: 'Yes! Our weather-resistant cabana frames and fairy-lit canopy setups can be styled on indoor living rooms, private terraces, rooftops, or garden lawns.'
    },
    {
      question: 'Are real fresh rose petals and warm LED battery candles provided?',
      answer: 'Yes, every romantic package includes fresh red/pink rose petal pathways, warm LED battery candles, and fairy-lit sheer drapes.'
    },
    {
      question: 'What happens in case of unexpected rain during a rooftop setup?',
      answer: 'Our stylists will seamlessly transition the cabana setup to your covered balcony, verandah, or living room space at no extra cost.'
    }
  ],
  baby: [
    {
      question: 'Are the balloon materials non-toxic and safe for newborn homecoming?',
      answer: 'Yes! We strictly use medical-grade, 100% natural organic latex balloons that are completely safe for newborn baby welcome setups.'
    },
    {
      question: 'How fast can a Welcome Baby express setup be installed at home or hospital?',
      answer: 'Our express homecoming team delivers and sets up cradle garlands and welcome backdrops within 60 minutes of arrival.'
    },
    {
      question: 'Can we request gender-neutral theme palettes like sage green, cream, and gold?',
      answer: 'Yes! We offer gender-neutral pastels, eucalyptus green, vintage teddy bear themes, cloud arches, and custom pastel color blends.'
    }
  ],
  proposal: [
    {
      question: 'What size are the illuminated marquee letters (MARRY ME)?',
      answer: 'Our marquee letters are 4 feet tall with warm white LED bulb illumination, plush red carpet walkways, and lantern surrounds.'
    },
    {
      question: 'Can you coordinate with secret photographers or venue managers for surprise timing?',
      answer: 'Yes! Our team discreetly coordinates setup times with resort managers, rooftop restaurants, or your friends to ensure 100% secret surprise execution.'
    }
  ],
  activities: [
    {
      question: 'How many guest caricatures can the live artist complete during a 2-hour session?',
      answer: 'Our professional caricature artist completes 25 to 35 detailed A4 portrait sketches in a 2-hour event session.'
    },
    {
      question: 'Are live popcorn, cotton candy, and chocolate fountain stalls operated by staff?',
      answer: 'Yes! All live eatery stalls come with a dedicated uniform operator, machines, raw materials, and serving disposables included.'
    },
    {
      question: 'Is the Turkish ice cream performance suitable for kids birthday parties?',
      answer: 'Yes! The famous Dondurma trick show is highly entertaining for kids and adults alike, combining funny ice cream tricks with delicious flavors.'
    }
  ]
};

export const OccasionPage: React.FC<{
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}> = ({
  onViewProduct,
  onBookProduct,
}) => {
  const { categoryName, subcategoryName } = useParams<{ categoryName: string; subcategoryName?: string }>();
  const navigate = useNavigate();
  const { categories, products, grouped } = useProducts();

  const [shareOpen, setShareOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : 'Activities & Entertainment';
  const decodedSubcategory = subcategoryName ? decodeURIComponent(subcategoryName) : '';

  const currentThemeFaqs = useMemo(() => {
    const normCat = (decodedCategory || '').toLowerCase();
    const normSub = (decodedSubcategory || '').toLowerCase();
    const key = normSub || normCat;

    for (const [mapKey, faqs] of Object.entries(THEME_FAQS_MAP)) {
      if (key.includes(mapKey) || normCat.includes(mapKey)) {
        return faqs;
      }
    }

    return [
      {
        question: `How early should I book ${decodedCategory} theme setups?`,
        answer: `We recommend booking 3–7 days in advance. We also support Express Delivery across all Bengaluru pincodes.`
      },
      {
        question: `Can I customise colors and elements for ${decodedCategory}?`,
        answer: `Yes! All setups are 100% customisable in balloon color combinations, neon text, flower selection, and backdrop sizing.`
      },
      {
        question: `Are setup and teardown services included in the fixed package price?`,
        answer: `Yes! Turnkey styling, on-site installation, decorator travel, and post-event cleanup are all included upfront — zero hidden fees.`
      },
      {
        question: `What is your 100% Picture-Match Guarantee?`,
        answer: `The design and materials staged at your location will exactly match the design photo in our catalogue, with Pantone color accuracy.`
      }
    ];
  }, [decodedCategory, decodedSubcategory]);

  const isProposalCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (
      cat.includes('proposal') ||
      sub.includes('proposal') ||
      sub.includes('terrace proposal') ||
      (cat.includes('experience') && sub.includes('proposal')) ||
      sub.includes('marry me')
    );
  }, [decodedCategory, decodedSubcategory]);

  const isCarBootCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (
      cat.includes('car boot') ||
      sub.includes('car boot') ||
      cat.includes('car trunk') ||
      sub.includes('car trunk') ||
      (cat.includes('experience') && sub.includes('car'))
    );
  }, [decodedCategory, decodedSubcategory]);

  const isCarDecorationCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (
      cat.includes('car & bike') ||
      sub.includes('car & bike') ||
      sub.includes('bike decoration') ||
      (cat.includes('experience') && sub.includes('bike'))
    );
  }, [decodedCategory, decodedSubcategory]);

  const isCabanaCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (
      cat.includes('cabana') ||
      sub.includes('cabana') ||
      (cat.includes('experience') && sub.includes('cabana'))
    );
  }, [decodedCategory, decodedSubcategory]);

  const isAnniversaryCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('anniversary') || sub.includes('anniversary') || cat.includes('wedding');
  }, [decodedCategory, decodedSubcategory]);

  const isWallDecorCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('wall decor') || sub.includes('wall decor') || cat.includes('simple wall');
  }, [decodedCategory, decodedSubcategory]);

  const is1stBirthdayCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('1st birthday') || sub.includes('1st birthday') || cat.includes('first birthday') || sub.includes('first birthday');
  }, [decodedCategory, decodedSubcategory]);

  const isBabyShowerCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('baby shower') || sub.includes('baby shower');
  }, [decodedCategory, decodedSubcategory]);

  const isBirthdayCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (cat.includes('birthday') || sub.includes('birthday')) && !cat.includes('1st') && !sub.includes('1st');
  }, [decodedCategory, decodedSubcategory]);

  const isWelcomeBabyCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('welcome baby') || sub.includes('welcome baby') || cat.includes('welcome') || sub.includes('welcome');
  }, [decodedCategory, decodedSubcategory]);

  const isLiveEateriesCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('eater') || sub.includes('eater') || cat.includes('catering') || sub.includes('catering');
  }, [decodedCategory, decodedSubcategory]);

  const isKidsActivitiesCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('activities') || sub.includes('activities') || cat.includes('activit') || sub.includes('activit');
  }, [decodedCategory, decodedSubcategory]);

  const isKidsThemeCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return (cat.includes('kids') || sub.includes('kids')) && !cat.includes('activities') && !sub.includes('activities') && !cat.includes('activit') && !sub.includes('activit');
  }, [decodedCategory, decodedSubcategory]);

  const isPhotographyCategory = useMemo(() => {
    const cat = (decodedCategory || '').toLowerCase();
    const sub = (decodedSubcategory || '').toLowerCase();
    return cat.includes('photo') || cat.includes('video') || sub.includes('photo') || sub.includes('video');
  }, [decodedCategory, decodedSubcategory]);

  const heroBgImage = useMemo(() => {
    if (isPhotographyCategory) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=80';
    if (isProposalCategory) return '/tearce.jpeg';
    if (isCarDecorationCategory) return '/car dilver.jpeg';
    if (isCarBootCategory) return '/car bot.jpeg';
    if (isCabanaCategory) return '/kkkk.jpeg';
    if (isLiveEateriesCategory) return '/liveeee.jpeg';
    if (isKidsActivitiesCategory) return '/kids-activities.jpeg';
    if (isKidsThemeCategory) return '/kids theme.jpeg';
    if (isAnniversaryCategory) return '/romantic-dinner.jpg';
    if (isWallDecorCategory) return '/simple-wall-decor.jpg';
    if (is1stBirthdayCategory) return '/1ss.jpeg';
    if (isBabyShowerCategory) return '/baby-shower.jpg';
    if (isWelcomeBabyCategory) return '/welcome-baby.jpg';
    if (isBirthdayCategory) return '/birthday.jpg';
    // Fall back to the theme's own curated card photo (Graduation, Opening
    // Decors, National Festivals, Naming Ceremonies, Annaprashan, ...) before
    // the generic purple backdrop.
    const themeImg = getServiceGalleryImages(decodedSubcategory || decodedCategory)[0];
    if (themeImg) return themeImg;
    return '/about-purple-decor.png';
  }, [isPhotographyCategory, isProposalCategory, isCarDecorationCategory, isCarBootCategory, isCabanaCategory, isLiveEateriesCategory, isKidsActivitiesCategory, isKidsThemeCategory, isAnniversaryCategory, isWallDecorCategory, is1stBirthdayCategory, isBabyShowerCategory, isWelcomeBabyCategory, isBirthdayCategory, decodedCategory, decodedSubcategory]);


  const currentCategory = useMemo(() => {
    return categories.find(c => c.name.toLowerCase().includes(decodedCategory.toLowerCase()));
  }, [categories, decodedCategory]);

  const subcategories = useMemo(() => {
    const normCat = (decodedCategory || '').toLowerCase();

    const servicesDataSubs = findServiceSubItems(decodedCategory);
    if (servicesDataSubs && servicesDataSubs.length > 0) {
      return servicesDataSubs.map((name) => ({ name, image: getSubServiceImage(name) }));
    }

    if (normCat.includes('photo') || normCat.includes('video')) {
      return [
        { name: 'Event Photography', image: getSubServiceImage('Event Photography') },
        { name: 'Cinematic Videography', image: getSubServiceImage('Cinematic Videography') },
        { name: 'Photo + Video Combo', image: getSubServiceImage('Photo + Video Combo') },
      ];
    }
    if (normCat.includes('kids') || normCat.includes('activit')) {
      return [
        { name: 'Caricature Artist', image: getSubServiceImage('Caricature Artist') },
        { name: 'Emcee / Anchor', image: getSubServiceImage('Emcee / Anchor') },
        { name: 'Birthday Tattoo Artist', image: getSubServiceImage('Birthday Tattoo Artist') },
      ];
    }
    if (normCat.includes('eateries') || normCat.includes('catering')) {
      return [
        { name: 'Turkish Ice Cream', image: getSubServiceImage('Turkish Ice Cream') },
        { name: 'Popcorn', image: getSubServiceImage('Popcorn') },
        { name: 'Chocolate Fountain', image: getSubServiceImage('Chocolate Fountain') },
      ];
    }
    if (normCat.includes('experience')) {
      return [
        { name: 'Cabana Setups', image: '/kkkk.jpeg' },
        { name: 'Proposal Setup', image: '/tearce.jpeg' },
        { name: 'Car Boot Surprises', image: '/car bot.jpeg' },
        { name: 'Car & Bike Decoration', image: '/car dilver.jpeg' },
      ];
    }
    if (!currentCategory?.subcategories) return [];
    return currentCategory.subcategories.filter(
      (s): s is { name: string; image: string } => typeof s === 'object' && s !== null
    );
  }, [currentCategory, decodedCategory]);

  const categoryProducts = useMemo(() => {
    const normCat = decodedCategory.toLowerCase();
    const normSub = decodedSubcategory.toLowerCase();
    const cleanSub = normSub.replace(/[^a-z0-9]/g, '');

    let list = (grouped[decodedCategory] || products).filter((p: AdminProduct) => {
      const pCat = (p.categoryName || '').toLowerCase();
      const pSub = (p.subcategory || '').toLowerCase();
      return pCat.includes(normCat) || normCat.includes(pCat) || pSub.includes(normCat) || normCat.includes('activit');
    });

    if (normSub && normSub !== '__all__') {
      const filtered = list.filter((p: AdminProduct) => {
        const pSubClean = (p.subcategory || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pNameClean = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          (pSubClean && (pSubClean.includes(cleanSub) || cleanSub.includes(pSubClean))) ||
          (pNameClean && (pNameClean.includes(cleanSub) || cleanSub.includes(pNameClean)))
        );
      });
      if (filtered.length > 0) {
        list = filtered;
      } else {
        // Look up in fallback map
        for (const [mapKey, mockItems] of Object.entries(ACTIVITIES_FALLBACK_MAP)) {
          const cleanMapKey = mapKey.replace(/[^a-z0-9]/g, '');
          if (cleanSub.includes(cleanMapKey) || cleanMapKey.includes(cleanSub)) {
            return mockItems;
          }
        }
      }
    }

    if (list.length === 0) {
      const key = normSub || normCat;
      const cleanKey = key.replace(/[^a-z0-9]/g, '');
      // Several fallback buckets intentionally reuse the same experience
      // items under different lookup keys (e.g. "experiences" vs the
      // specific "cabana setups"/"terrace proposals"/"car boot surprises"
      // keys) so category matching resolves either way -- dedupe by _id
      // here so a shared item never renders as two identical cards.
      const seenIds = new Set<string>();
      const allMocks = Object.values(ACTIVITIES_FALLBACK_MAP)
        .flat()
        .filter((p) => {
          if (seenIds.has(p._id)) return false;
          seenIds.add(p._id);
          return true;
        });

      if (key.includes('activit') || key.includes('entert')) {
        list = allMocks;
      } else {
        for (const [mapKey, mockItems] of Object.entries(ACTIVITIES_FALLBACK_MAP)) {
          const cleanMapKey = mapKey.replace(/[^a-z0-9]/g, '');
          if (cleanKey.includes(cleanMapKey) || cleanMapKey.includes(cleanKey)) {
            list = mockItems;
            break;
          }
        }
        if (list.length === 0 && (normCat.includes('activit') || normCat.includes('eateries'))) {
          list = allMocks;
        }
      }
    }

    // Live Eateries: always surface the curated live-counter cards
    // (Instant Maggi, Chaat, Fruit Salad, Pani Puri, Ice Cream Flavours)
    // alongside whatever the DB returns, on the "All" view.
    if ((normCat.includes('eateries') || normCat.includes('catering')) && (!normSub || normSub === '__all__')) {
      const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const have = new Set(list.map((p: AdminProduct) => clean(p.name || '')));
      const extras = ACTIVITIES_FALLBACK_MAP['live eateries'].filter(
        (m) => m._id.startsWith('act_eat_') && !have.has(clean(m.name))
      );
      list = [...list, ...extras];
    }

    // Selected a sub-category that has its own curated photo gallery but no
    // real products of its own (e.g. Groom-to-Be under Pre & Post Wedding):
    // clear the loosely-matched category list so the gallery fallback below
    // shows that sub-category's actual photos instead of unrelated cards.
    if (normSub && normSub !== '__all__') {
      const galleryForSub = getServiceGalleryImages(decodedSubcategory).length > 0
        ? getServiceGalleryImages(decodedSubcategory)
        : getServiceGalleryImages(decodedCategory);
      if (galleryForSub.length > 0) {
        const subMatches = list.some((p: AdminProduct) =>
          (p.subcategory || '').toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSub
        );
        if (!subMatches) list = [];
      }
    }

    // Surface a curated slice of the service's public/ photo gallery as cards
    // alongside whatever the DB returns. The gallery data can be large (100s of
    // photos across a theme); dumping all of them onto one page overwhelms the
    // browser and stalls image loading, so cap the appended count: a light
    // garnish when the DB already has plenty of real products, a fuller set
    // when the category is thin. The full gallery still lives on /gallery.
    {
      const onSubView = Boolean(normSub && normSub !== '__all__');
      const galleryLabel = onSubView ? decodedSubcategory : decodedCategory;
      const galleryImages =
        (onSubView ? getServiceGalleryImages(decodedSubcategory) : []).length > 0
          ? getServiceGalleryImages(decodedSubcategory)
          : getServiceGalleryImages(decodedCategory);

      if (galleryImages.length > 0) {
        const dbCount = list.length;
        const cap = dbCount >= 12 ? 6 : 24;
        // even spread across the gallery rather than only the first N
        const step = Math.max(1, Math.floor(galleryImages.length / cap));
        const picked = galleryImages.filter((_, i) => i % step === 0).slice(0, cap);
        const haveImgs = new Set(list.map((p: AdminProduct) => p.image));
        const extras = buildGalleryCards(galleryLabel, picked, haveImgs);
        list = [...list, ...extras];
      }
    }

    return list;
  }, [grouped, products, decodedCategory, decodedSubcategory]);

  /**
   * When no real products/experiences match this category, fall back to the
   * curated theme photos from public/ (see SERVICE_GALLERY_IMAGES) so the
   * "Our Curated Theme Setups" grid still shows real work as cards rather
   * than an empty state -- e.g. Opening Decors, National Festivals, Graduation.
   */
  const galleryFallbackProducts = useMemo<AdminProduct[]>(() => {
    // Prefer the sub-category's own curated photos; if it has none (e.g.
    // "Marry Me Marquee" under Proposal Setup), fall back to the parent
    // category's full gallery so the section is never empty.
    const images = getServiceGalleryImages(decodedSubcategory || decodedCategory).length > 0
      ? getServiceGalleryImages(decodedSubcategory || decodedCategory)
      : getServiceGalleryImages(decodedCategory);
    if (images.length === 0) return [];
    const label = decodedSubcategory || decodedCategory;
    return images.map((image, idx) => ({
      _id: `gallery-${label}-${idx}`.replace(/\s+/g, '-').toLowerCase(),
      categoryId: 'cat_gallery',
      name: `${label} Theme Setup ${idx + 1}`,
      categoryName: 'Curated Decors',
      subcategory: label,
      price: 2999,
      description: `Handcrafted ${label} decoration setup styled by The Decor Party's verified master decorators in Bengaluru.`,
      image,
      // Full themed gallery on the product page's swipe carousel + thumbnails.
      moreImages: images.filter((x) => x !== image),
      inclusions: [],
      addOns: [],
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 120,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    } as AdminProduct));
  }, [decodedCategory, decodedSubcategory]);

  const usingGalleryFallback = categoryProducts.length === 0 && galleryFallbackProducts.length > 0;
  const displayProducts = usingGalleryFallback ? galleryFallbackProducts : categoryProducts;

  const handleSubcategorySelect = (subName: string) => {
    if (subName === '__all__') {
      navigate(`/category/${encodeURIComponent(decodedCategory)}`);
    } else {
      navigate(`/category/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(subName)}`);
    }
  };

  return (
    <>
      <SeoHead
        title={`${decodedSubcategory ? `${decodedSubcategory} — ` : ''}${decodedCategory} Theme Setups | The Decor Party`}
        description={`Explore handcrafted ${decodedCategory} theme setups, backdrops, and balloon styling in Bengaluru.`}
      />

      <div className="min-h-screen bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#FFF3E6] transition-colors pb-24">
        <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in">
          
          {/* Navigation Bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <BackButton onClick={() => navigate(-1)} aria-label="Go back" />
            
            <div className="flex items-center gap-2 text-xs text-[#381932] dark:text-[#381932] font-medium tracking-wide">
              <span className="cursor-pointer hover:text-[#381932] dark:hover:text-[#FFF3E6] transition-colors" onClick={() => navigate('/explore')}>
                All Services
              </span>
              <span>/</span>
              <span className="font-semibold text-[#381932] dark:text-[#FFF3E6]">{decodedCategory}</span>
              {decodedSubcategory && (
                <>
                  <span>/</span>
                  <span className="font-bold text-[#381932] dark:text-[#FFF3E6]">{decodedSubcategory}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-1.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer shadow-xs"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl bg-[#381932] text-[#FFF3E6] p-8 sm:p-12 lg:p-16 shadow-sm mb-12 min-h-[360px] md:min-h-[440px] flex items-center"
          >
            {/* Background Image: High-Resolution 1920x716 Landscape Photography */}
            <img
              src={heroBgImage}
              alt="Curated Celebration Setup"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-100 pointer-events-none transition-transform duration-700"
            />
            {/* Text Contrast Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#381932] via-[#381932]/55 to-transparent z-10 pointer-events-none" />

            <div className="relative z-20 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3E6]/10 border border-[#FFF3E6]/25 text-[#FFF3E6] text-xs font-medium tracking-wide mb-5 backdrop-blur-xs">
                <Sparkles size={13} className="text-[#FFF3E6]" />
                <span>Your Celebration Sanctuary</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold tracking-tight text-[#FFF3E6] leading-[1.05] mb-4">
                {decodedSubcategory || decodedCategory},{' '}
                <span className="font-script font-normal text-[#FFF3E6]">celebrated beautifully.</span>
              </h1>
              <p className="text-sm md:text-base text-[#FFF3E6]/85 font-normal leading-relaxed max-w-lg mb-8">
                Select from our meticulously designed celebration theme setups, handcrafted by verified master decorators across Bengaluru.
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('curated-accommodations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium tracking-wide text-[#381932] bg-[#FFF3E6] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>Explore Themes</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Curated Theme Accommodations */}
          <motion.div
            id="curated-accommodations"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 scroll-mt-28"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-xs font-semibold tracking-wide text-[#A78A9F] mb-2">
                Premium Celebration Living
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#381932] dark:text-[#381932] tracking-tight leading-tight">
                Our Curated Theme Setups
              </h2>
              <p className="text-sm text-[#381932] dark:text-[#FFF3E6] font-normal mt-2">
                Select from our meticulously designed celebration theme setups in {decodedCategory}.
              </p>
            </div>

            {subcategories.length > 0 && (
              <div className="mb-8 w-full overflow-x-auto pb-3 pt-1 scrollbar-none smooth-horizontal-rail">
                <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-4 mx-auto">
                  <button
                    type="button"
                    onClick={() => handleSubcategorySelect('__all__')}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer border shrink-0 ${
                      !decodedSubcategory || decodedSubcategory === '__all__'
                        ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] dark:bg-[#381932] dark:text-[#381932] dark:border-[#381932]'
                        : 'border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:border-[#381932] hover:text-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]'
                    }`}
                  >
                    All {decodedCategory} Themes
                  </button>
                  {subcategories.map((sub) => {
                    const isSelected =
                      decodedSubcategory?.toLowerCase() === sub.name.toLowerCase() ||
                      (decodedSubcategory && decodedSubcategory.toLowerCase().replace(/[^a-z0-9]/g, '') === sub.name.toLowerCase().replace(/[^a-z0-9]/g, ''));

                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleSubcategorySelect(sub.name)}
                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer border shrink-0 ${
                          isSelected
                            ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] dark:bg-[#381932] dark:text-[#381932] dark:border-[#381932]'
                            : 'border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:border-[#381932] hover:text-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {displayProducts.length === 0 ? (
              <EmptyState
                title="No theme setups found"
                description={`No decoration experiences found matching your search in ${decodedSubcategory || decodedCategory}.`}
                actionLabel="Explore All Packages"
                onAction={() => navigate('/explore')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayProducts.map((product: AdminProduct, idx: number) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={onViewProduct || ((p) => navigate(`/product/${p._id}`, { state: { product: p } }))}
                      onBook={onBookProduct || ((p) => navigate(`/booking/${p._id}`, { state: { product: p, preferredMethod: 'razorpay' } }))}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ========================================================================= */}
          {/* THEME-BASED FAQS SECTION                                                 */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14 mx-auto max-w-4xl"
          >
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-wide text-[#A78A9F] mb-2">
                {decodedCategory} FAQs
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#381932] dark:text-[#FFF3E6] tracking-tight">
                {decodedCategory} Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-[#381932] dark:text-[#FFF3E6] font-normal max-w-xl mx-auto">
                Everything you need to know about booking, timing, balloon customisation, and decorator setup for {decodedCategory}.
              </p>
            </div>

            {/* Accordion Box Container */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#381932]/30 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-md overflow-hidden divide-y divide-[#FFF3E6]/60 dark:divide-[#381932]/60">
              {currentThemeFaqs.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <div key={index} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer hover:bg-[#FFF3E6]/60 dark:hover:bg-[#381932] transition-colors gap-4"
                    >
                      <span className="font-serif text-base sm:text-lg font-bold text-[#381932] dark:text-[#FFF3E6]">
                        {faq.question}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FFF3E6] dark:bg-[#381932] border border-[#381932]/30 dark:border-[#381932] flex items-center justify-center text-[#381932] dark:text-[#381932] shrink-0 font-mono text-sm font-bold">
                        {isOpen ? '−' : '+'}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#381932] dark:text-[#FFF3E6] font-light leading-relaxed animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <ShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            title={`${decodedCategory} Theme Setups - The Decor Party`}
            text={`Check out ${decodedCategory} theme decoration setups on The Decor Party`}
            url={window.location.href}
          />
        </div>
      </div>
    </>
  );
};

export default OccasionPage;
