'use client';

import { Zap, BookOpen } from 'lucide-react';

interface ViewModeToggleProps {
  mode: 'quick-start' | 'detailed';
  onChange: (mode: 'quick-start' | 'detailed') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div 
      className="inline-flex items-center gap-1 p-1 bg-[rgba(40,40,50,0.8)] rounded-lg border-2 border-[#8b5cf6]"
      role="group"
      aria-label="View mode selection"
    >
      {/* Quick Start Button */}
      <button
        onClick={() => onChange('quick-start')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold font-[family-name:var(--font-pixelify)] transition-all focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 ${
          mode === 'quick-start'
            ? 'bg-[#b4ff64] text-[#0a0e1a] shadow-[0_2px_0_#8fcc4f]'
            : 'text-gray-300 hover:text-white hover:bg-[rgba(180,255,100,0.1)]'
        }`}
        aria-pressed={mode === 'quick-start'}
        aria-label="Switch to Quick Start mode - shows essential commands only"
        role="radio"
        aria-checked={mode === 'quick-start'}
      >
        <Zap size={16} aria-hidden="true" />
        <span>Quick Start</span>
      </button>

      {/* Detailed Guide Button */}
      <button
        onClick={() => onChange('detailed')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold font-[family-name:var(--font-pixelify)] transition-all focus:outline-none focus:ring-2 focus:ring-[#b4ff64] focus:ring-offset-2 ${
          mode === 'detailed'
            ? 'bg-[#b4ff64] text-[#0a0e1a] shadow-[0_2px_0_#8fcc4f]'
            : 'text-gray-300 hover:text-white hover:bg-[rgba(180,255,100,0.1)]'
        }`}
        aria-pressed={mode === 'detailed'}
        aria-label="Switch to Detailed Guide mode - includes explanations and troubleshooting"
        role="radio"
        aria-checked={mode === 'detailed'}
      >
        <BookOpen size={16} aria-hidden="true" />
        <span>Detailed Guide</span>
      </button>
    </div>
  );
}
