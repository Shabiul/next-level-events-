import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  category?: string | null;
  subcategory?: string | null;
  productName?: string | null;
  className?: string;
}

export function getPageContextPlaceholder({
  category,
  subcategory,
  productName,
  customPlaceholder,
}: {
  category?: string | null;
  subcategory?: string | null;
  productName?: string | null;
  customPlaceholder?: string;
}): string {
  if (customPlaceholder) return customPlaceholder;
  if (productName) return 'Search decoration experiences...';
  if (subcategory && subcategory !== '__all__') {
    const sub = subcategory.trim();
    return /package/i.test(sub) ? `Search ${sub}...` : `Search ${sub} setups...`;
  }
  if (category) {
    const cat = category.trim();
    return `Search within ${cat}...`;
  }
  return 'Search birthday, anniversary, canopy themes...';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  category,
  subcategory,
  productName,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const targetSentence = useMemo(() => {
    return getPageContextPlaceholder({
      category,
      subcategory,
      productName,
      customPlaceholder: placeholder,
    });
  }, [category, subcategory, productName, placeholder]);

  useEffect(() => {
    setDisplayText('');
    setIsDeleting(false);
  }, [targetSentence]);

  useEffect(() => {
    if (isFocused || value) {
      setDisplayText('');
      setIsDeleting(false);
      return;
    }

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < targetSentence.length) {
        timer = setTimeout(() => {
          setDisplayText(targetSentence.slice(0, displayText.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(targetSentence.slice(0, displayText.length - 1));
        }, 30);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, isFocused, value, targetSentence]);

  const activePlaceholder = isFocused || value ? targetSentence : (displayText || targetSentence);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`mx-auto flex w-full max-w-[680px] items-center gap-3 rounded-full border px-4 sm:px-5 py-3 cursor-text transition-all duration-200 ${
          isFocused
            ? 'bg-white border-[#5D2B54] shadow-md ring-2 ring-[#C9BEAB]/40 dark:bg-[#2E1D33] dark:border-[#C9BEAB]'
            : 'bg-[#F2ECE1]/80 border-[#DDD5C7] hover:border-[#C9BEAB] dark:bg-[#241628] dark:border-[#442B4B]'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search
          size={18}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isFocused ? 'text-[#5D2B54] dark:text-[#C9BEAB]' : 'text-[#725D75] dark:text-[#A78A9F]'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={activePlaceholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-sm sm:text-base text-[#2C1B2E] dark:text-[#FAF7F5] outline-none placeholder:text-[#725D75]/70 dark:placeholder:text-[#A78A9F]/60 font-normal"
        />
        {value && (
          <button
            onClick={e => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#DDD5C7] hover:bg-[#C9BEAB] dark:bg-[#442B4B] dark:hover:bg-[#5D2B54] text-[#2C1B2E] dark:text-white transition-all active:scale-90"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
