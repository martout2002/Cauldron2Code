'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  // Compatibility state - Requirements: 1.1, 1.2
  isDisabled?: boolean;
  incompatibilityReason?: string;
}

interface OptionGridProps {
  options: Option[];
  selected: string | string[];
  onSelect: (value: string | string[]) => void;
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
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSelected = (value: string): boolean => {
    if (Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  const handleSelect = (value: string, isDisabled: boolean = false) => {
    // Prevent selection of disabled options - Requirement: 1.2
    if (isDisabled) {
      return;
    }
    
    if (multiSelect && Array.isArray(selected)) {
      // Toggle selection in multi-select mode
      if (selected.includes(value)) {
        onSelect(selected.filter((v) => v !== value));
      } else {
        onSelect([...selected, value]);
      }
    } else {
      // Single select mode
      onSelect(value);
    }
  };

  // Tooltip management with debouncing - Requirements: 2.3, 8.3
  const handleMouseEnter = (value: string) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Debounce tooltip showing by 100ms - Requirement: 8.3
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(value);
    }, 100);
  };

  const handleMouseLeave = () => {
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Hide tooltip after 200ms - Requirement: 2.3
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(null);
    }, 200);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, value: string, index: number, isDisabled: boolean = false) => {
    const totalOptions = options.length;
    let nextIndex = index;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Prevent selection of disabled options on Enter/Space - Requirements: 1.2, 4.3
        if (!isDisabled) {
          handleSelect(value, isDisabled);
        }
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
        className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12"
        role={multiSelect ? 'group' : 'radiogroup'}
        aria-label={label || 'Select an option'}
      >
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          const shouldShowTooltip = showTooltip === option.value;
          const disabled = option.isDisabled || false;
          // Generate unique ID for aria-describedby - Requirement: 4.2
          const descriptionId = `option-desc-${option.value}`;
          
          return (
            <div key={option.value} className="relative flex flex-col items-center" style={{ minHeight: '120px' }}>
              {/* Hidden description element for screen readers - Requirements: 4.2, 4.5 */}
              {disabled && option.incompatibilityReason && (
                <div 
                  id={descriptionId} 
                  className="sr-only"
                  role="status"
                  aria-live="polite"
                >
                  {option.incompatibilityReason}
                </div>
              )}
              
              {/* Icon button */}
              <button
                onClick={() => handleSelect(option.value, disabled)}
                onKeyDown={(e) => handleKeyDown(e, option.value, index, disabled)}
                onMouseEnter={() => handleMouseEnter(option.value)}
                onMouseLeave={handleMouseLeave}
                className={`
                  wizard-option
                  relative
                  flex flex-col items-center justify-center
                  transition-all duration-300 ease-in-out
                  outline-none border-none
                  ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed hover:opacity-40' // Requirement: 1.1, 1.5 - smooth opacity transition, disabled cursor
                      : 'cursor-pointer hover:scale-110 hover:opacity-100' // Requirement: 1.1 - no hover effects for disabled
                  }
                  ${selected && !disabled ? 'scale-110 selected' : ''}
                `}
                style={{
                  // Requirement: 1.5 - Smooth opacity transitions for disabled state changes
                  transition: 'opacity 300ms ease-in-out, transform 200ms ease-in-out',
                }}
                role={multiSelect ? 'checkbox' : 'radio'}
                aria-checked={selected}
                aria-label={`${option.label}${option.description ? `, ${option.description}` : ''}`}
                aria-disabled={disabled} // Requirement: 4.1 - aria-disabled attribute
                aria-describedby={disabled && option.incompatibilityReason ? descriptionId : undefined} // Requirement: 4.2 - link to description
                tabIndex={0} // Requirement: 4.3 - disabled options remain focusable
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

                {/* Icon with fixed dimensions to prevent layout shift */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
                  <img
                    src={option.icon || '/icons/frameworks/placeholder.svg'}
                    alt={option.label}
                    className="w-full h-full object-contain transition-transform duration-200"
                    onError={(e) => {
                      console.warn(`Failed to load icon for ${option.label}, using placeholder`);
                      e.currentTarget.src = '/icons/frameworks/placeholder.svg';
                    }}
                  />
                </div>

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

              {/* Tooltip popup - Requirements: 2.1, 2.2, 2.3, 2.5 */}
              {shouldShowTooltip && (
                <div 
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 tooltip-fade-in pointer-events-none"
                  style={{
                    // Requirement: 2.3 - Tooltip fade-in animation (respects prefers-reduced-motion)
                    animation: 'tooltipFadeIn 200ms ease-out',
                  }}
                >
                  <div className={`
                    border-2 rounded-lg px-4 py-3 shadow-xl max-w-xs whitespace-nowrap
                    ${disabled 
                      ? 'bg-red-900 border-red-700' // Incompatibility tooltip styling
                      : 'bg-gray-900 border-gray-700' // Description tooltip styling
                    }
                  `}>
                    <p className="text-sm text-gray-200 text-center leading-relaxed">
                      {/* Show incompatibility reason for disabled options, description for enabled - Requirement: 2.5 */}
                      {disabled && option.incompatibilityReason 
                        ? option.incompatibilityReason 
                        : option.description
                      }
                    </p>
                    {/* Arrow pointing up */}
                    <div className={`
                      absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45
                      border-l-2 border-t-2
                      ${disabled 
                        ? 'bg-red-900 border-red-700' 
                        : 'bg-gray-900 border-gray-700'
                      }
                    `} />
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
