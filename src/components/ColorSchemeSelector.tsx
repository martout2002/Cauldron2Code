'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { COLOR_SCHEMES } from '@/lib/color-schemes';
import type { ColorSchemeConfig } from '@/types';

interface ColorSchemeSelectorProps {
  value: string;
  onChange: (scheme: string) => void;
  className?: string;
}

export function ColorSchemeSelector({
  value,
  onChange,
  className = '',
}: ColorSchemeSelectorProps) {
  const [previewScheme, setPreviewScheme] = useState<string | null>(null);

  const getScheme = (schemeName: string): ColorSchemeConfig => {
    return (COLOR_SCHEMES[schemeName] || COLOR_SCHEMES.purple) as ColorSchemeConfig;
  };

  const currentScheme = getScheme(previewScheme || value);

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      <div>
        <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2" id="color-scheme-label">
          Color Scheme
        </h3>
        <p className="text-xs md:text-sm text-gray-600">
          Choose a color theme for your generated project
        </p>
      </div>

      {/* Color Scheme Cards */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" 
        role="radiogroup" 
        aria-labelledby="color-scheme-label"
      >
        {Object.values(COLOR_SCHEMES).map((scheme) => (
          <ColorSchemeCard
            key={scheme.name}
            scheme={scheme}
            isSelected={value === scheme.name}
            onSelect={() => onChange(scheme.name)}
            onHover={() => setPreviewScheme(scheme.name)}
            onLeave={() => setPreviewScheme(null)}
          />
        ))}
      </div>

      {/* Live Preview */}
      <div className="border rounded-lg p-4 md:p-6 bg-white">
        <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">Preview</h4>
        <div
          className="rounded-lg p-4 md:p-6 transition-all duration-300"
          style={{ backgroundColor: currentScheme.preview.background }}
        >
          <div className="space-y-3 md:space-y-4">
            <h5
              className="text-xl md:text-2xl font-bold"
              style={{ color: currentScheme.preview.text }}
            >
              {currentScheme.displayName} Theme
            </h5>
            <p
              className="text-xs md:text-sm"
              style={{ color: currentScheme.preview.text, opacity: 0.8 }}
            >
              {currentScheme.description}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-md font-medium text-xs md:text-sm transition-all touch-manipulation"
                style={{
                  backgroundColor: currentScheme.preview.primary,
                  color: currentScheme.preview.background,
                }}
              >
                Primary Button
              </button>
              <button
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-md font-medium text-xs md:text-sm transition-all touch-manipulation"
                style={{
                  backgroundColor: currentScheme.preview.secondary,
                  color: currentScheme.preview.background,
                }}
              >
                Secondary Button
              </button>
              <button
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-md font-medium text-xs md:text-sm transition-all border-2 touch-manipulation"
                style={{
                  borderColor: currentScheme.preview.accent,
                  color: currentScheme.preview.text,
                }}
              >
                Accent Button
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 md:mt-4">
              <ColorSwatch
                color={currentScheme.preview.primary}
                label="Primary"
              />
              <ColorSwatch
                color={currentScheme.preview.secondary}
                label="Secondary"
              />
              <ColorSwatch
                color={currentScheme.preview.accent}
                label="Accent"
              />
              <ColorSwatch
                color={currentScheme.preview.background}
                label="Background"
                className="hidden sm:flex"
              />
              <ColorSwatch
                color={currentScheme.preview.text}
                label="Text"
                className="hidden sm:flex"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ColorSchemeCardProps {
  scheme: ColorSchemeConfig;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function ColorSchemeCard({
  scheme,
  isSelected,
  onSelect,
  onHover,
  onLeave,
}: ColorSchemeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${scheme.displayName} color scheme: ${scheme.description}`}
      className={`relative p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation ${
        isSelected
          ? 'border-purple-500 shadow-lg md:scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md active:border-gray-400'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Check size={14} className="md:w-4 md:h-4 text-white" />
        </div>
      )}

      <div className="space-y-2 md:space-y-3">
        <div>
          <h4 className="font-semibold text-sm md:text-base">{scheme.displayName}</h4>
          <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">{scheme.description}</p>
        </div>

        {/* Color Palette Preview */}
        <div className="flex gap-1.5 md:gap-2">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-md border"
            style={{ backgroundColor: scheme.preview.primary }}
            title="Primary"
          />
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-md border"
            style={{ backgroundColor: scheme.preview.secondary }}
            title="Secondary"
          />
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-md border"
            style={{ backgroundColor: scheme.preview.accent }}
            title="Accent"
          />
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-md border"
            style={{ backgroundColor: scheme.preview.background }}
            title="Background"
          />
        </div>
      </div>
    </button>
  );
}

interface ColorSwatchProps {
  color: string;
  label: string;
  className?: string;
}

function ColorSwatch({ color, label, className = '' }: ColorSwatchProps) {
  return (
    <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${className}`}>
      <div
        className="w-full h-8 md:h-10 rounded border"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] md:text-xs text-gray-600">{label}</span>
      <span className="text-[9px] md:text-xs font-mono text-gray-500">{color}</span>
    </div>
  );
}
