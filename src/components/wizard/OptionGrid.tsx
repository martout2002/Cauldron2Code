'use client';

import { useState } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface OptionGridProps {
  options: Option[];
  selected: string | string[];
  onSelect: (value: string) => void;
  columns?: number;
  multiSelect?: boolean;
  label?: string;
}

export function OptionGrid({
  options,
  selected,
  onSelect,
  multiSelect = false,
  label,
}: OptionGridProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const isSelected = (value: string): boolean => {
    if (Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string, index: number) => {
    const totalOptions = options.length;
    let nextIndex = index;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(value);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (index + 1) % totalOptions;
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (index - 1 + totalOptions) % totalOptions;
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Horizontal row of icons */}
      <div
        className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 flex-wrap"
        role={multiSelect ? 'group' : 'radiogroup'}
        aria-label={label || 'Select an option'}
      >
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          const isHovered = hoveredOption === option.value;
          
          return (
            <div key={option.value} className="relative flex flex-col items-center">
              {/* Icon button */}
              <button
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => handleKeyDown(e, option.value, index)}
                onMouseEnter={() => setHoveredOption(option.value)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  relative
                  flex flex-col items-center justify-center
                  p-3 sm:p-4
                  cursor-pointer
                  transition-all duration-200
                  touch-target
                  hover:scale-110
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent
                  ${selected ? 'scale-110' : ''}
                `}
                role={multiSelect ? 'checkbox' : 'radio'}
                aria-checked={selected}
                aria-label={`${option.label}${option.description ? `, ${option.description}` : ''}`}
                tabIndex={0}
              >
                {/* Checkmark indicator for selected state */}
                {selected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center z-10 shadow-lg">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-4 h-4 fill-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                {option.icon && (
                  <img
                    src={option.icon}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.src = '/icons/frameworks/placeholder.svg';
                    }}
                  />
                )}

                {/* Label below icon */}
                <span className="mt-2 font-pixelify text-xs sm:text-sm text-white text-center whitespace-nowrap">
                  {option.label}
                </span>

                {/* Info icon */}
                {option.description && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-900">
                    ⓘ
                  </div>
                )}
              </button>

              {/* Tooltip popup */}
              {isHovered && option.description && (
                <div className="absolute top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 shadow-xl max-w-xs">
                    <p className="text-sm text-gray-200 text-center leading-relaxed">
                      {option.description}
                    </p>
                    {/* Arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-l-2 border-t-2 border-gray-700 rotate-45" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
