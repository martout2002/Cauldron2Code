'use client';

import { AlertCircle, AlertTriangle, X, Info } from 'lucide-react';
import type { ValidationError, ValidationWarning } from '@/types';

interface ValidationAlertProps {
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  onDismiss?: () => void;
  className?: string;
}

export function ValidationAlert({
  errors = [],
  warnings = [],
  onDismiss,
  className = '',
}: ValidationAlertProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className={`space-y-2 md:space-y-3 ${className}`}>
      {/* Errors */}
      {hasErrors && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <h4 className="font-semibold text-sm md:text-base text-red-900">
                  {errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Found
                </h4>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-red-600 hover:text-red-800 transition-colors touch-manipulation"
                    aria-label="Dismiss"
                  >
                    <X size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>
                )}
              </div>
              <ul className="space-y-1.5 md:space-y-2">
                {errors.map((error, index) => (
                  <ValidationItem
                    key={`error-${error.ruleId}-${index}`}
                    message={error.message}
                    field={error.field}
                    severity="error"
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <h4 className="font-semibold text-sm md:text-base text-yellow-900">
                  {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
                </h4>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-yellow-600 hover:text-yellow-800 transition-colors touch-manipulation"
                    aria-label="Dismiss"
                  >
                    <X size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>
                )}
              </div>
              <ul className="space-y-1.5 md:space-y-2">
                {warnings.map((warning, index) => (
                  <ValidationItem
                    key={`warning-${warning.ruleId}-${index}`}
                    message={warning.message}
                    field={warning.field}
                    severity="warning"
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ValidationItemProps {
  message: string;
  field: string;
  severity: 'error' | 'warning';
}

function ValidationItem({ message, field, severity }: ValidationItemProps) {
  const textColor = severity === 'error' ? 'text-red-800' : 'text-yellow-800';
  const fieldColor = severity === 'error' ? 'text-red-600' : 'text-yellow-600';

  return (
    <li className={`text-xs md:text-sm ${textColor}`}>
      <span className={`font-medium ${fieldColor}`}>{field}:</span> {message}
    </li>
  );
}

interface ValidationSummaryProps {
  errorCount: number;
  warningCount: number;
  className?: string;
}

export function ValidationSummary({
  errorCount,
  warningCount,
  className = '',
}: ValidationSummaryProps) {
  if (errorCount === 0 && warningCount === 0) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 ${className}`}
      >
        <Info size={16} />
        <span>Configuration is valid</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      {errorCount > 0 && (
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <span className="font-medium">
            {errorCount} {errorCount === 1 ? 'error' : 'errors'}
          </span>
        </div>
      )}
      {warningCount > 0 && (
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle size={16} />
          <span className="font-medium">
            {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
          </span>
        </div>
      )}
    </div>
  );
}

interface InlineValidationProps {
  message: string;
  severity: 'error' | 'warning';
  className?: string;
}

export function InlineValidation({
  message,
  severity,
  className = '',
}: InlineValidationProps) {
  const Icon = severity === 'error' ? AlertCircle : AlertTriangle;
  const colorClasses =
    severity === 'error'
      ? 'text-red-700 bg-red-50 border-red-200'
      : 'text-yellow-700 bg-yellow-50 border-yellow-200';

  return (
    <div
      className={`flex items-start gap-2 text-sm border rounded-md px-3 py-2 ${colorClasses} ${className}`}
    >
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

interface ValidationGuidanceProps {
  title: string;
  description: string;
  suggestions: string[];
  severity: 'error' | 'warning';
  className?: string;
}

export function ValidationGuidance({
  title,
  description,
  suggestions,
  severity,
  className = '',
}: ValidationGuidanceProps) {
  const Icon = severity === 'error' ? AlertCircle : AlertTriangle;
  const colorClasses =
    severity === 'error'
      ? 'bg-red-50 border-red-200 text-red-900'
      : 'bg-yellow-50 border-yellow-200 text-yellow-900';
  const iconColor = severity === 'error' ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`shrink-0 mt-0.5 ${iconColor}`} size={20} />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm mb-3 opacity-90">{description}</p>
          {suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Suggestions:</p>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="opacity-60">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
