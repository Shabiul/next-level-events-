import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#381932]/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" onClick={onCancel}>
      <div className="w-[92%] max-w-md flex flex-col rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#381932] dark:border-[#381932] px-5 py-4">
          <div className="flex items-center gap-2 text-[#381932] dark:text-[#FFF3E6]">
            <AlertTriangle size={18} />
            <h3 className="text-base font-black text-[#381932] dark:text-[#FFF3E6]">{title}</h3>
          </div>
          <button 
            type="button" 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
            onClick={onCancel}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 text-xs sm:text-sm font-medium text-[#381932] dark:text-[#381932] leading-relaxed">
          {message}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#381932] dark:border-[#381932] p-4 bg-[#FFF3E6]/50 dark:bg-[#381932]/50">
          <button 
            type="button" 
            className="rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-4 py-2.5 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className="rounded-xl bg-[#381932] hover:opacity-90 text-[#FFF3E6] px-4 py-2.5 text-xs font-bold shadow-md shadow-[#381932]/20 active:scale-95 transition-all cursor-pointer" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
