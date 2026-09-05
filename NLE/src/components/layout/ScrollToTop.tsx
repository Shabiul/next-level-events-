import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On every navigation: jump to the top of the page, unless the destination
 * carries a hash (e.g. footer links like "/about#process" or "/#testimonials")
 * -- then scroll to that element instead. Lazy-loaded route chunks may not
 * have rendered the target element yet on the very first paint, so this
 * retries briefly rather than giving up after one missed attempt.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.slice(1);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 20) setTimeout(tryScroll, 100);
    };
    tryScroll();
  }, [pathname, hash]);

  return null;
}
