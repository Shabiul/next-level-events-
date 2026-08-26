import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
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
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SeoHead } from '../../components/layout/SeoHead';

const SUPPORT_PHONE_PRIMARY = '+917022058460';
const SUPPORT_PHONE_SECONDARY = '+918660924212';
const SUPPORT_EMAIL = 'thedecorparty.team@gmail.com';
const WHATSAPP_DEFAULT_MSG =
  "Hi TheDecorParty! I'd like to plan an event. Can you help me with the details?";

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

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '', // Email or WhatsApp
    occasion: 'Milestone Birthday',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.contact.trim()) {
      toast.error('Please provide your name and email/WhatsApp number');
      return;
    }

    setIsSubmitting(true);

    const waMsg = `Hi TheDecorParty! New Enquiry:%0A%0A• *Name:* ${encodeURIComponent(
      formData.name
    )}%0A• *Contact:* ${encodeURIComponent(
      formData.contact
    )}%0A• *Occasion:* ${encodeURIComponent(
      formData.occasion
    )}%0A• *Message:* ${encodeURIComponent(
      formData.message || 'I would like to discuss styling options.'
    )}`;

    const waUrl = `https://wa.me/${SUPPORT_PHONE_PRIMARY.replace(
      '+',
      ''
    )}?text=${waMsg}`;

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        'Enquiry submitted! Opening WhatsApp for instant stylist chat...'
      );
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  return (
    <>
      <SeoHead
        title="Contact Us — TheDecorParty | Modern Bespoke Event Styling"
        description="Connect with Bengaluru's premier event styling team. Fast responses under 15 minutes, direct WhatsApp hotlines, and instant quotes."
      />

      <div className="w-full min-h-screen bg-[#F9F6F2] text-[#2F2930] font-sans antialiased selection:bg-[#725D75]/20 pb-16">

        {/* ========================================================================= */}
        {/* SECTION 1 — HERO SPLIT FORM & EDITORIAL STATEMENT                        */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="w-full max-w-7xl mx-auto pt-10 sm:pt-14 pb-12 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* LEFT COLUMN (lg:col-span-6 — Editorial Statement & Primary Contact) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 rounded-xl bg-white border border-[#E4DCD2] relative overflow-hidden text-left"
            >
              {/* Subtle Background Glow */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-[#C9BEAB]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-start text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE7] border border-[#E4DCD2] text-[#725D75] font-medium text-xs tracking-wide mb-6">
                  <Sparkles size={13} className="text-[#A78A9F]" />
                  <span>Contact Us</span>
                </div>

                {/* Serif Headline */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.05] text-[#725D75] mb-6 tracking-tight">
                  Let’s start the <br className="hidden sm:inline" />
                  <span className="font-serif italic text-[#A78A9F]">conversation.</span>
                </h1>

                {/* Sub-copy */}
                <p className="text-base sm:text-lg text-[#746B72] font-normal leading-relaxed max-w-lg mb-8">
                  Whether you are planning a milestone birthday, a romantic proposal, or a bespoke celebration, our master stylists are ready to craft your dream setup.
                </p>

                {/* Micro guarantees */}
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#725D75] mb-8">
                  <span className="flex items-center gap-1.5 bg-[#F3EFE7] px-3.5 py-1.5 rounded-full border border-[#E4DCD2]">
                    <ShieldCheck size={14} className="text-[#A78A9F]" />
                    <span>Zero Hidden Fees</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#F3EFE7] px-3.5 py-1.5 rounded-full border border-[#E4DCD2]">
                    <CheckCircle2 size={14} className="text-[#A78A9F]" />
                    <span>100% Picture Match</span>
                  </span>
                </div>
              </div>

              {/* Lead Stylist Contact Chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-10 bg-[#F9F6F2] border border-[#E4DCD2] rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#725D75] flex items-center justify-center font-serif text-lg font-semibold text-white">
                    PB
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] ring-2 ring-white" />
                </div>

                <div className="flex flex-col text-left">
                  <span className="font-serif text-base font-semibold text-[#2F2930]">
                    Prashanth B S &amp; Styling Team
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#746B72] font-medium mt-0.5">
                    <Clock size={12} className="text-[#25D366]" />
                    <span>Average response: &lt; 15 mins</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN (lg:col-span-6 — Floating Contact Form) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 bg-white border border-[#E4DCD2] rounded-xl p-6 sm:p-10 shadow-sm flex flex-col justify-between relative overflow-hidden"
            >
              <div className="relative z-10 text-left mb-6">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#725D75] tracking-tight mb-2">
                  Send Us a Message
                </h2>
                <p className="text-xs sm:text-sm text-[#746B72] font-normal">
                  Fill in your details below and our creative team will connect with you right away.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5 text-left">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium tracking-wide text-[#746B72]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg bg-white border border-[#E4DCD2] px-4 py-3.5 text-sm text-[#2F2930] placeholder:text-[#746B72]/60 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-colors"
                  />
                </div>

                {/* Email / WhatsApp Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium tracking-wide text-[#746B72]">
                    Email / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210 or name@gmail.com"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full rounded-lg bg-white border border-[#E4DCD2] px-4 py-3.5 text-sm text-[#2F2930] placeholder:text-[#746B72]/60 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-colors"
                  />
                </div>

                {/* Occasion Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium tracking-wide text-[#746B72]">
                    Occasion Type
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full rounded-lg bg-white border border-[#E4DCD2] px-4 py-3.5 text-sm text-[#2F2930] focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-colors cursor-pointer"
                  >
                    {OCCASION_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-white text-[#2F2930]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium tracking-wide text-[#746B72]">
                    Your Message / Special Requests
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your event date, preferred colors, theme ideas, or venue details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg bg-white border border-[#E4DCD2] px-4 py-3.5 text-sm text-[#2F2930] placeholder:text-[#746B72]/60 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full flex items-center justify-center gap-3 rounded-lg bg-[#725D75] hover:bg-[#A78A9F] text-white py-3.5 text-sm font-medium tracking-wide shadow-sm transition-colors cursor-pointer disabled:opacity-70"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message →'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — DIRECT CONTACT & LOCATION HUB (3-Card Grid)                   */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="w-full max-w-7xl mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Direct Stylist Hotline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-[#E4DCD2] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE7] flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-white transition-colors">
                    <Phone size={22} />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#1EBE5D] text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    Online for instant quotes
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#725D75] mb-2">
                  Direct Stylist Hotline
                </h3>

                <p className="text-xs text-[#746B72] leading-relaxed mb-4">
                  Call or WhatsApp our team directly for instant pricing, custom themes, and same-day availability.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <a
                    href={`tel:${SUPPORT_PHONE_PRIMARY}`}
                    className="text-sm font-semibold text-[#2F2930] hover:text-[#725D75] transition-colors flex items-center gap-2"
                  >
                    <span>+91 70220 58460</span>
                    <span className="text-[10px] text-[#746B72] font-normal uppercase">(Primary)</span>
                  </a>
                  <a
                    href={`tel:${SUPPORT_PHONE_SECONDARY}`}
                    className="text-sm font-semibold text-[#2F2930] hover:text-[#725D75] transition-colors flex items-center gap-2"
                  >
                    <span>+91 86609 24212</span>
                    <span className="text-[10px] text-[#746B72] font-normal uppercase">(Operations)</span>
                  </a>
                </div>
              </div>

              <a
                href={`https://wa.me/${SUPPORT_PHONE_PRIMARY.replace('+', '')}?text=${encodeURIComponent(
                  WHATSAPP_DEFAULT_MSG
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-colors"
              >
                <MessageSquare size={16} />
                <span>Chat on WhatsApp →</span>
              </a>
            </motion.div>

            {/* Card 2: Studio Location & Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border border-[#E4DCD2] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE7] flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-white transition-colors">
                    <MapPin size={22} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F3EFE7] border border-[#E4DCD2] text-[#725D75] text-[11px] font-semibold">
                    HQ: Bengaluru
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#725D75] mb-2">
                  Studio Location &amp; Coverage
                </h3>

                <p className="text-xs text-[#746B72] leading-relaxed mb-4">
                  Serving Indiranagar, Koramangala, Whitefield, HSR Layout, Jayanagar, and all neighborhoods across Bengaluru.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowPincodes(!showPincodes)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F9F6F2] border border-[#E4DCD2] text-xs font-medium text-[#2F2930] hover:border-[#A78A9F] transition-colors cursor-pointer mb-2"
                >
                  <span>View Service Pincodes</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      showPincodes ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showPincodes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#F9F6F2] rounded-lg p-3 border border-[#E4DCD2] text-[11px] text-[#2F2930] grid grid-cols-2 gap-1.5"
                    >
                      {SERVICE_PINCODES.map((pin) => (
                        <span key={pin} className="text-left truncate">
                          • {pin}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Card 3: Email & Enquiries */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-[#E4DCD2] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE7] flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-white transition-colors">
                    <Mail size={22} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F3EFE7] border border-[#E4DCD2] text-[#725D75] text-[11px] font-semibold">
                    Official Inquiries
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#725D75] mb-2">
                  Email &amp; Enquiries
                </h3>

                <p className="text-xs text-[#746B72] leading-relaxed mb-4">
                  For corporate bookings, vendor partnerships, or detailed mood boards, email our design leads directly.
                </p>

                <div className="p-3.5 rounded-lg bg-[#F9F6F2] border border-[#E4DCD2] flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#2F2930] truncate">
                    {SUPPORT_EMAIL}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg bg-[#725D75] hover:bg-[#A78A9F] text-white transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-transparent hover:bg-[#725D75]/08 border border-[#A78A9F] text-[#725D75] py-3 text-xs sm:text-sm font-medium tracking-wide transition-colors"
              >
                <span>Send an Email →</span>
              </a>
            </motion.div>

          </div>
        </section>

      </div>
    </>
  );
};

export default ContactPage;
