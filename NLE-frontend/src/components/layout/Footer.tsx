import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Shield,
  MessageSquare,
} from 'lucide-react';
import type { AdminCategory, Translations } from '../../types';
import { trackContactClick, trackWhatsappClick } from '../../utils/analytics';

interface FooterProps {
  t?: Translations | Record<string, string>;
  onPageOpen?: (key: 'terms' | 'privacy' | 'refund' | 'about') => void;
  categories?: AdminCategory[];
  onSelectCategory?: (categoryName: string) => void;
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const BENGALURU_HUBS = [
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Electronic City',
  'Jayanagar',
  'Malleshwaram',
  'Sarjapur Road',
  'Hebbal',
  'Bellandur',
  'Yelahanka',
  'JP Nagar',
];

export const Footer: React.FC<FooterProps> = ({
  t,
  onPageOpen,
  categories = [],
  onSelectCategory,
}) => {
  const linkClass =
    'text-xs sm:text-[13px] font-normal tracking-wide text-[#FFF3E6]/75 hover:text-[#FFF3E6] transition-colors duration-200 cursor-pointer text-left flex items-center gap-1.5 group';
  const colTitleClass =
    'mb-4 text-xs font-semibold uppercase tracking-wider text-[#FFF3E6] font-serif';

  const quickLinks: { label: string; key: 'about' | 'privacy' | 'terms' | 'refund' }[] = [
    { label: 'About Us', key: 'about' },
    { label: 'How It Works', key: 'about' },
    { label: 'Celebration Gallery', key: 'about' },
    { label: 'Customer Reviews', key: 'about' },
    { label: 'Terms & Conditions', key: 'terms' },
    { label: 'Privacy Policy', key: 'privacy' },
    { label: 'Cancellation & Refund', key: 'refund' },
  ];

  const packagesList = [
    'Express Delivery',
    'Pastel Balloon Arches',
    'Terrace Candlelight Cabana',
    'Milestone Neon Ring Backdrops',
    'Grand 1st Birthday Themes',
    'Kids Activities & Live Eateries',
  ];

  const whatsappUrl = `https://wa.me/917022058460?text=${encodeURIComponent(
    "Hi The Decor Party! I'd like to plan an event. Can you help me with the details?"
  )}`;

  return (
    <footer id="footer" data-nav-theme="dark" className="relative bg-[#381932] text-[#FFF3E6] border-t border-[#FFF3E6]/10 overflow-hidden scroll-mt-24 sm:scroll-mt-28">

      {/* Ambient background glows -- low intensity Khaki/Lilac against the dark base */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#A78A9F]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#A78A9F]/15 blur-3xl" />

      {/* ===================================================================== */}
      {/* 1. FINAL CTA BAND -- same "Let's Plan Your Perfect Celebration" offer */}
      {/* as the Home page banner, styled for this dark footer and shown on    */}
      {/* every page.                                                          */}
      {/* ===================================================================== */}
      <div
        className="relative overflow-hidden py-12 sm:py-14 px-6 sm:px-10 text-center border-b border-[#FFF3E6]/10"
        style={{ background: 'linear-gradient(145deg, #381932 0%, #381932 55%, #381932 100%)' }}
      >
        <Sparkles className="absolute left-[8%] top-8 h-6 w-6 text-[#FFF3E6]/40 hidden sm:block" />
        <Sparkles className="absolute right-[8%] bottom-8 h-8 w-8 text-[#FFF3E6]/50 hidden sm:block" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-3 sm:gap-4">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.15] text-[#FFF3E6]">
            Let&apos;s Plan Your Perfect Celebration!
          </h2>

          <p className="text-xs sm:text-sm text-[#FFF3E6]/75 max-w-lg leading-relaxed">
            Share your ideas and we&apos;ll bring them to life — tell us where you&apos;re celebrating and what theme you need.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFF3E6] px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-wide text-[#381932] hover:opacity-90 shadow-lg transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Get a Free Quote</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsappClick('footer_cta')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFF3E6]/10 border border-[#FFF3E6]/20 px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-medium tracking-wide text-[#FFF3E6] hover:bg-[#FFF3E6]/15 transition-colors cursor-pointer"
            >
              <MessageSquare size={15} className="text-[#FFF3E6]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. 5-COLUMN CLEAN FOOTER (Matching Image 2 Style & Proportions)       */}
      {/* ===================================================================== */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 py-10 md:py-12 relative z-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-10">

          {/* Col 1 — Brand Story & Socials (Image 2 style, 3.5 cols) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between">
            <div>
              <div className="mb-3.5 flex items-center gap-2.5">
                <img
                  src="/final_logo.jpeg"
                  alt="The Decor Party"
                  className="h-8 w-8 rounded-lg object-contain shadow-xs border border-[#FFF3E6]/15"
                />
                <span className="font-serif text-lg font-semibold tracking-wide text-[#FFF3E6]">
                  The Decor Party
                </span>
              </div>

              <p className="mb-5 text-xs sm:text-[13px] font-normal leading-relaxed text-[#FFF3E6]/60 max-w-xs">
                {t?.footer_copy ||
                  'A Bengaluru-based celebration and décor studio offering bespoke balloon styling, romantic candlelight setups, milestone themes, and custom party experiences across Karnataka.'}
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFF3E6]/15 bg-[#FFF3E6]/5 text-[#FFF3E6]/70 hover:bg-[#FFF3E6]/10 hover:text-[#FFF3E6] transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/thedecorparty.com_?utm_source=qr&igsh=MW15aTFvOWY0MjU1cg=="
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFF3E6]/15 bg-[#FFF3E6]/5 text-[#FFF3E6]/70 hover:bg-[#FFF3E6]/10 hover:text-[#FFF3E6] transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                onClick={() => trackWhatsappClick('footer')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFF3E6]/15 bg-[#FFF3E6]/5 text-[#FFF3E6] hover:bg-[#FFF3E6]/10 transition-colors"
              >
                <WhatsAppIcon />
              </a>
              <a
                href="mailto:thedecorparty.team@gmail.com"
                aria-label="Email"
                onClick={() => trackContactClick('email', 'footer')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFF3E6]/15 bg-[#FFF3E6]/5 text-[#FFF3E6]/70 hover:bg-[#FFF3E6]/10 hover:text-[#FFF3E6] transition-colors"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Col 2 — COMPANY (Image 2 style, 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className={colTitleClass}>COMPANY</h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    className={linkClass}
                    onClick={() => onPageOpen?.(link.key)}
                  >
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/ai-planner"
                  className={`${linkClass} text-[#FFF3E6] hover:text-[#FFF3E6] font-medium`}
                >
                  <Sparkles size={13} className="text-[#FFF3E6]" />
                  <span>AI Party Planner ✨</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className={`${linkClass} text-[#FFF3E6] hover:text-[#FFF3E6] font-medium`}
                >
                  <Shield size={12} className="text-[#FFF3E6]" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — SERVICES / OCCASIONS (Image 2 style, 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className={colTitleClass}>SERVICES</h4>
            <ul className="flex flex-col gap-2">
              {(categories.length > 0
                ? categories.slice(0, 6)
                : [
                    { name: 'Birthday Celebrations' },
                    { name: '1st Birthday Grand Themes' },
                    { name: 'Welcome Baby & Cradle' },
                    { name: 'Baby Shower Pastels' },
                    { name: 'Anniversary Cabana' },
                    { name: 'Pre & Post Wedding' },
                  ]
              ).map((cat) => (
                <li key={cat.name}>
                  <button
                    className={linkClass}
                    onClick={() => onSelectCategory?.(cat.name)}
                  >
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — PACKAGES (Image 2 style, 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className={colTitleClass}>PACKAGES</h4>
            <ul className="flex flex-col gap-2">
              {packagesList.map((pkg) => (
                <li key={pkg}>
                  <a
                    href="/explore"
                    className={linkClass}
                  >
                    <span>{pkg}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — CONTACT (Image 2 style, 3 cols) */}
          <div className="lg:col-span-3">
            <h4 className={colTitleClass}>CONTACT</h4>
            
            <div className="flex flex-col gap-3">
              <a
                href="tel:+917022058460"
                onClick={() => trackContactClick('phone', 'footer')}
                className="flex items-center gap-2.5 text-xs text-[#FFF3E6]/85 hover:text-[#FFF3E6] transition-colors"
              >
                <Phone size={14} className="text-[#FFF3E6] shrink-0" />
                <span className="font-medium">+91 70220 58460</span>
              </a>

              <a
                href="tel:+918660924212"
                onClick={() => trackContactClick('phone', 'footer')}
                className="flex items-center gap-2.5 text-xs text-[#FFF3E6]/85 hover:text-[#FFF3E6] transition-colors"
              >
                <Phone size={14} className="text-[#FFF3E6] shrink-0" />
                <span className="font-medium">+91 86609 24212</span>
              </a>

              <a
                href="mailto:thedecorparty.team@gmail.com"
                onClick={() => trackContactClick('email', 'footer')}
                className="flex items-center gap-2.5 text-xs text-[#FFF3E6]/85 hover:text-[#FFF3E6] transition-colors"
              >
                <Mail size={14} className="text-[#FFF3E6] shrink-0" />
                <span className="truncate">thedecorparty.team@gmail.com</span>
              </a>

              <div className="flex items-start gap-2.5 text-xs text-[#FFF3E6]/85 pt-0.5">
                <MapPin size={14} className="text-[#FFF3E6] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] leading-relaxed text-[#FFF3E6]/55">
                    JP Nagar 2nd Block, Bengaluru, Karnataka 560078
                  </span>
                  <a
                    href="https://maps.app.goo.gl/QBxcs1d8v4KjpxuLA"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-[#FFF3E6] hover:underline transition-colors"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Embedded Google Map -- same studio location as the Contact page */}
              <a
                href="https://maps.app.goo.gl/QBxcs1d8v4KjpxuLA"
                target="_blank"
                rel="noreferrer"
                aria-label="Open The Decor Party studio location in Google Maps"
                className="mt-1 block overflow-hidden rounded-xl border border-[#FFF3E6]/15 group"
              >
                <iframe
                  title="The Decor Party studio location"
                  src="https://www.google.com/maps?q=12.914333,77.573889&z=15&hl=en&output=embed"
                  className="h-32 w-full border-0 pointer-events-none grayscale-[0.15] group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFF3E6] hover:text-[#FFF3E6] transition-colors pt-1"
              >
                <span>Send Custom Enquiry →</span>
              </Link>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* 3. BENGALURU SERVICE HUBS PILL RIBBON                               */}
        {/* =================================================================== */}
        <div className="mt-8 pt-5 border-t border-[#FFF3E6]/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#FFF3E6]/55 shrink-0">
              <MapPin size={13} className="text-[#FFF3E6]" />
              <span>Direct Setup Zones:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {BENGALURU_HUBS.map((hub) => (
                <span
                  key={hub}
                  className="rounded-full bg-[#FFF3E6]/5 border border-[#FFF3E6]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#FFF3E6]/60 hover:border-[#381932] hover:text-[#FFF3E6] transition-colors cursor-default"
                >
                  {hub}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 4. BOTTOM COPYRIGHT & LEGAL BAR                                       */}
      {/* ===================================================================== */}
      <div className="border-t border-[#FFF3E6]/10 bg-[#381932] px-5 sm:px-8 lg:px-12 py-3.5">
        <div className="mx-auto flex max-w-[1720px] flex-col sm:flex-row items-center justify-between gap-2.5 text-center text-[11px] text-[#FFF3E6]/50">
          <p>© 2026 The Decor Party. All rights reserved. Registered celebration partner.</p>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => onPageOpen?.('privacy')}
              className="hover:text-[#FFF3E6] transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onPageOpen?.('terms')}
              className="hover:text-[#FFF3E6] transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => onPageOpen?.('refund')}
              className="hover:text-[#FFF3E6] transition-colors"
            >
              Refund Policy
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-[#FFF3E6]">
            <Sparkles size={11} className="text-[#FFF3E6]" />
            <span>Curated celebrations &amp; luxury event styling</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
