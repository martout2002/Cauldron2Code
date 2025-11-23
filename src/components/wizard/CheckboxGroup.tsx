'use client';

import { Check } from 'lucide-react';

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: number;
  label?: string;
}

export function CheckboxGroup({
  options,
  selected,
  onChange,
  columns = 2,
  label,
}: CheckboxGroupProps) {
  const isSelected = (value: string): boolean => {
    return selected.includes(value);
  };

  const handleToggle = (value: string) => {
    if (isSelected(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string, index: number) => {
    const totalOptions = options.length;
    let nextIndex = index;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleToggle(value);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = Math.min(index + 1, totalOptions - 1);
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = Math.max(index - 1, 0);
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
    }
  };

  // Determine responsive columns
  const getResponsiveColumns = () => {
    if (columns >= 2) {
      return 'grid-cols-1 sm:grid-cols-2';
    }
    return 'grid-cols-1';
  };

  return (
    <div
      className={`grid gap-3 sm:gap-4 w-full max-w-4xl mx-auto px-2 sm:px-0 ${getResponsiveColumns()}`}
      role="group"
      aria-label={label || 'Select options'}
    >
      {options.map((option, index) => {
        const checked = isSelected(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value, index)}
            className={`
              pixel-checkbox-card
              flex items-center gap-3 sm:gap-4
              p-3 sm:p-4
              bg-gray-900/80 
              border-3 border-gray-700
              rounded-lg
              cursor-pointer
              transition-all duration-200
              touch-target
              hover:border-green-500 hover:bg-gray-800/90 hover:-translate-y-1 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${
                checked
                  ? 'border-green-400 bg-green-900/30 shadow-pixel-glow-green'
                  : ''
              }
            `}
            role="checkbox"
            aria-checked={checked}
            aria-label={`${option.label}${option.description ? `, ${option.description}` : ''}`}
            tabIndex={0}
          >
            {/* Custom Checkbox */}
            <div
              className={`
                shrink-0 w-5 h-5 sm:w-6 sm:h-6
                border-2 rounded
                flex items-center justify-center
                transition-all duration-200
                ${
                  checked
                    ? 'bg-green-500 border-green-400'
                    : 'bg-gray-800 border-gray-600'
                }
              `}
              aria-hidden="true"
            >
              {checked && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />}
            </div>

            {/* Label and Description */}
            <div className="flex-1 text-left">
              <div className="font-pixelify text-sm sm:text-base text-white">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                  {option.description}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
