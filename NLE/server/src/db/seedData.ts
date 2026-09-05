import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
import Slider from "../../models/Slider.js";
import SiteContent from "../../models/SiteContent.js";
import GlobalCatalog from "../../models/GlobalCatalog.js";

export async function seedDatabaseIfEmpty() {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log(`ℹ️ Database already contains ${categoryCount} categories. Skipping seed.`);
      return;
    }

    console.log("🌱 Seeding initial local database with categories, products, sliders, and site content...");

    const categoriesData = [
      {
        name: "Birthday Celebrations",
        slug: "birthday-celebrations",
        icon: "🎉",
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
        active: true,
        order: 1,
        subcategories: [{ name: "Kids Birthday" }, { name: "Adults Birthday" }, { name: "Milestone Birthday" }],
      },
      {
        name: "Romantic & Anniversary",
        slug: "romantic-anniversary",
        icon: "❤️",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
        active: true,
        order: 2,
        subcategories: [{ name: "Cabana Decor" }, { name: "Candlelight Dinner" }, { name: "Proposal Decor" }],
      },
      {
        name: "Baby Shower & Welcome",
        slug: "baby-shower-welcome",
        icon: "👶",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
        active: true,
        order: 3,
        subcategories: [{ name: "Baby Shower" }, { name: "Naming Ceremony" }, { name: "Welcome Baby" }],
      },
      {
        name: "Balloon & Canopy Themes",
        slug: "balloon-canopy-themes",
        icon: "🎈",
        image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80",
        active: true,
        order: 4,
        subcategories: [{ name: "Pastel Balloon Arch" }, { name: "Sequin Backdrop" }, { name: "Boho Canopy" }],
      },
      {
        name: "Car Boot Surprises",
        slug: "car-boot-surprises",
        icon: "🚗",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
        active: true,
        order: 5,
        subcategories: [{ name: "Trunk Surprise" }, { name: "Hatchback Decor" }],
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = new Map(createdCategories.map((c) => [c.name, c._id]));

    const productsData = [
      {
        name: "Grand Golden Birthday Arch Decor",
        categoryId: catMap.get("Birthday Celebrations"),
        categoryName: "Birthday Celebrations",
        subcategory: "Kids Birthday",
        price: 3499,
        originalPrice: 4999,
        description: "Spectacular metallic gold and black organic balloon arch with fairy lights and Happy Birthday neon sign.",
        inclusions: [
          "200 Metallic & Chrome Balloons",
          "Neon Happy Birthday Light Sign",
          "Fairy Light Backdrop (8x8 ft)",
          "1 Star Foil Balloon & 2 Heart Foils",
          "Professional Onsite Setup by Decorator",
        ],
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
        badge: "Bestseller",
        badgeColor: "gold",
        rating: 4.9,
        reviewCount: 142,
        active: true,
        featured: true,
        orderCount: 220,
      },
      {
        name: "Romantic Fairy-Tale Canopy Setup",
        categoryId: catMap.get("Romantic & Anniversary"),
        categoryName: "Romantic & Anniversary",
        subcategory: "Cabana Decor",
        price: 4999,
        originalPrice: 6999,
        description: "Intimate white draped cabana canopy adorned with warm fairy lights, rose petals path, and romantic cushions.",
        inclusions: [
          "White Chiffon Fabric Cabana Draping",
          "Warm LED Fairy String Lights (100 ft)",
          "Fresh Red Rose Petals Pathway & Candles",
          "Love Foil Letter Balloons",
          "Plush Floor Mattresses & Cushions",
        ],
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
        badge: "Trending",
        badgeColor: "pink",
        rating: 5.0,
        reviewCount: 98,
        active: true,
        featured: true,
        orderCount: 185,
      },
      {
        name: "Pastel Dream Baby Shower Garland",
        categoryId: catMap.get("Baby Shower & Welcome"),
        categoryName: "Baby Shower & Welcome",
        subcategory: "Baby Shower",
        price: 3999,
        originalPrice: 5499,
        description: "Charming pastel blue, pink, and white balloon garland with plush teddy props and 'Baby' marquee letters.",
        inclusions: [
          "150 Pastel Shade Matte Balloons",
          "Baby Shower Acrylic Ring Backdrop",
          "Baby Foils & Marquee Letters",
          "Artificial Floral Sprays & Greenery",
        ],
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
        badge: "Popular",
        badgeColor: "purple",
        rating: 4.8,
        reviewCount: 76,
        active: true,
        featured: true,
        orderCount: 110,
      },
      {
        name: "Midnight Car Boot Surprise Decor",
        categoryId: catMap.get("Car Boot Surprises"),
        categoryName: "Car Boot Surprises",
        subcategory: "Trunk Surprise",
        price: 2499,
        originalPrice: 3499,
        description: "Surprise car trunk decoration with helium balloons, custom bunting, photos hanging clips, and battery LED lights.",
        inclusions: [
          "60 Theme Chrome & Metallic Balloons",
          "Custom Photo Bunting Banner",
          "LED Fairy Lights & Ribbons",
          "Gift Box Placement Area",
        ],
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
        badge: "Quick Setup",
        badgeColor: "green",
        rating: 4.9,
        reviewCount: 64,
        active: true,
        featured: true,
        orderCount: 95,
      },
      {
        name: "Luxury Sequin Shimmer Wall Backdrop",
        categoryId: catMap.get("Balloon & Canopy Themes"),
        categoryName: "Balloon & Canopy Themes",
        subcategory: "Sequin Backdrop",
        price: 5999,
        originalPrice: 7999,
        description: "Premium gold sequin shimmer wall with organic balloon border, customizable neon sign, and spotlight.",
        inclusions: [
          "8x8 ft Gold Sequin Shimmer Panels",
          "Multi-color Organic Balloon Garland",
          "Custom Neon Sign (e.g. Better Together / Let's Party)",
          "Warm Halogen Spotlights",
        ],
        image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80",
        badge: "VIP Luxe",
        badgeColor: "gold",
        rating: 4.9,
        reviewCount: 88,
        active: true,
        featured: true,
        orderCount: 140,
      },
    ];

    await Product.insertMany(productsData);

    const slidersData = [
      {
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&auto=format&fit=crop&q=80",
        chip: "Bangalore's #1 Event Decorator",
        headline: "Unforgettable Birthday & Celebration Decors",
        subtext: "Book professional decoration packages with same-day doorstep setup across Bengaluru.",
        ctaText: "Explore Packages",
        ctaLink: "/products",
        order: 1,
        active: true,
      },
      {
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&auto=format&fit=crop&q=80",
        chip: "Romantic Surprises",
        headline: "Magical Cabanas & Candlelight Setups",
        subtext: "Create unforgettable memories with our curated candlelight and canopy experiences.",
        ctaText: "Book Cabana",
        ctaLink: "/products?category=romantic-anniversary",
        order: 2,
        active: true,
      },
    ];

    await Slider.insertMany(slidersData);

    const siteContentData = [
      {
        key: "about",
        title: "About The Decor Party",
        content: "The Decor Party is Bangalore's premier surprise planning and celebration decoration service. We bring dream parties to life with bespoke balloon setups, cabanas, romantic decors, and same-day delivery.",
      },
      {
        key: "contact",
        title: "Contact & Location",
        content: "We are headquartered in Bangalore, Karnataka. Customer Support: 9:00 AM to 9:00 PM. Email: support@thedecorparty.com. WhatsApp: +91-9876543210.",
      },
    ];

    await SiteContent.insertMany(siteContentData);

    const catalogExists = await GlobalCatalog.findOne({});
    if (!catalogExists) {
      await GlobalCatalog.create({
        addons: [
          {
            name: "LED Number Lights (Age)",
            description: "Warm LED marquee numbers to highlight age or anniversary years",
            price: 499,
            image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
            category: "Lighting",
            active: true,
          },
          {
            name: "Customized Photo Polaroid Banner",
            description: "15 printed polaroid photos with fairy clips",
            price: 399,
            image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80",
            category: "Personalized",
            active: true,
          },
          {
            name: "Heart-Shaped Chocolate Cake (0.5kg)",
            description: "Freshly baked premium eggless chocolate fudge cake",
            price: 599,
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
            category: "Cakes",
            active: true,
          },
        ],
        activities: [
          {
            name: "Live Guitarist Performance (30 mins)",
            description: "Live acoustic romantic or birthday song performance at doorstep",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
            category: "Music & Artists",
            active: true,
          },
        ],
      });
    }

    console.log("✅ Local database successfully seeded with initial mock data!");
  } catch (error) {
    console.error("⚠️ Error while seeding database:", error);
  }
}
