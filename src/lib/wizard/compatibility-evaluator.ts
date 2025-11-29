import { ScaffoldConfig } from '@/types';
import {
  CompatibilityRule,
  CompatibilityResult,
  compatibilityRules,
} from './compatibility-rules';

/**
 * Performance cache for compatibility evaluation results.
 * Maps config hash + step + option to cached results.
 * Requirements: 8.2
 */
const compatibilityCache = new Map<string, CompatibilityResult>();

/**
 * Performance measurement tracking for development mode.
 * Requirements: 8.1
 */
interface PerformanceMetrics {
  evaluationCount: number;
  totalTime: number;
  cacheHits: number;
  cacheMisses: number;
}

const performanceMetrics: PerformanceMetrics = {
  evaluationCount: 0,
  totalTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

/**
 * Creates a hash of the configuration for cache key generation.
 * Only includes fields that affect compatibility rules.
 * Requirements: 8.2
 * 
 * @param config - The scaffold configuration
 * @returns A string hash of the relevant configuration fields
 */
function createConfigHash(config: ScaffoldConfig): string {
  // Only hash fields that affect compatibility rules
  const relevantFields = {
    frontendFramework: config.frontendFramework,
    backendFramework: config.backendFramework,
    database: config.database,
    auth: config.auth,
    projectStructure: config.projectStructure,
    extras: config.extras,
  };
  
  return JSON.stringify(relevantFields);
}

/**
 * Creates a cache key for a specific evaluation.
 * Requirements: 8.2
 * 
 * @param configHash - Hash of the configuration
 * @param stepId - The wizard step identifier
 * @param optionValue - The option value being evaluated
 * @returns A unique cache key
 */
function createCacheKey(
  configHash: string,
  stepId: string,
  optionValue: string
): string {
  return `${configHash}:${stepId}:${optionValue}`;
}

/**
 * Invalidates the compatibility cache.
 * Should be called when configuration changes.
 * Requirements: 8.2
 */
export function invalidateCompatibilityCache(): void {
  compatibilityCache.clear();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Compatibility] Cache invalidated');
  }
}

/**
 * Gets current performance metrics.
 * Only available in development mode.
 * Requirements: 8.1
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics };
}

/**
 * Resets performance metrics.
 * Only available in development mode.
 * Requirements: 8.1
 */
export function resetPerformanceMetrics(): void {
  performanceMetrics.evaluationCount = 0;
  performanceMetrics.totalTime = 0;
  performanceMetrics.cacheHits = 0;
  performanceMetrics.cacheMisses = 0;
}

/**
 * Fallback incompatibility message when rule doesn't provide one.
 * Requirements: Error Handling section
 */
const FALLBACK_INCOMPATIBILITY_MESSAGE =
  'This option is not compatible with your current selections';

/**
 * Logs performance metrics if evaluation time exceeds threshold.
 * Requirements: 8.1
 * 
 * @param evaluationTime - Time taken for evaluation in milliseconds
 * @param stepId - The wizard step identifier
 * @param optionValue - The option value evaluated
 */
function logPerformanceWarning(
  evaluationTime: number,
  stepId: string,
  optionValue: string
): void {
  if (process.env.NODE_ENV === 'development' && evaluationTime > 50) {
    console.warn(
      `[Compatibility] Performance warning: Evaluation for step "${stepId}", option "${optionValue}" took ${evaluationTime.toFixed(2)}ms (threshold: 50ms)`
    );
  }
}

/**
 * Evaluates compatibility of a specific option against the current configuration.
 * 
 * This function checks all compatibility rules that apply to the given step and option,
 * aggregating results to determine if the option should be disabled.
 * 
 * Results are cached based on configuration hash for performance.
 * 
 * Requirements: 2.4, 3.1, 3.4, 8.1, 8.2
 * 
 * @param stepId - The wizard step identifier (e.g., 'backend', 'auth', 'extras')
 * @param optionValue - The option value to evaluate (e.g., 'express', 'supabase')
 * @param config - The current scaffold configuration state
 * @returns CompatibilityResult indicating if the option is compatible and why
 */
