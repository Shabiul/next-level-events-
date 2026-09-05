import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, MapPin } from 'lucide-react';
import { AnimatedNumber } from '@/components/core/animated-number';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  occasion: string;
  date?: string;
  rating: number;
  content: string;
  verified?: boolean;
}

const testimonialsRow1: Testimonial[] = [
  {
    id: 'r1',
    name: 'Ananya & Varun Sharma',
    location: 'Indiranagar 100ft Road, Bengaluru',
    occasion: 'Milestone 30th Birthday',
    date: 'Booked on 12th Aug',
    rating: 5,
    verified: true,
    content:
      'Booked the Midnight Luxe Gold & Black arch with neon signage. The decorators arrived at exactly 10:30 PM, finished in 45 mins, and left the room spotless. 100% true to the catalogue pictures!',
  },
  {
    id: 'r2',
    name: 'Rohan Mehta',
    location: 'Koramangala 4th Block, Bengaluru',
    occasion: 'Rooftop Proposal Setup',
    date: 'Booked on 28th Jul',
    rating: 5,
    verified: true,
    content:
      'The 4ft illuminated Marry Me marquee letters and fairy light canopy on our terrace were breathtaking. My fiancée was in tears of joy. Outstanding coordination over WhatsApp.',
  },
  {
    id: 'r3',
    name: 'Priyanka & Arjun Nambiar',
    location: 'Prestige Shantiniketan, Whitefield',
    occasion: '1st Birthday Grand Theme',
    date: 'Booked on 5th Aug',
    rating: 5,
    verified: true,
    content:
      'We wanted an organic pastel jungle safari theme for our son’s 1st birthday. The balloons stayed firm and glossy for 3 full days! Every single guest asked for The Decor Party’s contact.',
  },
  {
    id: 'r4',
    name: 'Dr. Kavitha S. Rao',
    location: 'Jayanagar 4th Block, Bengaluru',
    occasion: 'Silver Jubilee 25th Anniversary',
    date: 'Booked on 19th Jul',
    rating: 5,
    verified: true,
    content:
      'The sheer draped cabana with warm vintage fairy lights and real rose petal pathways turned our backyard into a 5-star intimate banquet. Professional stylists and zero hidden fees.',
  },
  {
    id: 'r5',
    name: 'Karthik Ramanathan',
    location: 'HSR Layout Sector 2, Bengaluru',
    occasion: 'Express Delivery Room Surprise',
    date: 'Booked on 2nd Aug',
    rating: 5,
    verified: true,
    content:
      'Had an emergency setup requirement for my wife’s birthday. The team confirmed in 10 mins and completed the entire helium ceiling balloon decor before she returned from work. Lifesavers!',
  },
  {
    id: 'r6',
    name: 'Sneha & Aditya Kulkarni',
    location: 'Sarjapur Road, Bengaluru',
    occasion: 'Baby Shower & Naming Decor',
    date: 'Booked on 14th Jul',
    rating: 5,
    verified: true,
    content:
      'The wooden ring backdrop with pampas grass and gold cradle setup looked so elegant for our traditional ceremony. Everything was sanitized, biodegradable, and carefully curated.',
  },
];

