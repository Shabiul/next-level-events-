import { useEffect } from 'react';

/**
 * useSmoothScroll Hook
 * Provides ultra-smooth momentum/inertial scrolling for the page.
 * Uses requestAnimationFrame with optimized lerp smoothing.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let isRunning = false;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    const ease = 0.085; // Silky smooth damping factor

    const isScrollable = (el: HTMLElement | null): boolean => {
      if (!el || el === document.body || el === document.documentElement) return false;
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isOverflow = overflowY === 'auto' || overflowY === 'scroll';
      return isOverflow && el.scrollHeight > el.clientHeight;
    };

    const hasScrollableParent = (target: EventTarget | null): boolean => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (isScrollable(el)) return true;
        el = el.parentElement;
      }
      return false;
    };

    const updateScroll = () => {
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        currentY += diff * ease;
        window.scrollTo(0, currentY);
        requestAnimationFrame(updateScroll);
      } else {
        currentY = targetY;
        window.scrollTo(0, targetY);
        isRunning = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Don't intercept if scrolling inside a scrollable modal, drawer, or dropdown
      if (hasScrollableParent(e.target)) {
        return;
      }

      // Check max scroll height
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // Add wheel delta with standard multiplier
      const delta = e.deltaY * 1.1;
      targetY = Math.max(0, Math.min(targetY + delta, maxScroll));

      e.preventDefault();

      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY;
        requestAnimationFrame(updateScroll);
      }
    };

    const onScrollSync = () => {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScrollSync, { passive: true });

    // Automatic Scroll Reveal Observer for the entire website
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    const observeElements = () => {
      document.querySelectorAll('.scroll-reveal, [data-reveal]').forEach((el) => {
        revealObserver.observe(el);
      });
    };

    observeElements();
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScrollSync);
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
