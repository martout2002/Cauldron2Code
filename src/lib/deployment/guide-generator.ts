import { ScaffoldConfig } from '@/types';
import {
  DeploymentGuide,
  Platform,
  DeploymentStep,
  DeploymentRequirements,
} from '@/types/deployment-guides';
import { ConfigurationAnalyzer } from './configuration-analyzer';
import { StepBuilder } from './step-builder';
import { ChecklistGenerator } from './checklist-generator';
import { TroubleshootingBuilder } from './troubleshooting-builder';
import { getDiagramForContext } from './architecture-diagrams';
import { getGuideErrorHandler } from './guide-error-handler';

/**
 * GuideGenerator
 * 
 * Orchestrates the generation of complete deployment guides.
 * Integrates ConfigurationAnalyzer, StepBuilder, ChecklistGenerator,
 * and TroubleshootingBuilder to create comprehensive, contextual
 * deployment instructions for any platform and scaffold configuration.
 * 
 * Requirements: 2.1, 2.7, 3.1
 */
export class GuideGenerator {
  private configAnalyzer: ConfigurationAnalyzer;
  private stepBuilder: StepBuilder;
  private checklistGenerator: ChecklistGenerator;
  private troubleshootingBuilder: TroubleshootingBuilder;
  private errorHandler = getGuideErrorHandler();
  private static idCounter = 0;

  constructor() {
    this.configAnalyzer = new ConfigurationAnalyzer();
    this.stepBuilder = new StepBuilder();
    this.checklistGenerator = new ChecklistGenerator();
    this.troubleshootingBuilder = new TroubleshootingBuilder();
  }

  /**
   * Generate a complete deployment guide for a platform and scaffold configuration
   * 
   * @param platform - The deployment platform (Vercel, Railway, Render, etc.)
   * @param scaffoldConfig - The user's scaffold configuration
   * @param repositoryUrl - Optional GitHub repository URL if already created
   * @returns Complete deployment guide with steps, checklist, and troubleshooting
   * 
   * Requirement 2.1: Analyze scaffold configuration to determine required setup steps
   * Requirement 2.7: Display only relevant steps based on user's configuration
   * Requirement 3.1: Show steps in numbered, sequential format
   * Requirement 1.6: Skip repository creation steps if repo exists
   */
  generateGuide(
    platform: Platform,
    scaffoldConfig: ScaffoldConfig,
    repositoryUrl?: string | null
  ): DeploymentGuide {
    try {
      // Validate inputs
      if (!platform || !platform.id) {
        throw new Error('Invalid platform provided');
      }

      if (!scaffoldConfig || !scaffoldConfig.projectName) {
        throw new Error('Invalid scaffold configuration provided');
      }

      // Step 1: Analyze configuration to determine requirements
      // Requirement 2.1: Analyze scaffold configuration
      const requirements = this.configAnalyzer.analyze(scaffoldConfig);

      // Step 2: Build deployment steps based on platform and requirements
      // Requirement 3.1: Sequential, numbered steps
      // Requirement 1.6: Pass repository URL to skip creation steps
      const steps = this.buildAllSteps(platform, requirements, repositoryUrl);

      // Step 3: Generate post-deployment checklist
      // Requirement 8.1: Post-deployment checklist
      const checklist = this.checklistGenerator.generate(
        platform,
        requirements,
        scaffoldConfig
      );

      // Step 4: Generate troubleshooting section
      // Requirement 9.1: Common issues section
      const troubleshooting = this.troubleshootingBuilder.buildTroubleshootingSection(
        platform,
        requirements
      );

      // Step 5: Estimate deployment time
      const estimatedTime = this.estimateDeploymentTime(steps);

      // Step 6: Generate unique guide ID
      const guideId = this.generateGuideId(platform, scaffoldConfig);

      // Step 7: Generate architecture diagrams
      // Requirement 12.2, 12.3, 12.4: Create diagrams for complex setups
      const diagrams = this.generateDiagrams(platform, requirements, scaffoldConfig);

      return {
        id: guideId,
        platform,
        scaffoldConfig,
        steps,
        postDeploymentChecklist: checklist,
        troubleshooting,
        estimatedTime,
        diagrams,
      };
    } catch (error) {
      const guideError = this.errorHandler.handleGenerationError(
        error as Error,
        { platform: platform?.id, operation: 'generateGuide' }
      );
      this.errorHandler.logError(guideError, { platform: platform?.id });
      throw error;
    }
  }

