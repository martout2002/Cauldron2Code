'use client';

/**
 * SkipLink Component
 * 
 * Provides a skip navigation link for keyboard users to bypass repetitive content
 * and jump directly to the main content. This is a critical accessibility feature
 * for users who navigate with keyboards or screen readers.
 */

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all"
      aria-label={label}
    >
      {label}
    </a>
  );
}
