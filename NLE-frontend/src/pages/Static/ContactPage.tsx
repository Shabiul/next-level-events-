import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Send,
  Copy,
  Check,
  Clock,
  ChevronDown,
  ShieldCheck,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SeoHead } from '../../components/layout/SeoHead';
import { getApiUrl } from '../../services/api.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPPORT_PHONE_PRIMARY = '+917022058460';
const SUPPORT_PHONE_SECONDARY = '+918660924212';
const SUPPORT_EMAIL = 'thedecorparty.team@gmail.com';
const WHATSAPP_DEFAULT_MSG =
  "Hi The Decor Party! I'd like to plan an event. Can you help me with the details?";
const MAPS_LINK = 'https://maps.app.goo.gl/QBxcs1d8v4KjpxuLA';
const MAPS_EMBED =
  'https://www.google.com/maps?q=12.914333,77.573889&z=15&hl=en&output=embed';
const STUDIO_ADDRESS = 'JP Nagar 2nd Block, Bengaluru, Karnataka 560078';
const CTA_IMAGE = '/kkkk.jpeg';

const OCCASION_TYPES = [
  'Milestone Birthday',
  'Romantic Proposal & Cabana',
  'Baby Shower / Welcome Baby',
  'Anniversary Celebration',
  'Kids Theme Party',
  'Pre & Post Wedding Decor',
  'Custom Experience',
];

const SERVICE_PINCODES = [
  '560038 (Indiranagar)',
  '560034 (Koramangala)',
  '560066 (Whitefield)',
  '560102 (HSR Layout)',
  '560011 (Jayanagar)',
  '560078 (JP Nagar)',
  '560103 (Sarjapur)',
  '560024 (Hebbal)',
  '560100 (E-City)',
  'All Bengaluru Pincodes Covered',
];

/* Small decorative heart divider used under headings */
const HeartDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden="true">
    <span className="h-px w-6 bg-[#E6D7C5]" />
    <Heart size={11} className="text-[#A78A9F] fill-[#A78A9F]" />
    <span className="h-px w-6 bg-[#E6D7C5]" />
  </span>
);

/* Thin botanical line sprig */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" aria-hidden="true">
    <path
      d="M10 70 C 40 60, 60 40, 110 10"
      stroke="#A78A9F"
      strokeWidth="1.25"
      strokeLinecap="round"
      opacity="0.5"
    />
    {[22, 40, 58, 76, 94].map((x, i) => (
      <path
        key={x}
        d={`M${x} ${62 - i * 12} q 10 -6 16 -16 q -12 2 -16 16`}
        stroke="#A78A9F"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.4"
      />
    ))}
  </svg>
);

const INPUT_CLASS =
  "w-full rounded-xl bg-[#FFF3E6] border border-[#E6D7C5] px-4 py-3.5 text-sm font-poppins text-[#381932] placeholder:text-[#381932]/45 focus:border-[#A78A9F] focus:outline-none focus:ring-2 focus:ring-[#A78A9F]/35 transition-all duration-200";
