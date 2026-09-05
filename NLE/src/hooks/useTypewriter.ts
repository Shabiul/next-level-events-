import { useEffect, useState } from 'react';

interface TypewriterOptions {
  typingSpeed?: number;
  deletingSpeed?: number;
  /** How long the fully-typed word sits before it starts erasing, in ms. */
  pauseMs?: number;
}

/**
 * Cycles through `words`, typing each one out character by character,
 * pausing, then deleting it before moving on to the next -- the classic
 * "typewriter" rotating-suggestion effect.
 *
 * Respects prefers-reduced-motion: cycles the full words on a timer instead
 * of animating each character.
 */
export function useTypewriter(words: string[], opts: TypewriterOptions = {}): string {
  const { typingSpeed = 75, deletingSpeed = 35, pauseMs = 1500 } = opts;
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!words.length) return undefined;

    if (reducedMotion) {
      setText(words[wordIndex % words.length]);
      const t = setTimeout(() => setWordIndex((i) => (i + 1) % words.length), pauseMs * 1.5);
      return () => clearTimeout(t);
    }

    const current = words[wordIndex % words.length];

    if (phase === 'typing') {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('deleting'), pauseMs);
      return () => clearTimeout(t);
    }

    // phase === 'deleting'
    if (text.length > 0) {
      const t = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
      return () => clearTimeout(t);
    }
    setPhase('typing');
    setWordIndex((i) => (i + 1) % words.length);
    return undefined;
  }, [text, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseMs, reducedMotion]);

  return text;
}

export default useTypewriter;
