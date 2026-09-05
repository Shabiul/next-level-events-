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
        className={`mx-auto flex w-full max-w-[680px] items-center gap-3 rounded-full border px-4 sm:px-5 py-3.5 cursor-text transition-all duration-200 backdrop-blur-md shadow-lg ${
          isFocused
            ? 'bg-[#FFF3E6] border-[#381932] ring-2 ring-[#381932]/20 shadow-xl'
            : 'bg-[#FFF3E6]/90 border-[#381932]/30 hover:border-[#381932]'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search
          size={18}
          className="flex-shrink-0 transition-colors duration-200 text-[#381932]"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={activePlaceholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-sm sm:text-base text-[#381932] outline-none placeholder:text-[#381932]/70 font-medium"
        />
        {value && (
          <button
            onClick={e => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3E6]/60 hover:opacity-90 text-[#381932] hover:text-[#FFF3E6] transition-all active:scale-90 cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