export function evaluateCompatibility(
  stepId: string,
  optionValue: string,
  config: ScaffoldConfig
): CompatibilityResult {
  const startTime = performance.now();
  
  // Create cache key
  const configHash = createConfigHash(config);
  const cacheKey = createCacheKey(configHash, stepId, optionValue);
  
  // Check cache first
  const cachedResult = compatibilityCache.get(cacheKey);
  if (cachedResult !== undefined) {
    performanceMetrics.cacheHits++;
    
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      performanceMetrics.evaluationCount++;
      performanceMetrics.totalTime += endTime - startTime;
    }
    
    return cachedResult;
  }
  
  performanceMetrics.cacheMisses++;
  
  let result: CompatibilityResult;
  try {
    // Find all rules that apply to this step and option
    const applicableRules = compatibilityRules.filter(
      (rule) => rule.targetStep === stepId && rule.targetOption === optionValue
    );

    // If no rules apply, the option is compatible
    if (applicableRules.length === 0) {
      result = { isCompatible: true };
    } else {
      // Evaluate all applicable rules
      const incompatibleRules: Array<{
        rule: CompatibilityRule;
        message: string;
      }> = [];

      for (const rule of applicableRules) {
        try {
          // Check if this rule marks the option as incompatible
          if (rule.isIncompatible(config)) {
            let message: string;
            
            try {
              // Try to get the incompatibility message from the rule
              message = rule.getIncompatibilityMessage(config);
              
              // Fallback if message is empty or undefined
              // Requirements: Error Handling section
              if (!message || message.trim() === '') {
                if (process.env.NODE_ENV === 'development') {
                  console.warn(
                    `[Compatibility] Rule "${rule.id}" returned empty message, using fallback`
                  );
                }
                message = FALLBACK_INCOMPATIBILITY_MESSAGE;
              }
            } catch (messageError) {
              // Fail-open: if message generation fails, use fallback
              // Requirements: Error Handling section
              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  `[Compatibility] Rule "${rule.id}" threw an exception generating message:`,
                  messageError
                );
              }
              message = FALLBACK_INCOMPATIBILITY_MESSAGE;
            }
            
            incompatibleRules.push({ rule, message });
          }
        } catch (error) {
          // Fail-open: if a rule throws an exception, log it and treat as compatible
          // Requirements: Error Handling section
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[Compatibility] Rule "${rule.id}" threw an exception during evaluation:`,
              error
            );
          }
          // Continue to next rule without marking as incompatible
        }
      }

      // Rule aggregation: if any rule fails, the option is incompatible
      if (incompatibleRules.length === 0) {
        result = { isCompatible: true };
      } else {
        // Message prioritization: return the first (most relevant) incompatibility message
        // Rules are ordered in the registry by importance, so the first match is most relevant
        const primaryIncompatibility = incompatibleRules[0];
        
        // This should never happen due to the length check above, but TypeScript needs assurance
        if (!primaryIncompatibility) {
          result = { isCompatible: true };
        } else {
          result = {
            isCompatible: false,
            reason: primaryIncompatibility.message,
          };
        }
      }
    }
  } catch (error) {
    // Fail-open: if the entire evaluation fails, log and treat as compatible
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[Compatibility] Evaluation failed for step "${stepId}", option "${optionValue}":`,
        error
      );
    }
    result = { isCompatible: true };
  }
  
  // Cache the result
  compatibilityCache.set(cacheKey, result);
  
  // Performance tracking
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const evaluationTime = endTime - startTime;
    
    performanceMetrics.evaluationCount++;
    performanceMetrics.totalTime += evaluationTime;
    
    logPerformanceWarning(evaluationTime, stepId, optionValue);
  }
  
  return result;
}

/**
 * Step-level memoization cache.
 * Maps config hash + step to evaluation results for all options in that step.
 * Requirements: 8.4
 */
const stepLevelCache = new Map<string, Map<string, CompatibilityResult>>();

/**
 * Creates a cache key for step-level evaluation.
 * Requirements: 8.4
 * 
 * @param configHash - Hash of the configuration
 * @param stepId - The wizard step identifier
 * @returns A unique cache key for the step
 */
function createStepCacheKey(configHash: string, stepId: string): string {
  return `${configHash}:${stepId}`;
}

/**
 * Invalidates the step-level cache.
 * Should be called when configuration changes.
 * Requirements: 8.4
 */
export function invalidateStepCache(): void {
  stepLevelCache.clear();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Compatibility] Step-level cache invalidated');
  }
}

/**
 * Invalidates all caches (both option-level and step-level).
 * This is the main cache invalidation function to call on config changes.
 * Requirements: 8.2, 8.4
 */
