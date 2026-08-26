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

      <div className="w-full min-h-screen bg-[#725D75] text-[#A78A9F] font-sans antialiased selection:bg-[#725D75]/30 pb-16">
        
        {/* ========================================================================= */}
        {/* SECTION 1 — HERO SPLIT FORM & EDITORIAL STATEMENT                        */}
        {/* ========================================================================= */}
        <section data-nav-theme="dark" className="w-full max-w-7xl mx-auto pt-10 sm:pt-14 pb-12 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN (lg:col-span-6 — Editorial Statement & Primary Contact) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 rounded-[28px] bg-[#483250]/40 border border-[#725D75]/20 backdrop-blur-md relative overflow-hidden text-left"
            >
              {/* Subtle Background Glow */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-[#725D75]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-start text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#483250] border border-[#725D75]/40 text-[#725D75] font-bold text-xs uppercase tracking-[0.25em] shadow-md mb-6">
                  <Sparkles size={13} className="text-[#725D75]" />
                  <span>CONTACT US</span>
                </div>

                {/* Serif Headline */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[1.12] text-[#A78A9F] mb-6 tracking-tight">
                  Let’s start the <br className="hidden sm:inline" />
                  <span className="font-serif italic text-white">conversation.</span>
                </h1>

                {/* Sub-copy */}
                <p className="text-base sm:text-lg text-[#A78A9F] font-light leading-relaxed max-w-lg mb-8">
                  Whether you are planning a milestone birthday, a romantic proposal, or a bespoke celebration, our master stylists are ready to craft your dream setup.
                </p>

                {/* Micro guarantees */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#725D75] mb-8">
                  <span className="flex items-center gap-1.5 bg-[#725D75]/80 px-3.5 py-1.5 rounded-full border border-[#725D75]/30">
                    <ShieldCheck size={14} className="text-[#A78A9F]" />
                    <span>Zero Hidden Fees</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#725D75]/80 px-3.5 py-1.5 rounded-full border border-[#725D75]/30">
                    <CheckCircle2 size={14} className="text-[#A78A9F]" />
                    <span>100% Picture Match</span>
                  </span>
                </div>
              </div>

              {/* Lead Stylist Floating Glass Contact Chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-10 bg-[#483250]/80 border border-[#725D75]/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl backdrop-blur-md"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#725D75] to-[#A78A9F] flex items-center justify-center font-serif text-lg font-bold text-white border border-white/20">
                    PB
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] ring-2 ring-[#725D75]" />
                </div>

                <div className="flex flex-col text-left">
                  <span className="font-serif text-base font-bold text-[#A78A9F]">
                    Prashanth B S &amp; Styling Team
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#725D75] font-medium mt-0.5">
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
              className="lg:col-span-6 bg-[#725D75] border border-[#725D75]/30 rounded-[28px] p-6 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="relative z-10 text-left mb-6">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#A78A9F] tracking-tight mb-2">
                  Send Us a Message
                </h2>
                <p className="text-xs sm:text-sm text-[#746B72] font-light">
                  Fill in your details below and our creative team will connect with you right away.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5 text-left">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A78A9F]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl bg-[#483250] border border-[#A78A9F]/50 px-4 py-3.5 text-sm text-[#A78A9F] placeholder:text-[#746B72] focus:border-[#725D75] focus:outline-none focus:ring-1 focus:ring-[#725D75] transition-all"
                  />
                </div>

                {/* Email / WhatsApp Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A78A9F]">
                    Email / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210 or name@gmail.com"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full rounded-xl bg-[#483250] border border-[#A78A9F]/50 px-4 py-3.5 text-sm text-[#A78A9F] placeholder:text-[#746B72] focus:border-[#725D75] focus:outline-none focus:ring-1 focus:ring-[#725D75] transition-all"
                  />
                </div>

                {/* Occasion Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A78A9F]">
                    Occasion Type
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full rounded-xl bg-[#483250] border border-[#A78A9F]/50 px-4 py-3.5 text-sm text-[#A78A9F] focus:border-[#725D75] focus:outline-none focus:ring-1 focus:ring-[#725D75] transition-all cursor-pointer"
                  >
                    {OCCASION_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-[#483250] text-[#A78A9F]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A78A9F]">
                    Your Message / Special Requests
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your event date, preferred colors, theme ideas, or venue details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl bg-[#483250] border border-[#A78A9F]/50 px-4 py-3.5 text-sm text-[#A78A9F] placeholder:text-[#746B72] focus:border-[#725D75] focus:outline-none focus:ring-1 focus:ring-[#725D75] transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full flex items-center justify-center gap-3 rounded-full bg-[#725D75] hover:bg-[#C9BEAB] text-[#2F2930] py-4 text-sm font-extrabold uppercase tracking-wider shadow-lg hover:shadow-[#725D75]/20 transition-all cursor-pointer disabled:opacity-70"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'SENDING...' : 'SEND MESSAGE →'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — DIRECT CONTACT & LOCATION HUB (3-Card Grid)                   */}
        {/* ========================================================================= */}
        <section data-nav-theme="dark" className="w-full max-w-7xl mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Direct Stylist Hotline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#725D75] border border-[#725D75]/20 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#483250] border border-[#725D75]/30 flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-[#2F2930] transition-colors">
                    <Phone size={22} />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    Online for instant quotes
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#A78A9F] mb-2">
                  Direct Stylist Hotline
                </h3>

                <p className="text-xs text-[#746B72] leading-relaxed mb-4">
                  Call or WhatsApp our team directly for instant pricing, custom themes, and same-day availability.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <a
                    href={`tel:${SUPPORT_PHONE_PRIMARY}`}
                    className="text-sm font-bold text-[#A78A9F] hover:text-[#725D75] transition-colors flex items-center gap-2"
                  >
                    <span>+91 70220 58460</span>
                    <span className="text-[10px] text-[#746B72] font-normal uppercase">(Primary)</span>
                  </a>
                  <a
                    href={`tel:${SUPPORT_PHONE_SECONDARY}`}
                    className="text-sm font-bold text-[#A78A9F] hover:text-[#725D75] transition-colors flex items-center gap-2"
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
                className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-all"
              >
                <MessageSquare size={16} />
                <span>CHAT ON WHATSAPP →</span>
              </a>
            </motion.div>

            {/* Card 2: Studio Location & Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#725D75] border border-[#725D75]/20 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#483250] border border-[#725D75]/30 flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-[#2F2930] transition-colors">
                    <MapPin size={22} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#483250] border border-[#725D75]/30 text-[#A78A9F] text-[11px] font-bold">
                    HQ: Bengaluru
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#A78A9F] mb-2">
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
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#483250] border border-[#725D75]/30 text-xs font-bold text-[#A78A9F] hover:text-white transition-colors cursor-pointer mb-2"
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
                      className="overflow-hidden bg-[#483250]/70 rounded-xl p-3 border border-[#725D75]/20 text-[11px] text-[#A78A9F] grid grid-cols-2 gap-1.5"
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
              className="bg-[#725D75] border border-[#725D75]/20 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#483250] border border-[#725D75]/30 flex items-center justify-center text-[#725D75] group-hover:bg-[#725D75] group-hover:text-[#2F2930] transition-colors">
                    <Mail size={22} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#483250] border border-[#725D75]/30 text-[#725D75] text-[11px] font-bold">
                    Official Inquiries
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#A78A9F] mb-2">
                  Email &amp; Enquiries
                </h3>

                <p className="text-xs text-[#746B72] leading-relaxed mb-4">
                  For corporate bookings, vendor partnerships, or detailed mood boards, email our design leads directly.
                </p>

                <div className="p-3.5 rounded-xl bg-[#483250] border border-[#A78A9F]/40 flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#A78A9F] truncate">
                    {SUPPORT_EMAIL}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg bg-[#725D75] hover:bg-[#725D75] text-[#A78A9F] hover:text-[#2F2930] transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={14} className="text-[#25D366]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#483250] hover:bg-[#725D75] border border-[#725D75]/40 text-[#A78A9F] hover:text-[#2F2930] py-3 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>SEND AN EMAIL →</span>
              </a>
            </motion.div>

          </div>
        </section>

      </div>
    </>
  );
};

export default ContactPage;
