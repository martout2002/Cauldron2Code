'use client';

import { Zap, BookOpen } from 'lucide-react';

interface ViewModeToggleProps {
  mode: 'quick-start' | 'detailed';
  onChange: (mode: 'quick-start' | 'detailed') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div 
      className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-zinc-700"
      role="group"
      aria-label="View mode selection"
    >
      {/* Quick Start Button */}
      <button
        onClick={() => onChange('quick-start')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          mode === 'quick-start'
            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          mode === 'detailed'
            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
