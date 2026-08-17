import { Scroll01 } from "@/components/ui/scroll-01";

const values = {
  items: [
    {
      num: "01",
      title: "Guaranteed 60-Min Early Arrival",
      description: "Our certified master stylists arrive well before your event so your venue is 100% ready and pristine before the first guest walks in.",
      media: "/about-purple-decor.png",
      badge: "Punctuality",
    },
    {
      num: "02",
      title: "100% Real-to-Photo Guarantee",
      description: "What you see is exactly what gets built. No cheap substitutes, fading balloons, or mismatched color palettes.",
      media: "/about-aesthetic.png",
      badge: "Precision",
    },
    {
      num: "03",
      title: "Metallic Chrome & Eco Balloons",
      description: "We strictly use premium biodegradable natural latex and long-lasting metallic chrome balloons that stay buoyant for 48+ hours.",
      media: "/about-purple-banner.png",
      badge: "Eco Luxury",
    },
    {
      num: "04",
      title: "50+ Background-Verified Stylists",
      description: "Polite, trained, and verified event designers who treat your private residence with utmost care and ensure full post-event teardown.",
      media: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=85",
      badge: "Certified Team",
    },
    {
      num: "05",
      title: "Express 3-Hour Same-Day Bookings",
      description: "Last-minute surprise? Our express fleet covers all Bengaluru zones from Indiranagar to Whitefield, HSR, and Electronic City.",
      media: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&auto=format&fit=crop&q=85",
      badge: "Bengaluru Express",
    },
    {
      num: "06",
      title: "Zero Hidden Costs & Upfront Pricing",
      description: "All listed prices include full setup, props rental, styling, and transport. Pay safely online or confirm with concierge on WhatsApp.",
      media: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=85",
      badge: "Transparent",
    },
  ],
};

export default function Scroll01Demo() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Scroll01 items={values.items} />
    </div>
  );
}
export { Scroll01Demo };
