import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingAIPlannerProps {
  onAssistantOpen?: () => void;
}

export const FloatingAIPlanner: React.FC<FloatingAIPlannerProps> = ({ onAssistantOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [minimized, setMinimized] = useState(false);

  // Hide on admin routes or if already on the AI planner page
  if (location.pathname.startsWith('/admin') || location.pathname === '/ai-planner') {
    return null;
  }

  const handleClick = () => {
    if (onAssistantOpen) {
      onAssistantOpen();
    } else {
      navigate('/ai-planner');
    }
  };

  return (
    <div
      className="fixed bottom-6 left-4 sm:left-6 z-[99999] pointer-events-auto"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <AnimatePresence mode="wait">
        {!minimized ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="group relative flex items-center gap-3 rounded-full border border-[#C9BEAB]/40 bg-[#2D1833]/92 hover:bg-[#38203E] px-4 py-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all duration-300 hover:scale-103 hover:border-[#C9BEAB]/70 cursor-pointer"
            onClick={handleClick}
          >
            {/* Ambient Pulsing Glow behind the pill */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#A78A9F]/30 via-[#C9BEAB]/25 to-[#725D75]/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity -z-10 animate-pulse" />

            {/* Sparkles Icon with Gold Radial Glow */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C9BEAB] to-[#A78A9F] text-[#25172C] shadow-sm">
              <Sparkles size={14} className="animate-spin-slow" />
            </div>

            {/* Copy */}
            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif text-xs sm:text-[13px] font-bold tracking-tight text-[#FAF8F5]">
                  AI Event Planner
                </span>
                <span className="rounded-full bg-[#C9BEAB]/20 border border-[#C9BEAB]/40 px-1.5 py-0.2 text-[9px] font-bold text-[#C9BEAB] uppercase tracking-wider">
                  Free
                </span>
              </div>
              <span className="text-[10px] text-[#C8B5C3] mt-0.5 font-light">
                Tailored themes &amp; instant budget
              </span>
            </div>

            {/* Action Arrow */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#C9BEAB] group-hover:bg-[#C9BEAB] group-hover:text-[#25172C] transition-colors">
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Minimize button */}
            <button
              type="button"
              aria-label="Minimize AI Planner Widget"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
              }}
              className="ml-1 text-[#C8B5C3]/60 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            aria-label="Open AI Planner Widget"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setMinimized(false)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9BEAB]/40 bg-[#2D1833]/95 text-[#C9BEAB] shadow-xl backdrop-blur-xl hover:scale-105 hover:bg-[#38203E] transition-all cursor-pointer"
          >
            <Sparkles size={20} className="animate-spin-slow" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingAIPlanner;
