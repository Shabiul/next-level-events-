import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';

const SUPPORT_PHONE = '+917022058460';
const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE}`;
const INSTAGRAM_URL = 'https://www.instagram.com/thedecorparty.com_?utm_source=qr&igsh=MW15aTFvOWY0MjU1cg==';

// lucide-react doesn't ship a brand Instagram glyph -- same inline SVG
// already used for the Instagram link in Footer.tsx, wrapped to accept a
// `size` prop like the lucide icons this sits alongside.
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

interface FloatingActionMenuProps {
  onAssistantOpen?: () => void;
  assistantOpen?: boolean;
}

const actions = [
  {
    label: 'Call Concierge',
    icon: Phone,
    bg: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
    shadow: 'shadow-md',
    action: 'call',
  },
  {
    label: 'WhatsApp Chat',
    icon: MessageCircle,
    bg: 'bg-[#381932] text-[#FFF3E6] hover:bg-[#FFF3E6]',
    shadow: 'shadow-md',
    action: 'whatsapp',
  },
  {
    label: 'Instagram',
    icon: InstagramIcon,
    bg: 'bg-gradient-to-tr from-[#FFF3E6] via-[#381932] to-[#381932] text-[#FFF3E6] hover:opacity-90',
    shadow: 'shadow-md',
    action: 'instagram',
  },
] as const;

export function FloatingActionMenu({ assistantOpen = false }: FloatingActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const closeAnd = (action: typeof actions[number]['action']) => {
    setOpen(false);
    if (action === 'call') {
      window.location.href = `tel:${SUPPORT_PHONE}`;
    }
    if (action === 'whatsapp') window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
    if (action === 'instagram') window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  const isProductPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/product/');

  if (!mounted || typeof document === 'undefined' || assistantOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="fixed flex flex-col items-end gap-3 pointer-events-none transition-all duration-300"
      style={{
        position: 'fixed',
        bottom: isProductPage
          ? 'calc(76px + env(safe-area-inset-bottom, 0px))'
          : 'calc(24px + env(safe-area-inset-bottom, 0px))',
        right: '24px',
        zIndex: 999999,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="flex flex-col items-end gap-2.5 pointer-events-auto"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
              closed: { transition: { staggerChildren: 0.04, staggerDirection: 1 } },
            }}
          >
            {actions.map(({ label, icon: Icon, bg, shadow, action }) => (
              <motion.div
                key={action}
                className="flex items-center gap-2"
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: 12, scale: 0.8 },
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                <span className="rounded-full bg-[#FFF3E6] dark:bg-[#381932] border border-[#381932]/30 dark:border-[#381932] px-3 py-1 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] shadow-xs">
                  {label}
                </span>

                <button
                  type="button"
                  aria-label={label}
                  onClick={() => closeAnd(action)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer ${bg} ${shadow}`}
                >
                  <Icon size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#381932] text-[#FFF3E6] shadow-lg ring-4 ring-[#FFF3E6]/90 dark:ring-[#381932]/90 hover:opacity-90 transition-colors cursor-pointer"
        whileTap={{ scale: 0.92 }}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="flex items-center justify-center"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </motion.span>
      </motion.button>
    </div>,
    document.body
  );
}
