'use client';

import { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { EnvironmentVariableHelp } from './EnvironmentVariableHelp';
import type { EnvironmentVariable } from '@/lib/deployment/environment-detector';
import { EnvironmentVariableValidator } from '@/lib/deployment/environment-validator';

interface EnvironmentVariableInputProps {
  envVar: EnvironmentVariable;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * EnvironmentVariableInput Component
 *
 * Input component for environment variables with validation, masking, and guidance.
 * Displays description, example values, and validation errors.
 */
export function EnvironmentVariableInput({
  envVar,
  onChange,
  error,
  disabled = false,
}: EnvironmentVariableInputProps) {
  const [value, setValue] = useState(envVar.value || '');
  const [showValue, setShowValue] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(
    error
  );
  const validator = new EnvironmentVariableValidator();

  // Update validation error when external error changes
  useEffect(() => {
    setValidationError(error);
  }, [error]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange(newValue);

    // Validate on change
    const result = validator.validate(envVar, newValue);
    setValidationError(result.isValid ? undefined : result.error);
  };

  const handleBlur = () => {
    // Validate on blur
    const result = validator.validate(envVar, value);
    setValidationError(result.isValid ? undefined : result.error);
  };

  const toggleShowValue = () => {
    setShowValue(!showValue);
  };

  const inputType = envVar.sensitive && !showValue ? 'password' : 'text';

  return (
    <div className="space-y-2">
      {/* Label with required indicator and tooltip */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={envVar.key}
          className="block text-sm font-medium text-gray-700"
        >
          {envVar.key}
          {envVar.required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* Info tooltip */}
        <Tooltip content={envVar.description} position="top">
          <div className="flex items-center justify-center w-4 h-4 text-xs text-gray-500 border border-gray-300 rounded-full cursor-help hover:bg-gray-100">
            ?
          </div>
        </Tooltip>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600">{envVar.description}</p>

      {/* Input field with show/hide toggle for sensitive values */}
      <div className="relative">
        <input
          id={envVar.key}
          type={inputType}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={envVar.example || `Enter ${envVar.key}`}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            validationError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          aria-invalid={!!validationError}
          aria-describedby={
            validationError
              ? `${envVar.key}-error`
              : envVar.example
              ? `${envVar.key}-example`
              : undefined
          }
        />

        {/* Show/Hide toggle for sensitive values */}
        {envVar.sensitive && value && (
          <button
            type="button"
            onClick={toggleShowValue}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showValue ? 'Hide value' : 'Show value'}
          >
            {showValue ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Example value */}
      {envVar.example && !validationError && (
        <p
          id={`${envVar.key}-example`}
          className="text-xs text-gray-500 italic"
        >
          Example: {envVar.example}
        </p>
      )}

      {/* Validation error */}
      {validationError && (
        <div
          id={`${envVar.key}-error`}
          className="flex items-start gap-2 text-sm text-red-600"
          role="alert"
        >
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {/* Optional indicator */}
      {!envVar.required && (
        <p className="text-xs text-gray-500">Optional</p>
      )}

      {/* Help Link */}
      <EnvironmentVariableHelp
        envVarKey={envVar.key}
        isRequired={envVar.required}
      />
    </div>
  );
}