const testimonialsRow2: Testimonial[] = [
  {
    id: 'r7',
    name: 'Vikram Sengupta',
    location: 'Hebbal, Bengaluru',
    occasion: 'Terrace Candlelight Dining',
    date: 'Booked on 9th Aug',
    rating: 5,
    verified: true,
    content:
      'Exceeded every expectation. The fairy light tunnel and personalised welcome easel were stunning. Best event styling service in Bengaluru by far.',
  },
  {
    id: 'r8',
    name: 'Meera & Deepesh Joshi',
    location: 'Bellandur EcoSpace, Bengaluru',
    occasion: 'Welcome Baby Homecoming',
    date: 'Booked on 22nd Jul',
    rating: 5,
    verified: true,
    content:
      'Seamless coordination from order to teardown. The pastel clouds and cradle floral ring created the warmest welcome for our newborn baby girl.',
  },
  {
    id: 'r9',
    name: 'Siddharth Varma',
    location: 'Electronic City Phase 1, Bengaluru',
    occasion: 'Corporate Product Launch Decor',
    date: 'Booked on 17th Aug',
    rating: 5,
    verified: true,
    content:
      'Clean metallic balloon arch with custom branding props for our tech launch. Punctual, polite, and completely hassle-free execution.',
  },
  {
    id: 'r10',
    name: 'Aishwarya Rajesh',
    location: 'Malleshwaram 8th Cross, Bengaluru',
    occasion: 'Haldi & Floral Photobooth',
    date: 'Booked on 4th Aug',
    rating: 5,
    verified: true,
    content:
      'Fresh marigold garlands and brass urli bowl arrangements looked authentic and grand. The pictures came out breathtaking under natural daylight.',
  },
  {
    id: 'r11',
    name: 'Naveen & Shalini Hegde',
    location: 'Yelahanka New Town, Bengaluru',
    occasion: 'Silver Jubilee Celebration',
    date: 'Booked on 29th Jul',
    rating: 5,
    verified: true,
    content:
      'The LED numbers, customised photo timeline string, and champagne balloon ring made our parents’ anniversary celebration truly unforgettable.',
  },
  {
    id: 'r12',
    name: 'Tanvi Deshmukh',
    location: 'JP Nagar 6th Phase, Bengaluru',
    occasion: 'Surprise Bedroom Canopy',
    date: 'Booked on 11th Aug',
    rating: 5,
    verified: true,
    content:
      'Zero wall damage and extremely clean work! The fairy lights and soft drapery transformed our room in under 40 minutes. Highly recommended!',
  },
];

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="flex h-[250px] w-[380px] flex-shrink-0 flex-col justify-between rounded-xl border border-[#381932]/30 bg-[#FFF3E6] p-6 shadow-sm select-none transition-shadow hover:shadow-md"
    >
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 pb-3">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-[#381932] text-[#381932]" />
          ))}
          <span className="ml-1 text-[11px] font-semibold text-[#381932]">{testimonial.rating.toFixed(1)}</span>
        </div>

        {/* Real Review Content */}
        <p className="line-clamp-4 text-sm leading-relaxed font-normal text-[#381932]">
          {testimonial.content}
        </p>
      </div>

      {/* Verified Customer Details Footer */}
      <div className="flex items-center gap-3 pt-3.5 border-t border-[#381932]/30">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold tracking-tight text-[#381932]">
              {testimonial.name}
            </span>
            {testimonial.verified && (
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#381932]" />
            )}
          </div>
          <div className="flex items-center gap-1 truncate text-[11px] font-medium text-[#381932]">
            <MapPin className="h-3 w-3 flex-shrink-0 text-[#381932]" />
            <span className="truncate">{testimonial.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface MarqueeRowProps {
  testimonials: Testimonial[];
  direction?: 'left' | 'right';
  duration?: number;
}

function MarqueeRow({ testimonials, direction = 'left', duration = 38 }: MarqueeRowProps) {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedList = [...testimonials, ...testimonials, ...testimonials];
  const animateX = direction === 'left' ? ['0%', '-33.333%'] : ['-33.333%', '0%'];

  return (
    <div
      className="relative flex w-full overflow-hidden py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex gap-6 flex-nowrap"
        animate={{
          x: animateX,
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: duration,
            ease: 'linear',
          },
        }}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedList.map((item, idx) => (
          <TestimonialCard key={`${item.id}-${idx}`} testimonial={item} />
        ))}
      </motion.div>
    </div>
  );
}

export interface InfiniteTestimonialsProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export default function InfiniteTestimonials({
  title,
  subtitle = 'Real celebrations. Real people. Real moments.',
  badgeText,
  className = '',
}: InfiniteTestimonialsProps) {
  return (
    <section className={`relative w-full overflow-hidden bg-[#FFF3E6] dark:bg-[#381932] py-4 sm:py-5 lg:py-6 transition-colors duration-300 ${className}`}>
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-6 text-center mb-8 sm:mb-10">
        {badgeText && (
          <span className="inline-block rounded-full border border-[#381932]/30 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-1 text-[11px] font-semibold tracking-wide text-[#381932] dark:text-[#381932] mb-3">
            {badgeText}
          </span>
        )}
        <h2 className="text-3xl font-serif font-semibold tracking-tight text-[#381932] dark:text-[#FFF3E6] sm:text-4xl md:text-5xl mb-3">
          {title ? (
            title
          ) : (
            <>
              Loved by{' '}
              <AnimatedNumber
                className="inline-flex font-serif text-[#381932] dark:text-[#381932]"
                value={5200}
                decimalPlaces={0}
                springOptions={{ bounce: 0, duration: 2000 }}
              />
              <span className="text-[#381932]">+</span> Bengaluru Hosts
            </>
          )}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#381932] dark:text-[#FFF3E6] sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* Marquee Wrapper with Smooth Linear Edge Fades */}
      <div className="relative w-full overflow-hidden space-y-6">
        {/* Left Edge Fade */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 sm:w-40 md:w-56"
          style={{
            background: 'linear-gradient(to right, #FFF3E6 0%, rgba(56,25,50,0) 100%)',
          }}
        />

        {/* Right Edge Fade */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 sm:w-40 md:w-56"
          style={{
            background: 'linear-gradient(to left, #FFF3E6 0%, rgba(56,25,50,0) 100%)',
          }}
        />

        {/* Row 1: Smoothly Moves Right to Left */}
        <MarqueeRow testimonials={testimonialsRow1} direction="left" duration={38} />

        {/* Row 2: Smoothly Moves Left to Right */}
        <MarqueeRow testimonials={testimonialsRow2} direction="right" duration={42} />
      </div>
    </section>
  );
}
