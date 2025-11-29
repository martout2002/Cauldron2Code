import { ScaffoldConfig } from '@/types';
import {
  ChecklistItem,
  CommandSnippet,
  DeploymentRequirements,
  Platform,
} from '@/types/deployment-guides';

/**
 * ChecklistGenerator
 * 
 * Generates post-deployment checklist items based on scaffold configuration.
 * Creates actionable tasks for users to complete after initial deployment.
 */
export class ChecklistGenerator {
  /**
   * Generate post-deployment checklist
   */
  generate(
    platform: Platform,
    requirements: DeploymentRequirements,
    config: ScaffoldConfig
  ): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    // OAuth callback URLs (for NextAuth)
    if (requirements.requiresAuth && requirements.authProvider === 'NextAuth.js') {
      items.push(this.createOAuthCallbackItem());
    }

    // Database migrations
    if (requirements.requiresDatabase) {
      items.push(this.createDatabaseMigrationItem(config.database, platform));
    }

    // AI API key verification
    if (requirements.requiresAI) {
      items.push(this.createAIVerificationItem());
    }

    // Test application
    items.push(this.createTestApplicationItem());

    // Custom domain setup
    if (platform.features.customDomains) {
      items.push(this.createCustomDomainItem(platform));
    }

    // Monitoring setup
    items.push(this.createMonitoringItem());

    return items;
  }

  /**
   * Create OAuth callback URL checklist item
   * Requirement 8.2: OAuth callback configuration
   */
  private createOAuthCallbackItem(): ChecklistItem {
    return {
      id: 'oauth-callbacks',
      title: 'Update OAuth Callback URLs',
      description:
        'Add your deployment URL to OAuth provider settings. This is required for authentication to work in production.',
      required: true,
      externalLinks: [
        {
          text: 'GitHub OAuth Settings',
          url: 'https://github.com/settings/developers',
          type: 'service',
        },
        {
          text: 'Google OAuth Settings',
          url: 'https://console.cloud.google.com/apis/credentials',
          type: 'service',
        },
      ],
      completed: false,
    };
  }

  /**
   * Create database migration checklist item
   * Requirement 8.3: Database migrations with platform-specific commands
   */
  private createDatabaseMigrationItem(
    database: string,
    platform: Platform
  ): ChecklistItem {
    const migrationCommand = this.getMigrationCommand(database);
    const commands: CommandSnippet[] = [];

    if (migrationCommand) {
      commands.push({
        id: 'migration-cmd',
        command: migrationCommand,
        description: 'Run this command to initialize your database schema',
        language: 'bash',
      });

      // Add platform-specific remote execution command if applicable
      const remoteCommand = this.getRemoteMigrationCommand(platform, migrationCommand);
      if (remoteCommand) {
        commands.push({
          id: 'migration-remote-cmd',
          command: remoteCommand,
          description: `Run migrations on ${platform.name} directly`,
          language: 'bash',
        });
      }
    }

    return {
      id: 'database-migrations',
      title: 'Run Database Migrations',
      description:
        'Initialize your database schema by running migrations. This creates the necessary tables and structures for your application.',
      required: true,
      commands: commands.length > 0 ? commands : undefined,
      externalLinks: [
        {
          text: `${platform.name} Database Documentation`,
          url: `${platform.documentationUrl}/databases`,
          type: 'documentation',
        },
      ],
      completed: false,
    };
  }

  /**
   * Create AI verification checklist item
   * Requirement 8.4: AI API key verification
   */
  private createAIVerificationItem(): ChecklistItem {
    return {
      id: 'verify-ai-keys',
      title: 'Verify AI API Keys',
      description:
        'Test that your AI API keys are correctly configured and have sufficient credits/quota.',
      required: true,
      externalLinks: [
        {
          text: 'Anthropic Console',
          url: 'https://console.anthropic.com',
          type: 'service',
        },
        {
          text: 'OpenAI Platform',
          url: 'https://platform.openai.com',
          type: 'service',
        },
      ],
      completed: false,
    };
  }

  /**
   * Create test application checklist item
   * Requirement 8.5: Application testing
   */
  private createTestApplicationItem(): ChecklistItem {
    return {
      id: 'test-application',
      title: 'Test Your Deployed Application',
      description:
        'Visit your deployment URL and verify all features work correctly. Test authentication, database connections, and any API integrations.',
      required: true,
      completed: false,
    };
  }

  /**
   * Create custom domain checklist item
   * Requirement 8.6: Custom domain setup
   */
  private createCustomDomainItem(platform: Platform): ChecklistItem {
    return {
      id: 'custom-domain',
      title: 'Add Custom Domain (Optional)',
      description:
        'Configure a custom domain for your application to replace the default platform URL.',
      required: false,
      externalLinks: [
        {
          text: `${platform.name} Custom Domains`,
          url: `${platform.documentationUrl}/domains`,
          type: 'documentation',
        },
      ],
      completed: false,
    };
  }

  /**
   * Create monitoring setup checklist item
   * Requirement 8.7: Monitoring and error tracking
   */
  private createMonitoringItem(): ChecklistItem {
    return {
      id: 'setup-monitoring',
      title: 'Set Up Monitoring (Optional)',
      description:
        'Add error tracking and performance monitoring to catch issues in production and understand user behavior.',
      required: false,
      externalLinks: [
        {
          text: 'Sentry',
          url: 'https://sentry.io',
          type: 'service',
        },
        {
          text: 'LogRocket',
          url: 'https://logrocket.com',
          type: 'service',
        },
        {
          text: 'Datadog',
          url: 'https://www.datadoghq.com',
          type: 'service',
        },
      ],
      completed: false,
    };
  }

  /**
   * Get migration command based on database/ORM
   */
  private getMigrationCommand(database: string): string | null {
    if (database.includes('prisma')) {
      return 'npx prisma migrate deploy';
    }
    if (database.includes('drizzle')) {
      return 'npm run db:migrate';
    }
    if (database === 'supabase') {
      return 'npx supabase db push';
    }
    return null;
  }

  /**
   * Get platform-specific remote migration command
   */
  private getRemoteMigrationCommand(
    platform: Platform,
    migrationCommand: string
  ): string | null {
    switch (platform.id) {
      case 'vercel':
        // Vercel doesn't have a direct way to run commands, migrations should be in build
        return null;
      case 'railway':
        return `railway run ${migrationCommand}`;
      case 'render':
        // Render uses build commands, but can also use shell access
        return null;
      case 'netlify':
        return null;
      case 'aws-amplify':
        return null;
      default:
        return null;
    }
  }
}
