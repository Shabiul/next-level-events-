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
import { findServiceSubItems } from '../../data/servicesData';
import type { AdminProduct } from '../../types';

const ACTIVITIES_FALLBACK_MAP: Record<string, AdminProduct[]> = {
  'cabana setups': [
    {
      _id: 'exp_cab_1',
      categoryId: 'cat_exp',
      name: 'Rooftop Candlelight Cabana Dining',
      categoryName: 'Experiences',
      subcategory: 'Cabana Setups',
      price: 3499,
      originalPrice: 4500,
      description: 'Dreamy sheer drape cabana with fairy lights, plush floor seating, rose petals, and warm candle illumination.',
      image: '/kkkk.jpeg',
      moreImages: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      ],
      inclusions: ['4-Pillar Weather Canopy', '100+ LED Battery Candles', 'Fresh Red Rose Petal Pathway', 'Fairy Light Drapes'],
      addOns: [],
      badge: 'Bestseller',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 230,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      _id: 'exp_cab_2',
      categoryId: 'cat_exp',
      name: 'Bohemian Terrace Canopy Setup',
      categoryName: 'Experiences',
      subcategory: 'Cabana Setups',
      price: 4999,
      originalPrice: 6500,
      description: 'Chic boho macrame cabana with pampas grass, warm lanterns, and low-table candlelight dining arrangement.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      moreImages: [],
      inclusions: ['Boho Canopy Frame', 'Macrame & Cushion Seating', 'Pampas Floral Vases', 'Warm Lantern Pathway'],
      addOns: [],
      badge: 'Luxury',
      badgeColor: 'gold',
      rating: 4.95,
      reviewCount: 110,
      active: true,
      featured: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  'terrace proposals': [
    {
      _id: 'exp_prop_1',
      categoryId: 'cat_exp',
      name: '4ft MARRY ME LED Marquee Terrace Proposal',
      categoryName: 'Experiences',
      subcategory: 'Terrace Proposals',
      price: 8999,
      originalPrice: 11000,
      description: 'Grand proposal setup featuring 4-foot illuminated MARRY ME marquee letters, plush red carpet aisle, and heart arch.',
      image: '/tearce.jpeg',
      moreImages: [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
      ],
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
      description: 'Surprise car trunk styling with fairy light stringing, helium balloons, customized photo bunting, and gift boxes.',
      image: '/car bot.jpeg',
      moreImages: [],
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
      description: 'Dreamy pastel balloon arch with 3D teddy bear mascot cutouts, cloud stands, and personalized name board.',
      image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80',
      moreImages: [],
      inclusions: ['Organic Pastel Balloon Arch', 'Giant Plush Teddy Bear Props', 'Customized Name Board', 'LED Warm Backdrop Lights'],
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
  'experiences': [
    {
      _id: 'exp_gen_1',
      categoryId: 'cat_exp',
      name: 'Rooftop Candlelight Cabana Dining',
      categoryName: 'Experiences',
      subcategory: 'Cabana Setups',
      price: 3499,
      originalPrice: 4500,
      description: 'Dreamy sheer drape cabana with fairy lights, plush floor seating, rose petals, and warm candle illumination.',
      image: '/kkkk.jpeg',
      moreImages: [],
      inclusions: ['4-Pillar Weather Canopy', '100+ LED Battery Candles', 'Fresh Red Rose Petal Pathway', 'Fairy Light Drapes'],
      addOns: [],
      badge: 'Popular',
      badgeColor: 'purple',
      rating: 4.9,
      reviewCount: 230,
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      _id: 'exp_gen_2',
      categoryId: 'cat_exp',
      name: '4ft MARRY ME LED Marquee Proposal',
      categoryName: 'Experiences',
      subcategory: 'Terrace Proposals',
      price: 8999,
      originalPrice: 11000,
      description: 'Grand proposal setup featuring 4-foot illuminated MARRY ME marquee letters, plush red carpet aisle, and heart arch.',
      image: '/tearce.jpeg',
      moreImages: [],
      inclusions: ['4ft MARRY ME Illuminated Letters', '20ft Plush Red Carpet Aisle', 'Heart Floral Arch'],
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
    {
      _id: 'exp_gen_3',
      categoryId: 'cat_exp',
      name: 'Midnight Car Boot Surprise Decor',
      categoryName: 'Experiences',
      subcategory: 'Car Boot Surprises',
      price: 1999,
      originalPrice: 2800,
      description: 'Surprise car trunk styling with fairy light stringing, helium balloons, customized photo bunting, and gift boxes.',
      image: '/car bot.jpeg',
      moreImages: [],
      inclusions: ['Custom Car Trunk Styling', 'Fairy Light Garland', '10 Printed Memories Photo Bunting'],
      addOns: [],
      badge: 'Surprise',
      badgeColor: 'purple',
      rating: 4.85,
      reviewCount: 195,
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
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
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
  'photography & videography': [
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

const THEME_FAQS_MAP: Record<string, { question: string; answer: string }[]> = {
  birthday: [
    {
      question: 'How early should I book a birthday balloon setup in Bengaluru?',
      answer: 'We recommend booking 3–7 days in advance. For urgent requirements, we also offer 3-hour emergency setup slots across all Bengaluru pincodes.'
    },
    {
      question: 'Can we customize the balloon color palette and neon name signs?',
      answer: 'Yes! All milestone birthday setups include customizable balloon color schemes (Pastel, Metallic, Gold, Chrome) and custom LED neon name signage.'
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
        answer: `We recommend booking 3–7 days in advance. We also support express 3-hour emergency setups across all Bengaluru pincodes.`
      },
      {
        question: `Can I customize colors and elements for ${decodedCategory}?`,
        answer: `Yes! All setups are 100% customizable in balloon color combinations, neon text, flower selection, and backdrop sizing.`
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
    return cat.includes('eater') || sub.includes('eater') || cat.includes('live') || sub.includes('live');
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
    return '/about-purple-decor.png';
  }, [isPhotographyCategory, isProposalCategory, isCarBootCategory, isCabanaCategory, isLiveEateriesCategory, isKidsActivitiesCategory, isKidsThemeCategory, isAnniversaryCategory, isWallDecorCategory, is1stBirthdayCategory, isBabyShowerCategory, isWelcomeBabyCategory, isBirthdayCategory]);

  const heroImageClass = useMemo(() => {
    if (isPhotographyCategory) return 'object-cover object-center';
    if (isLiveEateriesCategory) return 'object-cover object-center';
    if (isKidsActivitiesCategory) return 'object-cover object-center';
    if (isKidsThemeCategory) return 'object-cover object-[center_65%]';
    return 'object-cover object-center';
  }, [isPhotographyCategory, isLiveEateriesCategory, isKidsActivitiesCategory, isKidsThemeCategory]);

  const currentCategory = useMemo(() => {
    return categories.find(c => c.name.toLowerCase().includes(decodedCategory.toLowerCase()));
  }, [categories, decodedCategory]);

  const subcategories = useMemo(() => {
    const normCat = (decodedCategory || '').toLowerCase();

    const servicesDataSubs = findServiceSubItems(decodedCategory);
    if (servicesDataSubs && servicesDataSubs.length > 0) {
      return servicesDataSubs.map((name) => ({ name, image: '' }));
    }

    if (normCat.includes('photo') || normCat.includes('video')) {
      return [
        { name: 'Event Photography', image: '' },
        { name: 'Cinematic Videography', image: '' },
        { name: 'Photo + Video Combo', image: '' },
      ];
    }
    if (normCat.includes('kids') || normCat.includes('activit')) {
      return [
        { name: 'Caricature Artist', image: '' },
        { name: 'Emcee / Anchor', image: '' },
        { name: 'Birthday Tattoo Artist', image: '' },
      ];
    }
    if (normCat.includes('eateries') || normCat.includes('live')) {
      return [
        { name: 'Turkish Ice Cream', image: '' },
        { name: 'Popcorn', image: '' },
        { name: 'Chocolate Fountain', image: '' },
      ];
    }
    if (normCat.includes('experience')) {
      return [
        { name: 'Cabana Setups', image: '' },
        { name: 'Terrace Proposals', image: '' },
        { name: 'Car Boot Surprises', image: '' },
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
      const allMocks = Object.values(ACTIVITIES_FALLBACK_MAP).flat();

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

    return list;
  }, [grouped, products, decodedCategory, decodedSubcategory]);

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
        title={`${decodedSubcategory ? `${decodedSubcategory} — ` : ''}${decodedCategory} Theme Setups | TheDecorParty`}
        description={`Explore handcrafted ${decodedCategory} theme setups, backdrops, and balloon styling in Bengaluru.`}
      />

      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1B101F] text-[#1C1B22] dark:text-[#FAF8F5] transition-colors pb-24">
        <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in">
          
          {/* Navigation Bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <BackButton onClick={() => navigate(-1)} aria-label="Go back" />
            
            <div className="flex items-center gap-2 text-xs text-[#6B6B76] dark:text-[#A78A9F] font-medium tracking-wide">
              <span className="cursor-pointer hover:text-[#1C1B22] dark:hover:text-white transition-colors" onClick={() => navigate('/explore')}>
                All Services
              </span>
              <span>/</span>
              <span className="font-semibold text-[#1C1B22] dark:text-[#FAF8F5]">{decodedCategory}</span>
              {decodedSubcategory && (
                <>
                  <span>/</span>
                  <span className="font-bold text-[#1C1B22] dark:text-white">{decodedSubcategory}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DEF2] dark:border-[#483250] bg-white dark:bg-[#201325] px-3.5 py-1.5 text-xs font-semibold text-[#1C1B22] dark:text-[#FAF8F5] hover:bg-[#FAF6F0] dark:hover:bg-[#2F1D35] transition-colors cursor-pointer shadow-xs"
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
            className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#120A16] text-[#FAF8F5] p-8 sm:p-12 lg:p-16 shadow-2xl border border-[#8F6FC4]/20 mb-12 min-h-[380px] md:min-h-[460px] flex items-center"
          >
            {/* Background Image: High-Resolution 1920x716 Landscape Photography */}
            <img
              src={heroBgImage}
              alt="Curated Celebration Setup"
              className={`absolute inset-0 w-full h-full opacity-100 pointer-events-none transition-transform duration-700 ${heroImageClass}`}
            />
            {/* Neutral Text Contrast Gradient Scrim (No Purple Tint) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#120A16] via-[#120A16]/65 to-transparent z-10 pointer-events-none" />

            <div className="relative z-20 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#482E54]/60 border border-[#8F6FC4]/30 text-[#C7B8E8] text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-md mb-5 backdrop-blur-xs">
                <Sparkles size={13} className="text-[#C7B8E8]" />
                <span>YOUR CELEBRATION SANCTUARY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-white uppercase leading-[1.05] mb-4">
                {decodedSubcategory || decodedCategory}
                <br />
                <span className="font-serif italic text-[#E5D7C2] lowercase text-[0.88em]">
                  theme setups
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#F2EEFA]/90 font-light leading-relaxed max-w-lg mb-8">
                Select from our meticulously designed celebration theme sanctuaries handcrafted by verified master decorators across Bengaluru.
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('curated-accommodations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#1C1B22] bg-[#E5D7C2] hover:bg-white shadow-xl hover:scale-102 transition-all cursor-pointer"
              >
                <span>EXPLORE THEMES NOW</span>
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
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6B6B76] dark:text-[#A78A9F] mb-2">
                PREMIUM CELEBRATION LIVING
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1B22] dark:text-[#FAF8F5] tracking-tight uppercase leading-tight">
                Our Curated Theme Setups
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3] font-light mt-2">
                Select from our meticulously designed celebration theme setups in {decodedCategory}.
              </p>
            </div>

            {subcategories.length > 0 && (
              <div className="mb-8 w-full overflow-x-auto pb-3 pt-1 scrollbar-none smooth-horizontal-rail">
                <div className="flex items-center justify-start md:justify-center gap-2.5 min-w-max px-4 mx-auto">
                  <button
                    type="button"
                    onClick={() => handleSubcategorySelect('__all__')}
                    className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border shadow-xs shrink-0 ${
                      !decodedSubcategory || decodedSubcategory === '__all__'
                        ? 'border-[#8F6FC4] bg-[#8F6FC4] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] dark:border-[#C9BEAB]'
                        : 'border-[#E4DEF2] bg-[#FAF6F0] text-[#6B6B76] hover:bg-[#FAF8F5] hover:border-[#8F6FC4] hover:text-[#1C1B22] dark:bg-[#201325] dark:border-[#483250] dark:text-[#C8B5C3]'
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
                        className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border shadow-xs shrink-0 ${
                          isSelected
                            ? 'border-[#8F6FC4] bg-[#8F6FC4] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] dark:border-[#C9BEAB]'
                            : 'border-[#E4DEF2] bg-[#FAF6F0] text-[#6B6B76] hover:bg-[#FAF8F5] hover:border-[#8F6FC4] hover:text-[#1C1B22] dark:bg-[#201325] dark:border-[#483250] dark:text-[#C8B5C3]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {categoryProducts.length === 0 ? (
              <EmptyState
                title="No theme setups found"
                description={`No decoration experiences found matching your search in ${decodedSubcategory || decodedCategory}.`}
                actionLabel="Explore All Packages"
                onAction={() => navigate('/explore')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product: AdminProduct, idx: number) => (
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
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#6B6B76] dark:text-[#A78A9F] mb-2">
                — {decodedCategory.toUpperCase()} FAQS —
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1C1B22] dark:text-[#FAF8F5] tracking-tight">
                {decodedCategory} Frequently Asked Questions
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3] font-light max-w-xl mx-auto">
                Everything you need to know about booking, timing, balloon customization, and decorator setup for {decodedCategory}.
              </p>
            </div>

            {/* Accordion Box Container */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#E4DEF2] dark:border-[#483250] bg-white dark:bg-[#201325] shadow-md overflow-hidden divide-y divide-[#E4DEF2]/60 dark:divide-[#483250]/60">
              {currentThemeFaqs.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <div key={index} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer hover:bg-[#FAF8F5]/60 dark:hover:bg-[#2A1830] transition-colors gap-4"
                    >
                      <span className="font-serif text-base sm:text-lg font-bold text-[#1C1B22] dark:text-[#FAF8F5]">
                        {faq.question}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#34203C] border border-[#E4DEF2] dark:border-[#483250] flex items-center justify-center text-[#1C1B22] dark:text-[#C9BEAB] shrink-0 font-mono text-sm font-bold">
                        {isOpen ? '−' : '+'}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3] font-light leading-relaxed animate-fade-in">
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
            title={`${decodedCategory} Theme Setups - TheDecorParty`}
            text={`Check out ${decodedCategory} theme decoration setups on TheDecorParty`}
            url={window.location.href}
          />
        </div>
      </div>
    </>
  );
};

export default OccasionPage;
