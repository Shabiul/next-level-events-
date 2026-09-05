import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Modal: React.FC<{ 
  title: string; 
  onClose: () => void; 
  children: React.ReactNode;
  large?: boolean;
  className?: string;
}> = ({ title, onClose, children, large, className }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 bg-[#381932]/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" 
      onClick={onClose}
    >
      <div 
        className={cn(
          "w-[95%] max-h-[92vh] flex flex-col rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-2xl transition-all duration-200 animate-in zoom-in-95 overflow-hidden",
          large ? "max-w-4xl" : "max-w-xl",
          className
        )} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#381932] dark:border-[#381932] px-5 py-4">
          <h3 className="text-base font-black text-[#381932] dark:text-[#FFF3E6] truncate pr-2">{title}</h3>
          <button 
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#FFF3E6] transition-colors hover:bg-[#FFF3E6] dark:hover:bg-[#381932] cursor-pointer" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-[#381932] dark:text-[#FFF3E6]">
          {children}
        </div>
      </div>
    </div>
  );
};
