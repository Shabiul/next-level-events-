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
}

/**
 * Shared image area for every card on the site.
 *  - fixed, reserved aspect box (no layout jump while loading)
 *  - the image fills the frame edge to edge (object-cover), centered and never
 *    distorted -- no blank bars around the picture
 *  - a soft skeleton BEHIND the image while it loads
 *  - a graceful icon fallback ONLY on a genuine load error
 *
 * The <img> is always rendered at full opacity. A previous version hid it with
 * `opacity-0` until the `onLoad` event fired, which broke on browser-cached
 * images (the load event can fire before React attaches the handler) and left
 * cards blank. Never gate visibility on onLoad again.
 */
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  ratio = 'aspect-[4/3]',
  fit = 'cover',
  className,
  imgClassName,
  loading = 'lazy',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
    setLoaded(false);
    // Cache race: if the browser already has the image, `onLoad` may never fire.
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const showFallback = errored || !src;

  return (
    <div className={cn('relative w-full overflow-hidden bg-[#EFE3D3]', ratio, className)}>
      {!loaded && !showFallback && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#EFE3D3] to-[#E6D7C5]" />
      )}

      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center text-[#381932]/30">
          <ImageOff size={28} strokeWidth={1.5} />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-center',
            fit === 'cover' ? 'object-cover' : 'object-contain',
            imgClassName
          )}
        />
      )}
    </div>
  );
};

export default CardImage;
