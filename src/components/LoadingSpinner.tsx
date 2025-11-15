'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
  subtext?: string;
}

export function LoadingOverlay({ text = 'Loading...', subtext }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{text}</p>
            {subtext && (
              <p className="text-sm text-gray-600 mt-2">{subtext}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text, className = '' }: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}
