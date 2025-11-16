'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { PlatformType } from '@/lib/platforms/types';

interface ProjectNameInputProps {
  value: string;
  onChange: (value: string) => void;
  platform: PlatformType;
  error?: string;
  onAvailabilityChange?: (available: boolean) => void;
  className?: string;
}

export function ProjectNameInput({
  value,
  onChange,
  platform,
  error,
  onAvailabilityChange,
  className = '',
}: ProjectNameInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<'available' | 'taken' | 'unknown'>('unknown');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check name availability with debounce
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setAvailability('unknown');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Validate format first
    if (!/^[a-z0-9-]+$/.test(value)) {
      setAvailability('unknown');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkNameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, platform]);

  const checkNameAvailability = async (name: string) => {
    setIsChecking(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `/api/platforms/${platform}/projects/check-name?name=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        throw new Error('Failed to check name availability');
      }

      const data = await response.json();
      const isAvailable = data.available;

      setAvailability(isAvailable ? 'available' : 'taken');
      
      if (onAvailabilityChange) {
        onAvailabilityChange(isAvailable);
      }

      // Generate suggestions if name is taken
      if (!isAvailable) {
        const generatedSuggestions = generateNameSuggestions(name);
        setSuggestions(generatedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Failed to check name availability:', error);
      setAvailability('unknown');
      setSuggestions([]);
    } finally {
      setIsChecking(false);
    }
  };

  const generateNameSuggestions = (name: string): string[] => {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    
    const suggestions = [
      `${name}-${timestamp}`,
      `${name}-${randomSuffix}`,
      `${name}-v2`,
      `${name}-app`,
    ];

    return [...new Set(suggestions)].filter((s) => s !== name);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 size={18} className="text-gray-400 animate-spin" />;
    }

    if (availability === 'available') {
      return <CheckCircle2 size={18} className="text-green-600" />;
    }

    if (availability === 'taken') {
      return <XCircle size={18} className="text-red-600" />;
    }

    return null;
  };

  const getStatusMessage = () => {
    if (isChecking) {
      return <span className="text-xs text-gray-500">Checking availability...</span>;
    }

    if (availability === 'available') {
      return <span className="text-xs text-green-600">✓ Name is available</span>;
    }

    if (availability === 'taken') {
      return <span className="text-xs text-red-600">✗ Name is already taken</span>;
    }

    return null;
  };

  return (
    <div className={className}>
      <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
        Project Name
      </label>
      
      <div className="relative">
        <input
          id="projectName"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="my-awesome-project"
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error || availability === 'taken'
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : availability === 'available'
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          disabled={isChecking}
        />
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-1 min-h-[20px]">
        {getStatusMessage()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 flex items-start gap-1 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Name Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                This name is already taken
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Try one of these available alternatives:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 bg-white border border-blue-300 text-sm text-blue-700 rounded hover:bg-blue-100 hover:border-blue-400 transition-colors inline-flex items-center gap-1.5 group"
              >
                <span>{suggestion}</span>
                <RefreshCw size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format Help */}
      <p className="mt-2 text-xs text-gray-500">
        Use lowercase letters, numbers, and hyphens only
      </p>
    </div>
  );
}
