import { useMemo, useEffect, useRef } from 'react';
import { useConfigStore } from '@/lib/store/config-store';
import { ScaffoldConfig } from '@/types';
import { StepOption } from './wizard-steps';
import {
  evaluateCompatibility,
  evaluateMultipleOptions,
  invalidateAllCaches,
} from './compatibility-evaluator';
import { CompatibilityResult } from './compatibility-rules';

/**
 * Enhanced option interface with compatibility information
 * Requirements: 1.1, 1.2, 2.1
 */
export interface OptionWithCompatibility extends StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  
  // Compatibility state
  isDisabled: boolean;
  incompatibilityReason?: string;
}

/**
 * Result interface for the useCompatibility hook
 * Requirements: 1.3, 1.4, 5.5, 7.5
 */
export interface UseCompatibilityResult {
  /**
   * Check if a specific option is compatible with the current configuration
   * Requirements: 3.1, 3.3
   */
  isOptionCompatible: (stepId: string, optionValue: string) => CompatibilityResult;
  
  /**
   * Get all options for a step with compatibility information
   * Requirements: 1.1, 1.2, 2.1
   */
  getCompatibleOptions: (stepId: string, options: StepOption[]) => OptionWithCompatibility[];
  
  /**
   * Check if the current configuration has any incompatibilities
   * Requirements: 1.4
   */
  hasIncompatibilities: () => boolean;
}

/**
 * React hook for checking option compatibility in the wizard
 * 
 * This hook provides functions to evaluate compatibility of options based on
 * the current configuration state. It automatically subscribes to config changes
 * and invalidates caches when the configuration updates.
 * 
 * Requirements: 1.3, 1.4, 5.5, 7.5
 * 
 * @example
 * ```tsx
 * function WizardStep({ step, config }) {
 *   const { getCompatibleOptions } = useCompatibility();
 *   
 *   // Get options with compatibility information
 *   const enhancedOptions = getCompatibleOptions(step.id, step.options);
 *   
 *   return (
 *     <OptionGrid
 *       options={enhancedOptions}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 * 
 * @returns UseCompatibilityResult with compatibility checking functions
 */
export function useCompatibility(): UseCompatibilityResult {
  // Subscribe to config store to get current configuration
  const config = useConfigStore((state) => state.config);
  
  // Track previous config to detect changes
  const prevConfigRef = useRef<ScaffoldConfig>(config);
  
  // Invalidate caches when configuration changes
  // Requirements: 1.3, 5.5, 7.5
  useEffect(() => {
    const prevConfig = prevConfigRef.current;
    
    // Check if any relevant fields changed
    const hasChanged =
      prevConfig.frontendFramework !== config.frontendFramework ||
      prevConfig.backendFramework !== config.backendFramework ||
      prevConfig.database !== config.database ||
      prevConfig.auth !== config.auth ||
      prevConfig.projectStructure !== config.projectStructure ||
      JSON.stringify(prevConfig.extras) !== JSON.stringify(config.extras);
    
    if (hasChanged) {
      // Invalidate all caches when configuration changes
      invalidateAllCaches();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useCompatibility] Configuration changed, caches invalidated');
      }
    }
    
    // Update previous config reference
    prevConfigRef.current = config;
  }, [config]);
  
  /**
   * Check if a specific option is compatible
   * Requirements: 3.1, 3.3
   */
  const isOptionCompatible = useMemo(() => {
    return (stepId: string, optionValue: string): CompatibilityResult => {
      try {
        return evaluateCompatibility(stepId, optionValue, config);
      } catch (error) {
        // Fail-open: if evaluation fails completely, treat as compatible
        // Requirements: Error Handling section
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `[useCompatibility] Failed to evaluate compatibility for step "${stepId}", option "${optionValue}":`,
            error
          );
        }
        return { isCompatible: true };
      }
    };
  }, [config]);
  
  /**
   * Get all options for a step with compatibility information
   * Requirements: 1.1, 1.2, 2.1
   */
  const getCompatibleOptions = useMemo(() => {
    return (stepId: string, options: StepOption[]): OptionWithCompatibility[] => {
      try {
        // Extract option values for batch evaluation
        const optionValues = options.map((opt) => opt.value);
        
        // Evaluate all options at once for performance
        // Requirements: 8.4
        const results = evaluateMultipleOptions(stepId, optionValues, config);
        
        // Map options to enhanced options with compatibility state
        return options.map((option): OptionWithCompatibility => {
          const result = results.get(option.value);
          
          return {
            ...option,
            isDisabled: result ? !result.isCompatible : false,
            incompatibilityReason: result?.reason,
          };
        });
      } catch (error) {
        // Fail-open: if batch evaluation fails, return all options as enabled
        // Requirements: Error Handling section
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `[useCompatibility] Failed to get compatible options for step "${stepId}":`,
            error
          );
        }
        
        // Return options without compatibility information (all enabled)
        return options.map((option): OptionWithCompatibility => ({
          ...option,
          isDisabled: false,
        }));
      }
    };
  }, [config]);
  
  /**
   * Check if current configuration has any incompatibilities
   * Requirements: 1.4
   */
  const hasIncompatibilities = useMemo(() => {
    return (): boolean => {
      try {
        // Check frontend framework
        const frontendResult = evaluateCompatibility(
          'frontend',
          config.frontendFramework,
          config
        );
        if (!frontendResult.isCompatible) return true;
        
        // Check backend framework
        const backendResult = evaluateCompatibility(
          'backend',
          config.backendFramework,
          config
        );
        if (!backendResult.isCompatible) return true;
        
        // Check database
        if (config.database !== 'none') {
          const databaseResult = evaluateCompatibility(
            'database',
            config.database,
            config
          );
          if (!databaseResult.isCompatible) return true;
        }
        
        // Check auth
        if (config.auth !== 'none') {
          const authResult = evaluateCompatibility('auth', config.auth, config);
          if (!authResult.isCompatible) return true;
        }
        
        // Check extras
        if (config.extras.redis) {
          const redisResult = evaluateCompatibility('extras', 'redis', config);
          if (!redisResult.isCompatible) return true;
        }
        
        return false;
      } catch (error) {
        // Fail-open: if checking fails, assume no incompatibilities
        // Requirements: Error Handling section
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[useCompatibility] Failed to check for incompatibilities:',
            error
          );
        }
        return false;
      }
    };
  }, [config]);
  
  return {
    isOptionCompatible,
    getCompatibleOptions,
    hasIncompatibilities,
  };
}
