/**
 * File Filter for Monorepo Deployments
 * Handles filtering of files for individual services in a monorepo
 */

import type { GeneratedFile, DeploymentService } from '@/lib/platforms/types';

/**
 * Configuration for file filtering
 */
export interface FileFilterConfig {
  includeSharedPackages: boolean;
  includeRootConfig: boolean;
  customIncludes?: string[]; // Additional patterns to include
  customExcludes?: string[]; // Patterns to exclude
}

/**
 * Default file filter configuration
 */
const DEFAULT_CONFIG: FileFilterConfig = {
  includeSharedPackages: true,
  includeRootConfig: true,
};

/**
 * Root configuration files that should be included in all service deployments
 */
const ROOT_CONFIG_FILES = [
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'turbo.json',
  'tsconfig.json',
  'tsconfig.base.json',
  '.gitignore',
  '.env.example',
  '.npmrc',
  '.nvmrc',
  'README.md',
];

/**
 * Shared package prefixes in a monorepo
 */
const SHARED_PREFIXES = [
  'packages/',
  'libs/',
  'shared/',
];

/**
 * FileFilter handles filtering of generated files for specific services
 * in a monorepo deployment
 */
export class FileFilter {
  private config: FileFilterConfig;

  constructor(config: Partial<FileFilterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Filter files for a specific service
   * @param service - Service to filter files for
   * @param allFiles - All generated files
   * @returns Filtered files for the service
   */
  filterForService(
    service: DeploymentService,
    allFiles: GeneratedFile[]
  ): GeneratedFile[] {
    return allFiles.filter((file) => this.shouldIncludeFile(file, service));
  }

  /**
   * Filter files for multiple services
   * @param services - Services to filter files for
   * @param allFiles - All generated files
   * @returns Map of service name to filtered files
   */
  filterForServices(
    services: DeploymentService[],
    allFiles: GeneratedFile[]
  ): Map<string, GeneratedFile[]> {
    const result = new Map<string, GeneratedFile[]>();

    for (const service of services) {
      result.set(service.name, this.filterForService(service, allFiles));
    }

    return result;
  }

  /**
   * Determine if a file should be included for a service
   * @param file - File to check
   * @param service - Service being deployed
   * @returns True if file should be included
   */
  private shouldIncludeFile(file: GeneratedFile, service: DeploymentService): boolean {
    const path = file.path;

    // Check custom excludes first
    if (this.config.customExcludes) {
      for (const pattern of this.config.customExcludes) {
        if (this.matchesPattern(path, pattern)) {
          return false;
        }
      }
    }

    // Include service-specific files
    const servicePrefix = `apps/${service.name}/`;
    if (path.startsWith(servicePrefix)) {
      return true;
    }

    // Include shared packages if configured
    if (this.config.includeSharedPackages) {
      for (const prefix of SHARED_PREFIXES) {
        if (path.startsWith(prefix)) {
          return true;
        }
      }
    }

    // Include root configuration files if configured
    if (this.config.includeRootConfig) {
      if (ROOT_CONFIG_FILES.includes(path)) {
        return true;
      }
    }

    // Check custom includes
    if (this.config.customIncludes) {
      for (const pattern of this.config.customIncludes) {
        if (this.matchesPattern(path, pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Match a path against a pattern (supports wildcards)
   * @param path - File path
   * @param pattern - Pattern to match (supports * and **)
   * @returns True if path matches pattern
   */
  private matchesPattern(path: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Get statistics about filtered files
   * @param service - Service
   * @param allFiles - All files
   * @returns Statistics object
   */
  getFilterStats(
    service: DeploymentService,
    allFiles: GeneratedFile[]
  ): FileFilterStats {
    const filtered = this.filterForService(service, allFiles);
    const serviceFiles = filtered.filter((f) =>
      f.path.startsWith(`apps/${service.name}/`)
    );
    const sharedFiles = filtered.filter((f) =>
      SHARED_PREFIXES.some((prefix) => f.path.startsWith(prefix))
    );
    const configFiles = filtered.filter((f) => ROOT_CONFIG_FILES.includes(f.path));

    return {
      totalFiles: filtered.length,
      serviceFiles: serviceFiles.length,
      sharedFiles: sharedFiles.length,
      configFiles: configFiles.length,
      totalSize: filtered.reduce((sum, f) => sum + f.content.length, 0),
    };
  }

  /**
   * Validate that a service has required files
   * @param service - Service to validate
   * @param files - Filtered files for the service
   * @returns Validation result
   */
  validateServiceFiles(
    service: DeploymentService,
    files: GeneratedFile[]
  ): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for package.json
    const hasPackageJson = files.some((f) => f.path === 'package.json');
    if (!hasPackageJson) {
      errors.push('Missing package.json file');
    }

    // Check for service-specific files
    const serviceFiles = files.filter((f) =>
      f.path.startsWith(`apps/${service.name}/`)
    );
    if (serviceFiles.length === 0) {
      errors.push(`No files found for service: ${service.name}`);
    }

    // Check for entry point based on service type
    if (service.type === 'frontend') {
      const hasEntryPoint = files.some(
        (f) =>
          f.path.includes(`apps/${service.name}/src/app/page.tsx`) ||
          f.path.includes(`apps/${service.name}/src/pages/index.tsx`) ||
          f.path.includes(`apps/${service.name}/index.html`)
      );
      if (!hasEntryPoint) {
        warnings.push('No frontend entry point found');
      }
    }

    if (service.type === 'backend') {
      const hasEntryPoint = files.some(
        (f) =>
          f.path.includes(`apps/${service.name}/src/index.ts`) ||
          f.path.includes(`apps/${service.name}/src/server.ts`) ||
          f.path.includes(`apps/${service.name}/src/main.ts`)
      );
      if (!hasEntryPoint) {
        warnings.push('No backend entry point found');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Statistics about filtered files
 */
export interface FileFilterStats {
  totalFiles: number;
  serviceFiles: number;
  sharedFiles: number;
  configFiles: number;
  totalSize: number;
}

/**
 * Result of file validation
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Create a file filter with default configuration
 */
export function createFileFilter(config?: Partial<FileFilterConfig>): FileFilter {
  return new FileFilter(config);
}

/**
 * Quick filter function for a single service
 * @param service - Service to filter for
 * @param allFiles - All files
 * @returns Filtered files
 */
export function filterFilesForService(
  service: DeploymentService,
  allFiles: GeneratedFile[]
): GeneratedFile[] {
  const filter = new FileFilter();
  return filter.filterForService(service, allFiles);
}
