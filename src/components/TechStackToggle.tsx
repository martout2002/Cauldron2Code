'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface OptionConfig {
  value: string;
  label: string;
  description?: string;
  recommended?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

interface TechStackToggleProps {
  label: string;
  options: readonly string[] | readonly OptionConfig[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  type?: 'radio' | 'dropdown';
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
}

export function TechStackToggle({
  label,
  options,
  value,
  onChange,
  tooltip,
  type = 'radio',
  className = '',
  layout = 'horizontal',
  columns = 3,
}: TechStackToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  // Normalize options to OptionConfig format
  const normalizedOptions: OptionConfig[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  if (type === 'dropdown') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium">{label}</label>
          {tooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Info size={16} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  {tooltip}
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
              )}
            </div>
          )}
        </div>
        <select
          value={selectedValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
              {option.recommended ? ' (Recommended)' : ''}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-2`,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium">{label}</label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info size={16} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                {tooltip}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className={layoutClasses[layout]}>
        {normalizedOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          const isDisabled = option.disabled || false;
          
          return (
            <div key={option.value} className="relative group">
              <button
                type="button"
                onClick={() => !isDisabled && handleChange(option.value)}
                disabled={isDisabled}
                className={`w-full px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                  )}
                  {option.recommended && (
                    <span className="text-xs text-purple-600 mt-1 font-medium">
                      ✓ Recommended
                    </span>
                  )}
                  {isDisabled && option.disabledReason && (
                    <span className="text-xs text-red-500 mt-1">{option.disabledReason}</span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TechStackCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  className?: string;
}

export function TechStackCheckbox({
  label,
  checked,
  onChange,
  tooltip,
  className = '',
}: TechStackCheckboxProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-all"
        />
        <span className="text-sm font-medium group-hover:text-purple-600 transition-colors">
          {label}
        </span>
      </label>
      {tooltip && (
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
              {tooltip}
              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TechStackMultiSelectProps {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  tooltip?: string;
  className?: string;
  min?: number;
  max?: number;
}

export function TechStackMultiSelect({
  label,
  options,
  values,
  onChange,
  tooltip,
  className = '',
  min = 0,
  max = options.length,
}: TechStackMultiSelectProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = (option: string) => {
    const newValues = values.includes(option)
      ? values.filter((v) => v !== option)
      : [...values, option];

    if (newValues.length >= min && newValues.length <= max) {
      onChange(newValues);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium">{label}</label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info size={16} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                {tooltip}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            disabled={!values.includes(option) && values.length >= max}
            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
              values.includes(option)
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm scale-105'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {min > 0 && values.length < min && (
        <p className="text-xs text-red-500">Select at least {min} option(s)</p>
      )}
      {values.length >= max && (
        <p className="text-xs text-gray-500">Maximum {max} option(s) selected</p>
      )}
    </div>
  );
}
