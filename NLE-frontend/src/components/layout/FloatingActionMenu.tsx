import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';

const SUPPORT_PHONE = '+917022058460';
const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE}`;

interface FloatingActionMenuProps {
  onAssistantOpen?: () => void;
  assistantOpen?: boolean;
}

const actions = [
  {
    label: 'Call Concierge',
    icon: Phone,
    bg: 'bg-[#4A4A48] text-white hover:bg-[#383836]',
    shadow: 'shadow-md',
    action: 'call',
  },
  {
    label: 'WhatsApp Chat',
    icon: MessageCircle,
    bg: 'bg-[#25D366] text-white hover:bg-[#1EBE5D]',
    shadow: 'shadow-md',
    action: 'whatsapp',
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
                <span className="rounded-full bg-white dark:bg-[#1E1E1E] border border-[#E8E7E3] dark:border-[#2E2E2E] px-3 py-1 text-xs font-semibold text-[#1C1C1C] dark:text-white shadow-xs">
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
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1C1C] text-white shadow-lg ring-4 ring-white/90 dark:ring-[#121212]/90 hover:bg-black transition-colors cursor-pointer"
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
