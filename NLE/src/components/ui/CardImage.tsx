import React, { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../utils/utils';

export interface CardImageProps {
  src?: string;
  alt: string;
  /** Tailwind aspect-ratio utility for the image area. Keep this the SAME
   * value for every card in a given grid so the cards stay equal height. */
  ratio?: string;
  /** object-cover (default) fills the whole card frame edge to edge -- the
   * image is centered and scaled up so there are never blank bars, at the cost
   * of a small crop on the long side. Pass "contain" only where the entire
   * image must stay visible (e.g. logos, diagrams). */
  fit?: 'contain' | 'cover';
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  /** Mark above-the-fold or critical cards as priority to load eagerly with high fetchPriority */
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Session-level cache of loaded image URLs to prevent skeleton flashes &
 * layout shifts during filtering, sorting, or client-side navigation.
 */
const loadedImageCache = new Set<string>();

/**
 * Shared high-performance image component for cards across the application.
 *  - Reserved aspect-ratio container (zero layout shift / CLS)
 *  - High-efficiency modern WebP support via <picture> with seamless fallback
 *  - In-memory cache tracking so visited/rendered images render instantly with no skeleton flash
 *  - Support for `priority` (loading="eager" + fetchPriority="high") for above-the-fold cards
 *  - Async decoding for non-blocking UI rendering
 */
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  ratio = 'aspect-[4/3]',
  fit = 'cover',
  className,
  imgClassName,
  loading = 'lazy',
  priority = false,
  fetchPriority,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const isInitiallyLoaded = Boolean(src && loadedImageCache.has(src));
  const [loaded, setLoaded] = useState(isInitiallyLoaded);
  const [errored, setErrored] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);

  useEffect(() => {
    setErrored(false);
    setWebpFailed(false);
    if (!src) {
      setLoaded(false);
      return;
    }
    if (loadedImageCache.has(src)) {
      setLoaded(true);
      return;
    }
    // Handle browser cache race where image is already complete
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      loadedImageCache.add(src);
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    if (src) loadedImageCache.add(src);
    setLoaded(true);
  };

  const handleError = () => {
    // If a webp source failed, drop the <source> and let the browser fall back to base src
    if (!webpFailed && src && !src.startsWith('http') && /\.(jpe?g|png)$/i.test(src)) {
      setWebpFailed(true);
      return;
    }
    setErrored(true);
  };

  const showFallback = errored || !src;
  const effectiveLoading = priority ? 'eager' : loading;
  const effectiveFetchPriority = priority ? 'high' : (fetchPriority || 'auto');

  // Derive companion webp path for local public images
  const webpSrc = !webpFailed && src && !src.startsWith('http') && /\.(jpe?g|png)$/i.test(src)
    ? src.replace(/\.(jpe?g|png)$/i, '.webp')
    : null;

  return (
    <div className={cn('relative w-full overflow-hidden bg-[#EFE3D3]', ratio, className)}>
      {!loaded && !showFallback && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#EFE3D3] to-[#E6D7C5] pointer-events-none transition-opacity duration-300" />
      )}

      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center text-[#381932]/30">
          <ImageOff size={28} strokeWidth={1.5} />
        </div>
      ) : (
        <picture className="absolute inset-0 block h-full w-full">
          {webpSrc && <source type="image/webp" srcSet={webpSrc} />}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={effectiveLoading}
            // @ts-ignore fetchPriority is standard in modern HTML
            fetchPriority={effectiveFetchPriority}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'h-full w-full object-center transition-opacity duration-200',
              fit === 'cover' ? 'object-cover' : 'object-contain',
              loaded ? 'opacity-100' : 'opacity-95',
              imgClassName
            )}
          />
        </picture>
      )}
    </div>
  );
};

export default CardImage;
