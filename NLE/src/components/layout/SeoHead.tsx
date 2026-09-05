import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItemData {
  question: string;
  answer: string;
}

export interface ProductSchemaData {
  name: string;
  description: string;
  image?: string;
  price: number | string;
  priceCurrency?: string;
  availability?: 'InStock' | 'PreOrder' | 'OutOfStock';
  ratingValue?: number;
  reviewCount?: number;
  sku?: string;
  category?: string;
}

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  siteName?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqData?: FAQItemData[];
  productData?: ProductSchemaData;
  schema?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'The Decor Party | Luxury Surprise & Event Decoration Bangalore';
const DEFAULT_DESCRIPTION = "Bangalore's #1 surprise & event decoration platform. Balloon setups, romantic candlelight dinners, room decors, milestone birthdays & proposal setups across Bengaluru with 3-hour same-day slots.";
const DEFAULT_SITE_NAME = 'The Decor Party';
const BASE_URL = 'https://www.thedecorparty.com';
const DEFAULT_IMAGE = `${BASE_URL}/final_logo.jpg`;

const DEFAULT_KEYWORDS = [
  'balloon decoration bangalore',
  'birthday decoration bengaluru',
  'surprise event planners bangalore',
  'candlelight dinner setup bangalore',
  'proposal decoration bangalore',
  'rooftop cabana setup bengaluru',
  'baby shower decoration bangalore',
  'welcome baby decor bangalore',
  'kids birthday themes bangalore',
  'event decorators indiranagar koramangala whitefield hsr layout',
  'same day balloon decor bangalore',
  'the decor party bangalore',
];

/**
 * Helper to normalize relative or absolute image URLs
 */
const normalizeImageUrl = (img?: string): string => {
  if (!img) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(img)) return img;
  const cleanPath = img.startsWith('/') ? img : `/${img}`;
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Helper to update or create an HTML meta tag in document.head
 */
const setMetaTag = (attribute: 'name' | 'property', attrValue: string, content: string) => {
  let element = document.head.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Helper to update or create a link tag in document.head
 */
const setLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = DEFAULT_SITE_NAME,
  breadcrumbs,
  faqData,
  productData,
  schema,
  noindex = false,
}) => {
  useEffect(() => {
    // 1. Resolve values
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = url || `${BASE_URL}${currentPath}`;
    
    let resolvedTitle = DEFAULT_TITLE;
    if (title) {
      resolvedTitle = title.includes('The Decor Party')
        ? title
        : `${title} | The Decor Party`;
    }

    const resolvedDesc = description || DEFAULT_DESCRIPTION;
    const resolvedImage = normalizeImageUrl(image);

    let resolvedKeywords = DEFAULT_KEYWORDS.join(', ');
    if (Array.isArray(keywords)) {
      resolvedKeywords = Array.from(new Set([...keywords, ...DEFAULT_KEYWORDS])).join(', ');
    } else if (typeof keywords === 'string' && keywords.trim()) {
      resolvedKeywords = `${keywords}, ${DEFAULT_KEYWORDS.join(', ')}`;
    }

    // 2. Set document title
    document.title = resolvedTitle;

    // 3. Set standard search & crawling tags
    setMetaTag('name', 'description', resolvedDesc);
    setMetaTag('name', 'keywords', resolvedKeywords);
    setMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 4. Set OpenGraph tags
    setMetaTag('property', 'og:title', resolvedTitle);
    setMetaTag('property', 'og:description', resolvedDesc);
    setMetaTag('property', 'og:image', resolvedImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', type === 'service' ? 'website' : type);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:locale', 'en_IN');

    // 5. Set Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', resolvedTitle);
    setMetaTag('name', 'twitter:description', resolvedDesc);
    setMetaTag('name', 'twitter:image', resolvedImage);
    setMetaTag('name', 'twitter:site', '@thedecorparty');

    // 6. Set Geo Tags for Bengaluru local search optimization
    setMetaTag('name', 'geo.region', 'IN-KA');
    setMetaTag('name', 'geo.placename', 'Bengaluru');
    setMetaTag('name', 'geo.position', '12.9716;77.5946');
    setMetaTag('name', 'ICBM', '12.9716, 77.5946');

    // 7. Canonical link
    setLinkTag('canonical', canonicalUrl);

    // 8. Build Schema.org JSON-LD graph
    const schemaGraph: any[] = [];

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.item.startsWith('http') ? b.item : `${BASE_URL}${b.item.startsWith('/') ? b.item : `/${b.item}`}`,
        })),
      });
    }

    // Product & Offer Schema
    if (productData) {
      const numericPrice =
        typeof productData.price === 'string'
          ? parseFloat(productData.price.replace(/[^0-9.]/g, '')) || 999
          : productData.price;

      schemaGraph.push({
        '@type': 'Product',
        name: productData.name,
        description: productData.description || resolvedDesc,
        image: normalizeImageUrl(productData.image || resolvedImage),
        sku: productData.sku || `TDP-${encodeURIComponent(productData.name.toLowerCase().replace(/\s+/g, '-'))}`,
        category: productData.category || 'Event Decoration Package',
        brand: {
          '@type': 'Brand',
          name: 'The Decor Party',
        },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: productData.priceCurrency || 'INR',
          price: numericPrice,
          availability:
            productData.availability === 'OutOfStock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'The Decor Party',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: productData.ratingValue || 4.9,
          reviewCount: productData.reviewCount || 128,
          bestRating: 5,
          worstRating: 1,
        },
      });
    }

    // FAQPage Schema with Speakable specification for AEO
    if (faqData && faqData.length > 0) {
      schemaGraph.push({
        '@type': 'FAQPage',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.speakable-answer', '.aeo-answer', 'h1', 'h2', 'h3'],
        },
        mainEntity: faqData.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    // Custom Schema
    if (schema) {
      if (Array.isArray(schema)) {
        schemaGraph.push(...schema);
      } else {
        schemaGraph.push(schema);
      }
    }

    // Inject JSON-LD if schemas exist
    let scriptTag = document.getElementById('dynamic-seo-ldjson') as HTMLScriptElement | null;
    if (schemaGraph.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-ldjson';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': schemaGraph,
      });
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup dynamically injected schema on route unmount
      const existing = document.getElementById('dynamic-seo-ldjson');
      if (existing) {
        existing.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    siteName,
    breadcrumbs,
    faqData,
    productData,
    schema,
    noindex,
  ]);

  return null;
};

export default SeoHead;