  /**
   * Generate architecture diagrams for the deployment guide
   * 
   * @param platform - The deployment platform
   * @param requirements - Analyzed deployment requirements
   * @param scaffoldConfig - The user's scaffold configuration
   * @returns Array of architecture diagrams
   * 
   * Requirement 12.2: Create deployment workflow diagram for complex setups
   * Requirement 12.3: Create service architecture diagram for monorepos
   * Requirement 12.4: Add alt text for accessibility
   */
  private generateDiagrams(
    platform: Platform,
    requirements: DeploymentRequirements,
    scaffoldConfig: ScaffoldConfig
  ) {
    // Determine services for monorepo
    const services = requirements.isMonorepo
      ? this.getMonorepoServices(scaffoldConfig)
      : [];

    // Get auth provider name
    const authProvider = requirements.authProvider
      ? this.getAuthProviderName(requirements.authProvider)
      : undefined;

    // Generate diagrams based on context
    return getDiagramForContext({
      platform,
      hasDatabase: requirements.requiresDatabase,
      hasAuth: requirements.requiresAuth,
      hasAI: requirements.requiresAI,
      hasRedis: requirements.requiresRedis,
      isMonorepo: requirements.isMonorepo,
      services,
      authProvider,
      databaseType: requirements.databaseType,
      envVarCount: requirements.environmentVariables.length,
    });
  }

  /**
   * Get service names for monorepo architecture
   */
  private getMonorepoServices(scaffoldConfig: ScaffoldConfig): string[] {
    const services: string[] = [];
    
    if (scaffoldConfig.frontendFramework) {
      services.push('Frontend');
    }
    
    if (scaffoldConfig.backendFramework) {
      services.push('Backend API');
    }
    
    if (scaffoldConfig.database) {
      services.push('Database');
    }
    
    return services;
  }

  /**
   * Get human-readable auth provider name
   */
  private getAuthProviderName(authProvider: string): string {
    const providerNames: Record<string, string> = {
      'nextauth': 'NextAuth.js',
      'clerk': 'Clerk',
      'supabase-auth': 'Supabase Auth',
    };
    
    return providerNames[authProvider] || authProvider;
  }

  /**
   * Build all deployment steps including monorepo steps if applicable
   * 
   * @param platform - The deployment platform
   * @param requirements - Analyzed deployment requirements
   * @param repositoryUrl - Optional GitHub repository URL if already created
   * @returns Array of deployment steps in order
   * 
   * Requirement 1.6: Skip repository creation steps if repo exists
   */
  private buildAllSteps(
    platform: Platform,
    requirements: DeploymentRequirements,
    repositoryUrl?: string | null
  ): DeploymentStep[] {
    const steps: DeploymentStep[] = [];

    // Build standard deployment steps with repository URL
    // Requirement 1.6: Pass repository URL to skip creation steps and pre-fill URLs
    const standardSteps = this.stepBuilder.buildSteps(
      platform, 
      requirements, 
      repositoryUrl
    );
    steps.push(...standardSteps);

    // Add monorepo-specific steps if applicable
    // Requirement 11.1-11.6: Monorepo deployment guidance
    if (requirements.isMonorepo) {
      const monorepoSteps = this.stepBuilder.buildMonorepoSteps(
        platform,
        requirements,
        steps.length + 1
      );
      steps.push(...monorepoSteps);
    }

    return steps;
  }

