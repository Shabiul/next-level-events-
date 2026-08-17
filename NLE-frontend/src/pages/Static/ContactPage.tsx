import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Send,
  HeartHandshake,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SeoHead } from '../../components/layout/SeoHead';

const SUPPORT_PHONE_PRIMARY = '+917022058460';
const SUPPORT_PHONE_SECONDARY = '+919743200712';
const SUPPORT_EMAIL = 'thedecorparty.team@gmail.com';
const WHATSAPP_DEFAULT_MSG = "Hi TheDecorParty! I'd like to plan an event. Can you help me with the details?";

const EVENT_TYPES = [
  'Birthday Milestone',
  'Romantic Cabana / Proposal',
  'Baby Shower / Cradle',
  'Welcome Baby',
  'Anniversary Celebration',
  'Kids Theme Party',
  'Terrace / Rooftop Setup',
  'Custom Experience',
];

const BENGALURU_HUBS = [
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Jayanagar',
  'JP Nagar',
  'Sarjapur Road',
  'Hebbal & Yelahanka',
  'Electronic City',
  'All Bengaluru & Suburbs',
];

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: 'Birthday Milestone',
    date: '',
    location: '',
    idea: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please provide your name and phone/WhatsApp number');
      return;
    }

    setIsSubmitting(true);

    const message = `Hi TheDecorParty! I'd like to plan an event:%0A%0A• *Name:* ${encodeURIComponent(
      formData.name
    )}%0A• *Phone:* ${encodeURIComponent(formData.phone)}%0A• *Event Type:* ${encodeURIComponent(
      formData.eventType
    )}%0A• *Date:* ${encodeURIComponent(formData.date || 'To be decided')}%0A• *Location:* ${encodeURIComponent(
      formData.location || 'Bengaluru'
    )}%0A• *My Idea/Request:* ${encodeURIComponent(formData.idea || 'Need guidance from your stylist')}`;

    const waUrl = `https://wa.me/${SUPPORT_PHONE_PRIMARY.replace('+', '')}?text=${message}`;

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Enquiry received! Connecting you to our lead stylist on WhatsApp...');
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <SeoHead
        title="Contact Us — TheDecorParty | Plan Your Celebration"
        description="Have a celebration coming up in Bengaluru? Tell us what you're imagining. Reach out via WhatsApp, phone, or direct enquiry."
      />

      <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] font-sans antialiased transition-colors overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 01 — HERO                                                                 */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1440px] mx-auto text-center"
        >
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/3 w-80 h-80 rounded-full bg-[#A78A9F]/12 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-32 right-1/4 w-80 h-80 rounded-full bg-[#C9BEAB]/15 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34203C]/06 dark:bg-white/10 border border-[#34203C]/10 dark:border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#C9BEAB] mb-4 sm:mb-6"
            >
              <Sparkles size={13} className="text-[#A78A9F]" />
              <span>CONTACT THEDECORPARTY</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.12] mb-5 uppercase"
            >
              Let's plan something{' '}
              <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB] lowercase">
                beautiful.
              </span>
            </motion.h1>

            {/* Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3] max-w-xl mb-8"
            >
              Have a celebration coming up?
              <br />
              Tell us what you're imagining. We'll take it from there.
            </motion.p>

            {/* CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={scrollToEnquiry}
              className="inline-flex items-center gap-2 rounded-full bg-[#34203C] hover:bg-[#483250] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#34203C] dark:hover:bg-[#C9BEAB] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <span>START PLANNING</span>
              <ArrowRight size={15} />
            </motion.button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 02 & 03 — ENQUIRY FORM & DIRECT CONTACT (Side by Side Grid)              */}
        {/* ========================================================================= */}
        <section
          id="enquiry-form"
          data-nav-theme="light"
          className="relative w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1440px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* 02 — ENQUIRY FORM (Span 7) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 rounded-[32px] sm:rounded-[36px] border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] p-6 sm:p-8 md:p-10 shadow-xl"
            >
              {/* Eyebrow & Headline */}
              <div className="mb-6 sm:mb-8 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#725D75] dark:text-[#A78A9F] mb-2">
                  <span className="w-5 h-[1.5px] bg-[#A78A9F]" />
                  <span>TELL US A LITTLE ABOUT IT</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#34203C] dark:text-[#FAF8F5] tracking-tight">
                  A few details are all we need to get started.
                </h2>
              </div>

              {/* Minimal Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 text-left">
                {/* 1. Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] placeholder:text-[#725D75]/50 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] placeholder:text-[#725D75]/50 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all"
                    />
                  </div>
                </div>

                {/* 2. Event Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                    Event Type
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all cursor-pointer"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-white dark:bg-[#201325] text-[#34203C] dark:text-[#FAF8F5]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                      Area / Location (Bengaluru)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar, Home terrace"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] placeholder:text-[#725D75]/50 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all"
                    />
                  </div>
                </div>

                {/* 4. Tell us your idea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                    Tell us your idea / Special requests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the surprise, preferred color palette, theme inspirations, or budget range..."
                    value={formData.idea}
                    onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                    className="w-full rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-4 py-3 text-sm text-[#34203C] dark:text-[#FAF8F5] placeholder:text-[#725D75]/50 focus:border-[#A78A9F] focus:outline-none focus:ring-1 focus:ring-[#A78A9F] transition-all resize-none"
                  />
                </div>

                {/* CTA Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#34203C] hover:bg-[#483250] dark:bg-[#C9BEAB] dark:hover:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#25172C] py-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'SENDING ENQUIRY...' : 'SEND ENQUIRY →'}</span>
                </button>
              </form>
            </motion.div>

            {/* 03 — DIRECT CONTACT (Span 5) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5 flex flex-col gap-6 text-left"
            >
              {/* Direct Contact Card */}
              <div className="rounded-[32px] sm:rounded-[36px] border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] p-6 sm:p-8 shadow-xl flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#725D75] dark:text-[#A78A9F] mb-2">
                    <span className="w-5 h-[1.5px] bg-[#A78A9F]" />
                    <span>WANT TO TALK NOW?</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#34203C] dark:text-[#FAF8F5] tracking-tight">
                    Sometimes, a conversation is easier.
                  </h2>
                </div>

                {/* Phone Numbers */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                    Direct Call / Support:
                  </span>
                  <a
                    href={`tel:${SUPPORT_PHONE_PRIMARY}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] hover:border-[#A78A9F] hover:shadow-md transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34203C]/08 dark:bg-white/10 text-[#34203C] dark:text-[#C9BEAB] group-hover:bg-[#A78A9F] group-hover:text-white transition-colors">
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-serif text-sm sm:text-base font-bold text-[#34203C] dark:text-[#FAF8F5]">
                        +91 70220 58460
                      </span>
                      <span className="text-[11px] text-[#725D75] dark:text-[#C8B5C3] mt-1 font-light">
                        Primary Styling Desk
                      </span>
                    </div>
                  </a>

                  <a
                    href={`tel:${SUPPORT_PHONE_SECONDARY}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] hover:border-[#A78A9F] hover:shadow-md transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34203C]/08 dark:bg-white/10 text-[#34203C] dark:text-[#C9BEAB] group-hover:bg-[#A78A9F] group-hover:text-white transition-colors">
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-serif text-sm sm:text-base font-bold text-[#34203C] dark:text-[#FAF8F5]">
                        +91 97432 00712
                      </span>
                      <span className="text-[11px] text-[#725D75] dark:text-[#C8B5C3] mt-1 font-light">
                        Operations &amp; Express Setup
                      </span>
                    </div>
                  </a>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                    Email Inquiries:
                  </span>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] hover:border-[#A78A9F] hover:shadow-md transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34203C]/08 dark:bg-white/10 text-[#34203C] dark:text-[#C9BEAB] group-hover:bg-[#A78A9F] group-hover:text-white transition-colors">
                      <Mail size={16} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-serif text-xs sm:text-sm font-semibold text-[#34203C] dark:text-[#FAF8F5]">
                        {SUPPORT_EMAIL}
                      </span>
                      <span className="text-[11px] text-[#725D75] dark:text-[#C8B5C3] mt-1 font-light">
                        Replies within 2 hours
                      </span>
                    </div>
                  </a>
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={`https://wa.me/${SUPPORT_PHONE_PRIMARY.replace('+', '')}?text=${encodeURIComponent(
                    WHATSAPP_DEFAULT_MSG
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:scale-102 active:scale-95 transition-all"
                >
                  <MessageSquare size={16} />
                  <span>WHATSAPP US →</span>
                </a>
              </div>

              {/* 04 — LOCATION CARD */}
              <div className="rounded-[32px] sm:rounded-[36px] border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] p-6 sm:p-8 shadow-xl flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#725D75] dark:text-[#A78A9F] mb-1.5">
                    <MapPin size={14} className="text-[#A78A9F]" />
                    <span>BASED IN BENGALURU</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#34203C] dark:text-[#FAF8F5]">
                    Bengaluru, Karnataka, India
                  </h3>
                  <p className="text-xs sm:text-sm text-[#725D75] dark:text-[#C8B5C3] font-light mt-1 leading-relaxed">
                    Creating beautiful spaces and memorable celebrations across Bengaluru.
                  </p>
                </div>

                {/* Clean Bengaluru Hub Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BENGALURU_HUBS.map((hub) => (
                    <span
                      key={hub}
                      className="rounded-full border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#180E1C] px-3 py-1 text-[11px] font-medium text-[#34203C] dark:text-[#FAF8F5]"
                    >
                      {hub}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 05 — FINAL CTA                                                            */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#FAF8F5] text-center border-t border-white/10"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#A78A9F]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#483250]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#C9BEAB]">
              <HeartHandshake size={13} className="text-[#C9BEAB]" />
              <span>EXPERIENCE THE DIFFERENCE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] text-[#FAF8F5] uppercase">
              YOU BRING THE OCCASION.{' '}
              <span className="font-serif italic text-[#C9BEAB] block sm:inline lowercase">
                We'll create the setting.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base font-light text-[#F6EFF4]/85 max-w-xl leading-relaxed">
              From milestone birthdays to rooftop proposals, our master stylists are ready to bring your dream celebration to life tonight.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A78A9F] to-[#725D75] hover:from-[#C9BEAB] hover:to-[#A78A9F] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] hover:text-[#25172C] shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                <span>PLAN YOUR CELEBRATION</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={scrollToEnquiry}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
              >
                <span>SEND ENQUIRY FORM</span>
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#FAF8F5]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>100% Picture-Match</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>No Hidden Fees</span>
              </span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default ContactPage;