export function invalidateAllCaches(): void {
  invalidateCompatibilityCache();
  invalidateStepCache();
}

/**
 * Evaluates compatibility for multiple options in a step.
 * 
 * This is a convenience function that evaluates compatibility for all options
 * in a step at once, useful for batch processing and precomputation.
 * Results are memoized at the step level for performance.
 * 
 * Requirements: 8.4
 * 
 * @param stepId - The wizard step identifier
 * @param optionValues - Array of option values to evaluate
 * @param config - The current scaffold configuration state
 * @returns Map of option values to their compatibility results
 */
export function evaluateMultipleOptions(
  stepId: string,
  optionValues: string[],
  config: ScaffoldConfig
): Map<string, CompatibilityResult> {
  const startTime = performance.now();
  
  // Create step cache key
  const configHash = createConfigHash(config);
  const stepCacheKey = createStepCacheKey(configHash, stepId);
  
  // Check step-level cache
  const cachedStepResults = stepLevelCache.get(stepCacheKey);
  if (cachedStepResults !== undefined) {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      console.log(
        `[Compatibility] Step-level cache hit for "${stepId}" (${(endTime - startTime).toFixed(2)}ms)`
      );
    }
    return new Map(cachedStepResults);
  }
  
  // Evaluate all options
  const results = new Map<string, CompatibilityResult>();

  for (const optionValue of optionValues) {
    try {
      results.set(optionValue, evaluateCompatibility(stepId, optionValue, config));
    } catch (error) {
      // Fail-open: if evaluation fails for an option, treat as compatible
      // Requirements: Error Handling section
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[Compatibility] Failed to evaluate option "${optionValue}" in step "${stepId}":`,
          error
        );
      }
      results.set(optionValue, { isCompatible: true });
    }
  }
  
  // Cache the step-level results
  stepLevelCache.set(stepCacheKey, new Map(results));
  
  // Performance tracking
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const evaluationTime = endTime - startTime;
    
    console.log(
      `[Compatibility] Step-level evaluation for "${stepId}" completed in ${evaluationTime.toFixed(2)}ms (${optionValues.length} options)`
    );
    
    if (evaluationTime > 100) {
      console.warn(
        `[Compatibility] Performance warning: Step-level precomputation for "${stepId}" took ${evaluationTime.toFixed(2)}ms (threshold: 100ms)`
      );
    }
  }

  return results;
}

/**
 * Checks if the current configuration has any incompatibilities.
 * 
 * This function is useful for validation before proceeding to generation.
 * Note: This only checks if currently selected options would be incompatible
 * if re-evaluated, not if there are disabled options available.
 * 
 * @param config - The current scaffold configuration state
 * @returns true if any currently selected options are incompatible
 */
export function hasIncompatibilities(config: ScaffoldConfig): boolean {
  try {
    // Check each configuration field against rules
    const fieldsToCheck: Array<{
      stepId: string;
      value: string | boolean | string[];
    }> = [
      { stepId: 'frontend', value: config.frontendFramework },
      { stepId: 'backend', value: config.backendFramework },
      { stepId: 'database', value: config.database },
      { stepId: 'auth', value: config.auth },
    ];

    for (const field of fieldsToCheck) {
      if (typeof field.value === 'string') {
        try {
          const result = evaluateCompatibility(field.stepId, field.value, config);
          if (!result.isCompatible) {
            return true;
          }
        } catch (error) {
          // Fail-open: if evaluation fails for a field, continue checking others
          // Requirements: Error Handling section
          if (process.env.NODE_ENV === 'development') {
            console.error(
              `[Compatibility] Failed to check field "${field.stepId}":`,
              error
            );
          }
        }
      }
    }

    // Check extras (which are boolean flags)
    if (config.extras.redis) {
      try {
        const result = evaluateCompatibility('extras', 'redis', config);
        if (!result.isCompatible) {
          return true;
        }
      } catch (error) {
        // Fail-open: if evaluation fails for extras, continue
        // Requirements: Error Handling section
        if (process.env.NODE_ENV === 'development') {
          console.error('[Compatibility] Failed to check extras:', error);
        }
      }
    }

    return false;
  } catch (error) {
    // Fail-open: if the entire check fails, assume no incompatibilities
    // Requirements: Error Handling section
    if (process.env.NODE_ENV === 'development') {
      console.error('[Compatibility] Failed to check for incompatibilities:', error);
    }
    return false;
  }
}
