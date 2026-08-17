import express, { Request, Response } from "express";
import SiteContent from "../models/SiteContent";

const router = express.Router();

const DEFAULTS: Record<string, { title: string; content: string }> = {
  terms: {
    title: "Terms & Conditions",
    content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using TheDecorParty services, you accept and agree to be bound by these Terms and Conditions.</p>
<h2>2. Services</h2>
<p>TheDecorParty provides event decoration and experience services in Bangalore. All bookings are subject to availability and confirmation by our team.</p>
<h2>3. Booking & Payment</h2>
<p>A 50% advance payment is required to confirm your booking. The remaining balance must be paid before the event setup begins. We accept UPI, net banking, and card payments.</p>
<h2>4. Cancellation Policy</h2>
<p>Cancellations made 72+ hours before the event will receive a full refund. Cancellations within 48 hours will forfeit the advance payment. Same-day cancellations are non-refundable.</p>
<h2>5. Liability</h2>
<p>TheDecorParty is not liable for delays caused by circumstances beyond our control including weather, traffic, or venue restrictions.</p>
<h2>6. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.</p>`,
  },
  privacy: {
    title: "Privacy Policy",
    content: `<h2>1. Information We Collect</h2>
<p>We collect your name, email, phone number, and event details when you book our services or create an account.</p>
<h2>2. How We Use Your Information</h2>
<p>Your information is used to process bookings, send confirmations, and improve our services. We do not sell your data to third parties.</p>
<h2>3. Data Security</h2>
<p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
<h2>4. Cookies</h2>
<p>Our website uses cookies to enhance your browsing experience. You can disable cookies in your browser settings, though this may affect site functionality.</p>
<h2>5. Contact</h2>
<p>For privacy-related queries, contact us at thedecorparty.team@gmail.com or call +91 70220 58460.</p>`,
  },
  refund: {
    title: "Refund Policy",
    content: `<h2>Refund Eligibility</h2>
<p>Refunds are processed based on the cancellation timeline below.</p>
<h2>Cancellation Timeline</h2>
<ul><li><strong>72+ hours before event:</strong> 100% refund of advance payment</li><li><strong>48–72 hours before event:</strong> 50% refund of advance payment</li><li><strong>Less than 48 hours:</strong> No refund on advance payment</li><li><strong>Same day cancellation:</strong> Full amount forfeited</li></ul>
<h2>Refund Process</h2>
<p>Approved refunds are processed within 5–7 business days to the original payment method.</p>
<h2>Non-Refundable Items</h2>
<p>Custom-made items, personalised decorations, and perishable goods (flowers, cakes) are non-refundable once ordered.</p>
<h2>Contact for Refunds</h2>
<p>Email us at thedecorparty.team@gmail.com with your booking ID to initiate a refund request.</p>`,
  },
  "product-terms": {
    title: "Terms & Conditions",
    content: `<ol><li>Booking is confirmed only after advance payment and written confirmation from our team.</li><li>Cancellations made 48+ hours before the event are eligible for a full refund.</li><li>Cancellations within 24–48 hours will incur a 50% cancellation fee.</li><li>No refund for cancellations made less than 24 hours before the event.</li><li>The venue/location must be accessible at least 2 hours before the event start time for setup.</li><li>Any damage to props or decor caused by guests will be charged separately.</li><li>Add-ons must be confirmed at least 24 hours in advance.</li><li>TheDecorParty reserves the right to substitute items of equal or greater value if specific items are unavailable.</li><li>Prices are inclusive of setup and breakdown. GST applicable as per government norms.</li><li>For outdoor events, we are not responsible for weather-related disruptions.</li></ol>`,
  },
  about: {
    title: "About Us",
    content: `<h2>Who We Are</h2><p>TheDecorParty is Bangalore's most trusted event decoration and experience platform. We have been creating magical moments for over 5 years, serving 10,000+ happy customers across the city.</p><h2>Our Mission</h2><p>To make every celebration unforgettable — from intimate birthdays to grand weddings — with creative, personalised, and affordable event experiences.</p><h2>What We Offer</h2><ul><li>Birthday & Anniversary Decorations</li><li>Wedding & Engagement Setups</li><li>Romantic Dinners & Proposals</li><li>Corporate Events & Product Launches</li><li>Baby Showers & Gender Reveals</li></ul><h2>Why Choose Us</h2><p>Same-day setup, 100% customisation, professional team, and on-time delivery — that's the TheDecorParty promise.</p><h2>Contact Us</h2><p>📍 Bangalore, Karnataka<br/>📞 +91 70220 58460<br/>✉️ thedecorparty.team@gmail.com</p>`,
  },
};

router.get("/:key", async (req: Request, res: Response) => {
  try {
    let doc = await SiteContent.findOne({ key: req.params.key });
    if (!doc) {
      const key = req.params.key as keyof typeof DEFAULTS;
      const def = DEFAULTS[key];
      if (!def) return res.status(404).json({ msg: "Not found" });
      const keyValue = String(req.params.key);
      doc = await SiteContent.create({ key: keyValue, ...def });
    }
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ msg: err.message });
  }
});

router.put("/:key", async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const doc = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { title, content, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
