import { ScaffoldConfig } from '@/types';
import { PlatformId } from '@/types/deployment-guides';

/**
 * GuideUrlGenerator
 * 
 * Utility for generating shareable, bookmarkable URLs for deployment guides.
 * Encodes scaffold configuration in URL parameters to ensure guides can be
 * accessed directly via URL without requiring local storage.
 * 
 * Requirements: 10.1, 10.2
 */

const STORAGE_KEY = 'deployment-guide-configs';

/**
 * Generate a unique config ID and store the configuration
 * 
 * @param config - The scaffold configuration
 * @returns Unique configuration ID
 * 
 * Requirement 10.1: Provide unique URL for deployment guide
 * Requirement 10.2: Guide URL displays same guide with same configuration context
 */
export function generateConfigId(config: ScaffoldConfig): string {
  // Generate a unique ID based on timestamp and random string
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const configId = `${timestamp}-${random}`;

  // Store the configuration in localStorage for retrieval
  storeConfig(configId, config);

  return configId;
}

/**
 * Store a scaffold configuration with its ID
 * 
 * @param configId - Unique configuration identifier
 * @param config - The scaffold configuration to store
 */
export function storeConfig(configId: string, config: ScaffoldConfig): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const configs = stored ? JSON.parse(stored) : {};
    
    configs[configId] = {
      config,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to store config:', error);
  }
}

/**
 * Retrieve a scaffold configuration by its ID
 * 
 * @param configId - Unique configuration identifier
 * @returns The scaffold configuration or null if not found
 * 
 * Requirement 10.2: Bookmarked/shared URL displays same guide
 */
export function getConfigById(configId: string): ScaffoldConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const configs = JSON.parse(stored);
    const entry = configs[configId];
    
    return entry ? entry.config : null;
  } catch (error) {
    console.error('Failed to retrieve config:', error);
    return null;
  }
}

/**
 * Generate a complete guide URL
 * 
 * @param platformId - The deployment platform ID
 * @param configId - The configuration ID
 * @returns Complete URL path for the guide
 * 
 * Requirement 10.1: Unique URL for guide
 */
export function generateGuideUrl(platformId: PlatformId, configId: string): string {
  return `/guides/${platformId}/${configId}`;
}

/**
 * Generate a guide URL from a platform and config
 * 
 * @param platformId - The deployment platform ID
 * @param config - The scaffold configuration
 * @returns Complete URL path for the guide
 * 
 * Requirement 10.1: Unique URL for guide
 * Requirement 10.2: URLs are bookmarkable and shareable
 */
export function createGuideUrl(platformId: PlatformId, config: ScaffoldConfig): string {
  const configId = generateConfigId(config);
  return generateGuideUrl(platformId, configId);
}

/**
 * Clean up old configurations (older than 30 days)
 * This helps prevent localStorage from growing indefinitely
 */
export function cleanupOldConfigs(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const configs = JSON.parse(stored);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const cleaned = Object.entries(configs).reduce((acc, [id, entry]: [string, any]) => {
      const createdAt = new Date(entry.createdAt).getTime();
      if (createdAt > thirtyDaysAgo) {
        acc[id] = entry;
      }
      return acc;
    }, {} as Record<string, any>);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error('Failed to cleanup old configs:', error);
  }
}

/**
 * Encode scaffold config as URL-safe base64 string
 * This is an alternative approach for embedding config directly in URL
 * 
 * @param config - The scaffold configuration
 * @returns Base64-encoded configuration string
 */
export function encodeConfigToUrl(config: ScaffoldConfig): string {
  try {
    const json = JSON.stringify(config);
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error('Failed to encode config:', error);
    return '';
  }
}

/**
 * Decode scaffold config from URL-safe base64 string
 * 
 * @param encoded - Base64-encoded configuration string
 * @returns The scaffold configuration or null if decoding fails
 */
export function decodeConfigFromUrl(encoded: string): ScaffoldConfig | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode config:', error);
    return null;
  }
}