const LABEL_CLASS =
  "text-[11px] font-poppins font-semibold uppercase tracking-[0.06em] text-[#381932]";

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    contact: '',
    occasion: 'Milestone Birthday',
    date: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showPincodes, setShowPincodes] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = formData.name.trim();
    const contact = formData.contact.trim();
    if (!name || !contact) {
      toast.error('Please provide your name and email/WhatsApp number');
      return;
    }

    const contactIsEmail = EMAIL_RE.test(contact);
    const email = contactIsEmail ? contact : formData.phone.trim() && EMAIL_RE.test(formData.phone.trim()) ? formData.phone.trim() : '';
    const phone = (!contactIsEmail ? contact : formData.phone.trim()) || '';

    if (!phone || !/^[+\d][\d\s-]{6,}$/.test(phone)) {
      toast.error('Please add a valid WhatsApp/phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          eventType: formData.occasion,
          eventDate: formData.date,
          message: formData.message.trim() || 'I would like to discuss styling options for my celebration.',
          source: 'contact-page',
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        throw new Error(body?.message || 'Could not send your message.');
      }
      toast.success(body.message || "Thanks! We'll be in touch shortly.");
      setFormData({ name: '', phone: '', contact: '', occasion: 'Milestone Birthday', date: '', message: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try WhatsApp instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Contact Us — The Decor Party | Bespoke Celebration & Event Styling"
        description="Talk to The Decor Party's master stylists in Bengaluru. Instant WhatsApp quotes, studio location, and enquiries for weddings, birthdays, proposals and bespoke celebrations."
      />

      <div className="w-full min-h-screen bg-[#FFF3E6] text-[#381932] font-poppins antialiased selection:bg-[#A78A9F]/25 overflow-x-hidden pb-4">

        {/* ================================================================= */}
        {/* 1. HERO + CONTACT FORM                                            */}
        {/* ================================================================= */}
        <section className="relative w-full max-w-7xl mx-auto pt-12 sm:pt-16 pb-10 px-5 sm:px-8">
          {/* Organic decorative shapes */}
          <div className="pointer-events-none absolute -top-10 -left-24 h-72 w-72 rounded-full bg-[#A78A9F]/18 blur-3xl" />
          <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-[45%_55%_60%_40%] bg-[#A78A9F]/12 blur-3xl" />
          <Sprig className="pointer-events-none absolute -bottom-6 left-4 hidden lg:block w-40 h-28 opacity-70" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

            {/* LEFT — Editorial */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex flex-col justify-center relative"
            >
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E6D7C5] bg-[#FFF3E6] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A78A9F] mb-6">
                <Heart size={11} className="fill-[#A78A9F] text-[#A78A9F]" />
                Contact Us
              </span>

              <h1 className="font-serif font-bold leading-[1.02] tracking-tight text-[#381932] text-4xl sm:text-5xl lg:text-[58px]">
                LET&apos;S MAKE YOUR<br />
                CELEBRATION<br />
                <span className="text-[#A78A9F]">MEMORABLE</span>
              </h1>

              <p className="font-script text-2xl sm:text-[28px] text-[#A78A9F] mt-5 mb-5">
                Every celebration starts with a conversation.
              </p>

              <p className="text-sm sm:text-[15px] leading-relaxed text-[#381932]/80 max-w-md">
                Whether you&apos;re planning a milestone birthday, a romantic proposal, or a
                bespoke celebration, our master stylists are ready to craft your dream setup.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E6D7C5] bg-[#FFF3E6] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#381932]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A78A9F]/20">
                    <ShieldCheck size={13} className="text-[#381932]" />
                  </span>
                  Zero Hidden Fees
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E6D7C5] bg-[#FFF3E6] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#381932]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A78A9F]/20">
                    <CheckCircle2 size={13} className="text-[#381932]" />
                  </span>
                  100% Picture Match
                </span>
              </div>

              {/* Lead stylist chip */}
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#E6D7C5] bg-[#FFF3E6] p-4 shadow-[0_10px_30px_-18px_rgba(56,25,50,0.25)] max-w-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#381932] font-serif text-base font-semibold text-[#FFF3E6]">
                  RP
                </div>
                <div>
                  <span className="block font-serif text-[15px] font-semibold text-[#381932]">
                    Revanth &amp; Prashanth B S
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[#381932]/70">
                    <Clock size={12} className="text-[#A78A9F]" />
                    Average response: &lt; 15 mins
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Form card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="lg:col-span-7 relative rounded-[24px] border border-[#E6D7C5] bg-[#FFF3E6] p-6 sm:p-9 shadow-[0_30px_60px_-30px_rgba(56,25,50,0.28)]"
            >
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-[#381932]">
                  SEND US A MESSAGE
                </h2>
                <HeartDivider className="my-2.5" />
                <p className="text-xs sm:text-sm text-[#381932]/70 max-w-md mx-auto">
                  Fill in your details below and our creative team will connect with you right away.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>Email / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210 or name@gmail.com"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Occasion Type *</label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className={`${INPUT_CLASS} cursor-pointer`}
                    >
                      {OCCASION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Celebration Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`${INPUT_CLASS} cursor-pointer`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>Your Message / Special Requests *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your event date, preferred colours, theme ideas, or venue details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] py-4 text-sm font-serif font-semibold tracking-wide shadow-[0_16px_34px_-16px_rgba(56,25,50,0.6)] transition-colors cursor-pointer disabled:opacity-70"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'SENDING...' : 'SEND ENQUIRY →'}</span>
                </motion.button>

                <p className="text-center text-xs text-[#381932]/60 flex items-center justify-center gap-1.5">
                  <Heart size={11} className="text-[#A78A9F] fill-[#A78A9F]" />
                  Our team will get back to you within 24 hours.
                </p>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CONTACT INFORMATION — 3 CARDS                                  */}
        {/* ================================================================= */}
        <section className="relative w-full max-w-7xl mx-auto py-10 px-5 sm:px-8">
          <Sprig className="pointer-events-none absolute -top-4 -left-6 hidden lg:block w-36 h-24 -scale-x-100 opacity-55" />
          <Sprig className="pointer-events-none absolute -bottom-4 -right-6 hidden lg:block w-36 h-24 rotate-180 opacity-55" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">

            {/* Card 1 — Hotline */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="group flex flex-col rounded-[22px] border border-[#E6D7C5] bg-[#FFF3E6] p-6 sm:p-7 text-center shadow-[0_18px_40px_-28px_rgba(56,25,50,0.3)] hover:-translate-y-1 hover:shadow-[0_26px_52px_-26px_rgba(56,25,50,0.35)] transition-all duration-300"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A78A9F] text-[#FFF3E6] shadow-[0_10px_22px_-8px_rgba(167,138,159,0.9)] group-hover:bg-[#8C6E84] transition-colors">
                <Phone size={22} />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold uppercase tracking-tight text-[#381932]">
                Direct Stylist Hotline
              </h3>
              <HeartDivider className="my-3" />
              <p className="text-xs leading-relaxed text-[#381932]/75">
                Call or WhatsApp our team directly for instant pricing, custom themes, and same-day availability.
              </p>
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <a href={`tel:${SUPPORT_PHONE_PRIMARY}`} className="text-sm font-semibold text-[#381932] hover:text-[#A78A9F] transition-colors">
                  +91 70220 58460 <span className="text-[10px] font-normal text-[#381932]/50 uppercase">(Primary)</span>
                </a>
                <a href={`tel:${SUPPORT_PHONE_SECONDARY}`} className="text-sm font-semibold text-[#381932] hover:text-[#A78A9F] transition-colors">
                  +91 86609 24212 <span className="text-[10px] font-normal text-[#381932]/50 uppercase">(Operations)</span>
                </a>
              </div>
              <a
                href={`https://wa.me/${SUPPORT_PHONE_PRIMARY.replace('+', '')}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] py-3 text-xs font-serif font-semibold tracking-wide transition-colors"
              >
                <MessageSquare size={15} />
                CHAT ON WHATSAPP →
              </a>
            </motion.div>

            {/* Card 2 — Location */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="group flex flex-col rounded-[22px] border border-[#E6D7C5] bg-[#FFF3E6] p-6 sm:p-7 text-center shadow-[0_18px_40px_-28px_rgba(56,25,50,0.3)] hover:-translate-y-1 hover:shadow-[0_26px_52px_-26px_rgba(56,25,50,0.35)] transition-all duration-300"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A78A9F] text-[#FFF3E6] shadow-[0_10px_22px_-8px_rgba(167,138,159,0.9)] group-hover:bg-[#8C6E84] transition-colors">
                <MapPin size={22} />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold uppercase tracking-tight text-[#381932]">
                Studio Location &amp; Coverage
              </h3>
              <HeartDivider className="my-3" />
              <p className="text-xs leading-relaxed text-[#381932]/75">
                Serving Indiranagar, Koramangala, Whitefield, HSR Layout, Jayanagar, and all neighbourhoods across Bengaluru.
              </p>

              <button
                type="button"
                onClick={() => setShowPincodes(!showPincodes)}
                className="mt-4 w-full flex items-center justify-between rounded-xl border border-[#E6D7C5] bg-[#FFF3E6] px-4 py-2.5 text-xs font-semibold text-[#381932] hover:border-[#A78A9F] transition-colors"
              >
                VIEW SERVICE PINCODES →
                <ChevronDown size={14} className={`transition-transform duration-300 ${showPincodes ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showPincodes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 rounded-xl border border-[#E6D7C5] bg-[#FFF3E6] p-3 grid grid-cols-2 gap-1.5 text-[11px] text-[#381932]/80 text-left"
                  >
                    {SERVICE_PINCODES.map((pin) => (
                      <span key={pin} className="truncate">• {pin}</span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] py-3 text-xs font-serif font-semibold tracking-wide transition-colors"
              >
                <MapPin size={15} />
                VIEW ON GOOGLE MAPS →
              </a>
            </motion.div>

            {/* Card 3 — Email */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="group flex flex-col rounded-[22px] border border-[#E6D7C5] bg-[#FFF3E6] p-6 sm:p-7 text-center shadow-[0_18px_40px_-28px_rgba(56,25,50,0.3)] hover:-translate-y-1 hover:shadow-[0_26px_52px_-26px_rgba(56,25,50,0.35)] transition-all duration-300"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A78A9F] text-[#FFF3E6] shadow-[0_10px_22px_-8px_rgba(167,138,159,0.9)] group-hover:bg-[#8C6E84] transition-colors">
                <Mail size={22} />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold uppercase tracking-tight text-[#381932]">
                Email &amp; Enquiries
              </h3>
              <HeartDivider className="my-3" />
              <p className="text-xs leading-relaxed text-[#381932]/75">
                For corporate bookings, vendor partnerships, or detailed mood boards, email our design team.
              </p>
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#E6D7C5] bg-[#FFF3E6] px-3.5 py-2.5">
                <span className="truncate text-xs font-semibold text-[#381932]">{SUPPORT_EMAIL}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Copy email"
                  className="rounded-lg bg-[#381932] p-1.5 text-[#FFF3E6] hover:bg-[#483250] transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#381932] text-[#381932] hover:bg-[#A78A9F]/18 py-3 text-xs font-serif font-semibold tracking-wide transition-colors"
              >
                SEND AN EMAIL →
              </a>
            </motion.div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. FIND US HERE — MAP                                             */}
        {/* ================================================================= */}
        <section className="w-full max-w-7xl mx-auto py-10 px-5 sm:px-8">
          <div className="text-center mb-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78A9F]">Find Us Here</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#381932] mt-1">
              OUR BENGALURU STUDIO
            </h2>
            <HeartDivider className="mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[24px] border border-[#E6D7C5] overflow-hidden shadow-[0_28px_60px_-34px_rgba(56,25,50,0.32)]">
            {/* Left — Plum panel */}
            <div className="lg:col-span-4 bg-[#381932] text-[#FFF3E6] p-7 sm:p-9 flex flex-col justify-center gap-4">
              <span className="inline-flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A78A9F]">
                <MapPin size={13} /> Our Location
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold leading-snug">
                The Decor Party Studio
              </h3>
              <p className="text-sm text-[#FFF3E6]/80 leading-relaxed">
                {STUDIO_ADDRESS}
              </p>
              <p className="text-xs text-[#FFF3E6]/60 flex items-center gap-2">
                <Clock size={12} className="text-[#A78A9F]" /> Mon – Sun · 10:00 AM – 8:00 PM
              </p>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FFF3E6] text-[#381932] px-5 py-3 text-xs font-serif font-semibold tracking-wide hover:bg-[#E6D7C5] transition-colors"
              >
                VIEW ON GOOGLE MAPS <ArrowRight size={14} />
              </a>
            </div>

            {/* Right — Map embed */}
            <div className="lg:col-span-8 min-h-[300px] sm:min-h-[380px] bg-[#E6D7C5]">
              <iframe
                title="The Decor Party studio location on Google Maps"
                src={MAPS_EMBED}
                className="h-full w-full min-h-[300px] sm:min-h-[380px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. CTA BANNER                                                     */}
        {/* ================================================================= */}
        <section className="w-full max-w-7xl mx-auto py-10 px-5 sm:px-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 rounded-[24px] overflow-hidden border border-[#E6D7C5] bg-[#A78A9F]/12 shadow-[0_28px_60px_-34px_rgba(56,25,50,0.3)]">
            <Sprig className="pointer-events-none absolute bottom-4 right-6 hidden lg:block w-40 h-28 rotate-180 opacity-60" />

            <div className="relative min-h-[240px] lg:min-h-[340px]">
              <img
                src={CTA_IMAGE}
                alt="The Decor Party candlelight celebration setup"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#A78A9F]/20" />
            </div>

            <div className="relative flex flex-col justify-center gap-4 p-8 sm:p-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78A9F]">Ready When You Are</span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold leading-[1.08] tracking-tight text-[#381932]">
                LET&apos;S PLAN YOUR PERFECT CELEBRATION!
              </h2>
              <p className="text-sm leading-relaxed text-[#381932]/80 max-w-md">
                From intimate gatherings to grand celebrations, we&apos;re here to turn your
                vision into unforgettable memories.
              </p>
              <Link
                to="/packages"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] px-6 py-3.5 text-xs font-serif font-semibold tracking-wide shadow-[0_16px_34px_-16px_rgba(56,25,50,0.6)] transition-colors"
              >
                EXPLORE PACKAGES <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
