'use client';

import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@/lib/wizard/debounce';

interface PixelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  debounceMs?: number;
}

export function PixelInput({
  value,
  onChange,
  placeholder,
  error,
  label,
  debounceMs = 300,
}: PixelInputProps) {
  const inputId = 'pixel-input-field';
  const errorId = 'input-error';
  
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(value);
  
  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Create debounced onChange handler
  const debouncedOnChange = useMemo(
    () => debounce((newValue: string) => {
      onChange(newValue);
    }, debounceMs),
    [onChange, debounceMs]
  );
  
  // Handle input change with debouncing
  const handleChange = (newValue: string) => {
    // Update local state immediately for responsive UI
    setLocalValue(newValue);
    // Debounce the actual onChange callback
    debouncedOnChange(newValue);
  };

  // Calculate initial width based on placeholder
  const initialWidth = Math.max(200, Math.min(600, (placeholder?.length || 10) * 12 + 100));
  
  // Calculate dynamic width based on content - can shrink but not below initial size
  const contentLength = localValue.length || 0;
  const calculatedWidth = Math.max(initialWidth, Math.min(600, contentLength * 12 + 100));

  return (
    <div className="flex flex-col items-center mx-auto px-2 sm:px-0">
      {/* Visually hidden label for screen readers */}
      {label && (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      )}
      
      <div 
        className="pixel-input-wrapper relative transition-all duration-300"
        style={{ width: `${calculatedWidth}px` }}
      >
        {/* Pixel-art style input background - pure CSS */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 50%, #d8d8d8 100%)',
            boxShadow: `
              inset 0 2px 0 rgba(255, 255, 255, 0.8),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2),
              0 4px 0 rgba(0, 0, 0, 0.15),
              0 6px 12px rgba(0, 0, 0, 0.2)
            `,
            border: '3px solid #a0a0a0',
            borderRadius: '8px',
          }}
          aria-hidden="true"
        />

        {/* Inner shadow for depth */}
        <div
          className="absolute inset-[3px] pointer-events-none rounded-md"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 20%)',
            borderRadius: '5px',
          }}
          aria-hidden="true"
        />

        {/* Input field */}
        <input
          id={inputId}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="font-[family-name:var(--font-pixelify)] text-base sm:text-lg text-[#2a2a2a] text-center placeholder:text-[#888] placeholder:opacity-70 placeholder:text-center relative z-10 w-full px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-none outline-none min-h-[44px] min-w-[44px]"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-label={label || placeholder}
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          id={errorId}
          className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-900/50 border-2 border-red-500 rounded"
          role="alert"
          aria-live="polite"
        >
          <p className="font-[family-name:var(--font-pixelify)] text-red-200 text-xs sm:text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
