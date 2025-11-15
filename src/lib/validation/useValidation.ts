'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ScaffoldConfig, ValidationResult } from '@/types';
import { validateConfig } from './validator';

// Simple cache for validation results
// Key: stringified config, Value: validation result
const validationCache = new Map<string, ValidationResult>();
const MAX_CACHE_SIZE = 50;

/**
 * Generate a cache key from config
 * Only includes fields that affect validation
 */
function getCacheKey(config: ScaffoldConfig): string {
  const relevantFields = {
    framework: config.framework,
    auth: config.auth,
    database: config.database,
    api: config.api,
    deployment: config.deployment,
    aiTemplate: config.aiTemplate,
  };
  return JSON.stringify(relevantFields);
}

/**
 * Custom hook for real-time validation with debouncing and caching
 * Ensures validation runs within 100ms of config changes
 * Caches results to avoid redundant validation
 */
export function useValidation(config: ScaffoldConfig, debounceMs = 100) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runValidation = useCallback((configToValidate: ScaffoldConfig) => {
    setIsValidating(true);
    
    // Check cache first
    const cacheKey = getCacheKey(configToValidate);
    const cachedResult = validationCache.get(cacheKey);
    
    if (cachedResult) {
      // Cache hit - return immediately
      setValidationResult(cachedResult);
      setIsValidating(false);
      return;
    }
    
    // Cache miss - run validation
    const result = validateConfig(configToValidate);
    
    // Store in cache
    validationCache.set(cacheKey, result);
    
    // Limit cache size (LRU-like behavior)
    if (validationCache.size > MAX_CACHE_SIZE) {
      const firstKey = validationCache.keys().next().value;
      if (firstKey) {
        validationCache.delete(firstKey);
      }
    }
    
    setValidationResult(result);
    setIsValidating(false);
  }, []);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced validation
    timeoutRef.current = setTimeout(() => {
      runValidation(config);
    }, debounceMs);

    // Cleanup on unmount or config change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config, debounceMs, runValidation]);

  return {
    validationResult,
    isValidating,
    revalidate: () => runValidation(config),
  };
}
