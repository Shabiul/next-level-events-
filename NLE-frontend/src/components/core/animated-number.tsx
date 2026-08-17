import React, { useEffect, useRef } from 'react';
import { useSpring, useTransform, useInView, type SpringOptions } from 'framer-motion';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  decimalPlaces?: number;
  startOnView?: boolean;
};

export function AnimatedNumber({
  value,
  className = '',
  springOptions = {
    bounce: 0,
    duration: 2000,
  },
  as: Component = 'span',
  decimalPlaces = 0,
  startOnView = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const spring = useSpring(0, springOptions);

  const display = useTransform(spring, (current) =>
    Number(current).toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })
  );

  useEffect(() => {
    if (startOnView) {
      if (isInView && value > 0) {
        spring.set(value);
      }
    } else {
      spring.set(value);
    }
  }, [isInView, spring, value, startOnView]);

  useEffect(() => {
    // Initial display
    if (ref.current) {
      ref.current.textContent = Number(0).toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    }

    const unsubscribe = display.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return () => unsubscribe();
  }, [display, decimalPlaces]);

  return (
    <Component ref={ref} className={className}>
      {Number(0).toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}
    </Component>
  );
}

export default AnimatedNumber;
