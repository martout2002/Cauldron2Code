'use client';

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
  columns = 3,
  multiSelect = false,
  label,
}: OptionGridProps) {
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
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = Math.min(index + columns, totalOptions - 1);
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = Math.max(index - columns, 0);
        (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
        break;
    }
  };

  // Determine responsive columns
  const getResponsiveColumns = () => {
    if (columns >= 3) {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3';
    } else if (columns === 2) {
      return 'grid-cols-1 sm:grid-cols-2';
    }
    return 'grid-cols-1';
  };

  return (
    <div
      className={`grid gap-3 sm:gap-4 w-full max-w-4xl mx-auto px-2 sm:px-0 ${getResponsiveColumns()}`}
      role={multiSelect ? 'group' : 'radiogroup'}
      aria-label={label || 'Select an option'}
    >
      {options.map((option, index) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value, index)}
            className={`
              pixel-option-card
              flex flex-col items-center justify-center
              p-4 sm:p-5 md:p-6 
              min-h-[90px] sm:min-h-[120px] md:min-h-[140px]
              bg-gray-900/80 
              border-3 border-gray-700
              rounded-lg
              cursor-pointer
              transition-all duration-200
              touch-target
              hover:border-green-500 hover:bg-gray-800/90 hover:-translate-y-1 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${
                selected
                  ? 'border-green-400 bg-green-900/30 shadow-pixel-glow-green'
                  : ''
              }
            `}
            role={multiSelect ? 'checkbox' : 'radio'}
            aria-checked={selected}
            aria-label={`${option.label}${option.description ? `, ${option.description}` : ''}`}
            tabIndex={0}
          >
            {/* Icon */}
            {option.icon && (
              <div className="mb-2 sm:mb-3" aria-hidden="true">
                <img
                  src={option.icon}
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Label */}
            <span className="pixel-option-label font-pixelify text-sm sm:text-base text-white text-center">
              {option.label}
            </span>

            {/* Description */}
            {option.description && (
              <span className="mt-1 sm:mt-2 text-xs text-gray-400 text-center">
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
