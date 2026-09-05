/**
 * useSmoothScroll Hook
 *
 * Previously this hijacked every mouse-wheel event (`preventDefault` + a
 * hand-rolled requestAnimationFrame lerp loop) to fake "buttery" scrolling,
 * plus ran a second full-document MutationObserver duplicating the reveal
 * logic already handled by `useScrollReveal` / `main.tsx`. Both together were
 * the main source of site-wide scroll lag/jank -- native scrolling (and the
 * browser's own compositor-threaded scrolling) is faster and smoother than
 * any JS wheel-loop can be, especially on trackpads and high refresh-rate
 * displays. This is now a no-op kept only so existing `useSmoothScroll()`
 * call sites don't need to change.
 */
export function useSmoothScroll() {
  // Intentionally does nothing -- rely on native browser scrolling.
}
