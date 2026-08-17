import React from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

const defaultTitle = 'TheDecorParty | Premium Event Decoration & Balloon Styling';
const defaultDescription = 'Handcrafted surprise setups, balloon decorations, and curated event experiences for every celebration in Bengaluru.';
const defaultSiteName = 'TheDecorParty';
const defaultUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thedecorparty.com';

const normalizeImage = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${defaultUrl}${image}`;
  return image;
};

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'product',
  siteName = defaultSiteName,
}) => {
  const resolvedTitle = title ? `${title} | TheDecorParty` : defaultTitle;
  const resolvedDescription = description || defaultDescription;
  const resolvedImage = normalizeImage(image);
  const resolvedUrl = url || defaultUrl;

  return (
    <>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />
      <link rel="canonical" href={resolvedUrl} />
    </>
  );
};
