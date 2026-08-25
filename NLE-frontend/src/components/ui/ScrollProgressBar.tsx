import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-[#8F6FC4] via-[#C7B8E8] to-[#483250] dark:from-[#C9BEAB] dark:via-[#A78A9F] dark:to-amber-400 origin-left shadow-[0_0_10px_rgba(201,190,171,0.8)]"
        style={{ scaleX }}
      />
    </div>
  );
};

export default ScrollProgressBar;
