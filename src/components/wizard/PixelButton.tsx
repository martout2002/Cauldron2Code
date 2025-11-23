'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}

export function PixelButton({
  children,
  variant = 'primary',
  icon,
  disabled,
  className = '',
  ...props
}: PixelButtonProps) {
  const baseClasses =
    'pixel-button inline-flex items-center justify-center gap-3 px-6 py-3 font-pixelify text-lg transition-all duration-200 ease-in-out';

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white border-2 border-green-800',
    secondary:
      'bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white border-2 border-gray-900',
  };

  const disabledClasses = 'opacity-30 cursor-not-allowed hover:from-green-500 hover:to-green-700';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${disabled ? disabledClasses : 'hover:scale-105 active:scale-95 hover:shadow-pixel-glow'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
