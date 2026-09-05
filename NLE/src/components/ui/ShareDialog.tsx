import React, { useEffect, useState } from 'react';
import { Copy, Globe, Send, Mail, MessageCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '../../utils/utils';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url: string;
}

const shareButtons = [
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    href: (url: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
    className: 'bg-[#381932] text-[#FFF3E6] hover:bg-[#FFF3E6]',
  },
  {
    label: 'Facebook',
    icon: Globe,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    className: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
  },
  {
    label: 'X (Twitter)',
    icon: Globe,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    className: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
  },
  {
    label: 'Telegram',
    icon: Send,
    href: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    className: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
  },
  {
    label: 'Email',
    icon: Mail,
    href: (url: string, title: string, text: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    className: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
  },
];

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, title, text, url }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#381932]/40 backdrop-blur-xs p-4 transition-opacity animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-6 shadow-modal dark:bg-[#381932] dark:border-[#381932] animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#381932]/30 pb-4 dark:border-[#381932]">
          <div>
            <h2 className="text-base font-semibold text-[#381932] dark:text-[#FFF3E6]">Share Package</h2>
            <p className="text-xs text-[#381932] dark:text-[#381932] mt-0.5">Send this decoration experience to friends & family</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] cursor-pointer"
            aria-label="Close share dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#381932]/30 bg-[#FFF3E6] p-1.5 dark:bg-[#381932] dark:border-[#381932]">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full bg-transparent px-2.5 text-xs text-[#381932] dark:text-[#FFF3E6] outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#381932] px-3 py-1.5 text-xs font-semibold text-[#FFF3E6] hover:opacity-90 transition-all dark:bg-[#FFF3E6] dark:text-[#381932] dark:hover:bg-[#FFF3E6] cursor-pointer flex-shrink-0"
            >
              <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mb-2 uppercase tracking-wide">Share directly</p>
            <div className="grid grid-cols-3 gap-2">
              {shareButtons.map((button) => {
                const Icon = button.icon;
                return (
                  <a
                    key={button.label}
                    href={button.href(url, title, text)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-2 text-xs font-semibold transition-transform active:scale-95 shadow-xs',
                      button.className
                    )}
                  >
                    <Icon size={14} /> {button.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
