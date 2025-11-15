import { ScaffoldConfig } from '@/types';

/**
 * Template variable context for string interpolation
 */
export interface TemplateContext {
  projectName: string;
  description: string;
  framework: string;
  [key: string]: any;
}

/**
 * File template definition
 */
export interface FileTemplate {
  path: string;
  content: string;
  condition?: (config: ScaffoldConfig) => boolean;
}

/**
 * Directory structure definition
 */
export interface DirectoryStructure {
  path: string;
  condition?: (config: ScaffoldConfig) => boolean;
}

/**
 * Template engine for string interpolation
 * Supports {{variable}} syntax for simple replacements
 */
export class TemplateEngine {
  /**
   * Interpolate template string with context variables
   * @param template - Template string with {{variable}} placeholders
   * @param context - Context object with variable values
   * @returns Interpolated string
   */
  interpolate(template: string, context: TemplateContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in context) {
        return String(context[key]);
      }
      return match;
    });
  }

  /**
   * Interpolate file path with context variables
   * @param path - Path template with {{variable}} placeholders
   * @param context - Context object with variable values
   * @returns Interpolated path
   */
  interpolatePath(path: string, context: TemplateContext): string {
    return this.interpolate(path, context);
  }

  /**
   * Create template context from scaffold configuration
   * @param config - Scaffold configuration
   * @returns Template context object
   */
  createContext(config: ScaffoldConfig): TemplateContext {
    return {
      projectName: config.projectName,
      description: config.description,
      framework: config.framework,
      auth: config.auth,
      database: config.database,
      api: config.api,
      styling: config.styling,
      colorScheme: config.colorScheme,
      hasAuth: config.auth !== 'none',
      hasDatabase: config.database !== 'none',
      hasShadcn: config.shadcn,
      hasAI: config.aiTemplate && config.aiTemplate !== 'none',
      aiTemplate: config.aiTemplate || 'none',
      isMonorepo: config.framework === 'monorepo',
      isNextJs: config.framework === 'next' || config.framework === 'monorepo',
      isExpress: config.framework === 'express' || config.framework === 'monorepo',
      nextjsRouter: config.nextjsRouter || 'app',
    };
  }
}