  /**
   * Estimate total deployment time based on steps and requirements
   * 
   * @param steps - Array of deployment steps
   * @returns Estimated time range as string (e.g., "15-25 minutes")
   */
  estimateDeploymentTime(steps: DeploymentStep[]): string {
    // Base time for reading and understanding the guide
    const baseMinutes = 5;

    // Add time per step
    // Simple steps: 2 minutes
    // Steps with substeps: 3 minutes per substep
    // Steps with commands: +1 minute
    let totalMinutes = baseMinutes;

    for (const step of steps) {
      if (step.substeps && step.substeps.length > 0) {
        // Steps with substeps take longer
        totalMinutes += step.substeps.length * 3;
      } else {
        // Simple steps
        totalMinutes += 2;
      }

      // Add extra time for steps with commands
      if (step.commands && step.commands.length > 0) {
        totalMinutes += 1;
      }
    }

    // Add buffer for first-time deployment (20% more time)
    const minTime = totalMinutes;
    const maxTime = Math.ceil(totalMinutes * 1.2);

    return `${minTime}-${maxTime} minutes`;
  }

  /**
   * Generate a unique guide ID based on platform and configuration
   * 
   * @param platform - The deployment platform
   * @param scaffoldConfig - The scaffold configuration
   * @returns Unique guide identifier
   */
  generateGuideId(platform: Platform, scaffoldConfig: ScaffoldConfig): string {
    // Create a deterministic ID based on platform and key config properties
    const configSignature = [
      platform.id,
      scaffoldConfig.frontendFramework,
      scaffoldConfig.database,
      scaffoldConfig.auth,
      scaffoldConfig.projectStructure,
      scaffoldConfig.aiTemplate || 'none',
    ].join('-');

    // Add timestamp and counter for uniqueness
    const timestamp = Date.now();
    const counter = GuideGenerator.idCounter++;

    return `${configSignature}-${timestamp}-${counter}`;
  }

  /**
   * Generate a guide with custom requirements (useful for testing)
   * 
   * @param platform - The deployment platform
   * @param requirements - Custom deployment requirements
   * @returns Deployment guide with custom requirements
   */
  generateGuideWithRequirements(
    platform: Platform,
    requirements: DeploymentRequirements
  ): Omit<DeploymentGuide, 'scaffoldConfig'> {
    const steps = this.buildAllSteps(platform, requirements);
    
    // Create a minimal scaffold config for checklist generation
    const minimalConfig: ScaffoldConfig = {
      projectName: 'custom-project',
      description: 'Custom deployment guide',
      frontendFramework: requirements.framework.toLowerCase() as any,
      backendFramework: 'none',
      database: requirements.requiresDatabase ? 'prisma-postgres' : 'none',
      auth: requirements.requiresAuth ? 'nextauth' : 'none',
      styling: 'tailwind',
      shadcn: false,
      api: 'rest-fetch',
      colorScheme: 'purple',
      deployment: [],
      buildTool: requirements.buildTool as any,
      projectStructure: requirements.isMonorepo ? 'fullstack-monorepo' : 'nextjs-only',
      extras: {
        docker: false,
        githubActions: false,
        prettier: false,
        husky: false,
        redis: requirements.requiresRedis,
      },
      aiTemplate: requirements.requiresAI ? 'chatbot' : undefined,
      aiProvider: requirements.requiresAI ? 'anthropic' : undefined,
    };

    const checklist = this.checklistGenerator.generate(
      platform,
      requirements,
      minimalConfig
    );

    const troubleshooting = this.troubleshootingBuilder.buildTroubleshootingSection(
      platform,
      requirements
    );

    const estimatedTime = this.estimateDeploymentTime(steps);
    const guideId = `custom-${platform.id}-${Date.now()}`;

    return {
      id: guideId,
      platform,
      steps,
      postDeploymentChecklist: checklist,
      troubleshooting,
      estimatedTime,
    };
  }
}
