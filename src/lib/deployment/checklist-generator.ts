/**
 * Post-Deployment Checklist Generator
 * Generates setup instructions based on scaffold configuration
 */

import type { Deployment, DeploymentConfig } from '@/lib/platforms/types';
import type { ScaffoldConfig } from '@/types';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  command?: string;
  links?: { text: string; url: string }[];
  action?: { text: string; url: string };
}

export class PostDeploymentChecklistGenerator {
  /**
   * Generate a checklist of post-deployment setup tasks
   */
  generate(deployment: Deployment): ChecklistItem[] {
    const items: ChecklistItem[] = [];
    const config = deployment.config.scaffoldConfig;

    // OAuth callback URLs
    if (this.needsOAuthSetup(config)) {
      items.push(this.generateOAuthCallbackItem(deployment, config));
    }

    // Database migrations
    if (this.needsDatabaseMigration(config)) {
      items.push(this.generateDatabaseMigrationItem(config));
    }

    // AI API keys
    if (this.needsAIApiKey(config, deployment.config)) {
      items.push(this.generateAIApiKeyItem(config));
    }

    // Custom domain setup
    items.push(this.generateCustomDomainItem(deployment.platform));

    // SSL certificate information
    items.push(this.generateSSLCertificateItem(deployment.platform));

    // Test application
    items.push(this.generateTestApplicationItem(deployment));

    return items;
  }

  /**
   * Check if OAuth setup is needed
   */
  private needsOAuthSetup(config: ScaffoldConfig): boolean {
    return config.auth === 'nextauth' || config.auth === 'clerk';
  }

  /**
   * Check if database migration is needed
   */
  private needsDatabaseMigration(config: ScaffoldConfig): boolean {
    return config.database !== 'none';
  }

  /**
   * Check if AI API key reminder is needed
   */
  private needsAIApiKey(
    config: ScaffoldConfig,
    deploymentConfig: DeploymentConfig
  ): boolean {
    if (!config.aiTemplate || config.aiTemplate === 'none') {
      return false;
    }

    // Check if API key was provided during deployment
    const hasApiKey = deploymentConfig.environmentVariables.some(
      (v) =>
        (v.key === 'ANTHROPIC_API_KEY' ||
          v.key === 'OPENAI_API_KEY' ||
          v.key === 'AWS_BEDROCK_API_KEY' ||
          v.key === 'GEMINI_API_KEY') &&
        v.value
    );

    return !hasApiKey;
  }

  /**
   * Generate OAuth callback URL setup item
   */
  private generateOAuthCallbackItem(
    deployment: Deployment,
    config: ScaffoldConfig
  ): ChecklistItem {
    const callbackUrl = `${deployment.deploymentUrl}/api/auth/callback`;

    if (config.auth === 'nextauth') {
      return {
        id: 'oauth-callbacks',
        title: 'Update OAuth Callback URLs',
        description: `Add ${callbackUrl}/[provider] to your OAuth provider settings (GitHub, Google, etc.)`,
        required: true,
        links: [
          {
            text: 'GitHub OAuth Settings',
            url: 'https://github.com/settings/developers',
          },
          {
            text: 'Google OAuth Settings',
            url: 'https://console.cloud.google.com/apis/credentials',
          },
        ],
      };
    }

    if (config.auth === 'clerk') {
      return {
        id: 'clerk-domain',
        title: 'Update Clerk Domain Settings',
        description: `Add ${deployment.deploymentUrl} to your Clerk allowed domains`,
        required: true,
        links: [
          {
            text: 'Clerk Dashboard',
            url: 'https://dashboard.clerk.com',
          },
        ],
      };
    }

    // Fallback (shouldn't reach here)
    return {
      id: 'oauth-setup',
      title: 'Configure OAuth Settings',
      description: 'Update your OAuth provider settings with the deployment URL',
      required: true,
      links: [],
    };
  }

  /**
   * Generate database migration setup item
   */
  private generateDatabaseMigrationItem(config: ScaffoldConfig): ChecklistItem {
    const command = this.getMigrationCommand(config);

    return {
      id: 'run-migrations',
      title: 'Run Database Migrations',
      description:
        'Initialize your database schema by running migrations. You may need to connect to your deployment platform to run this command.',
      required: true,
      command,
      links: [
        {
          text: 'Platform Documentation',
          url: this.getMigrationDocsUrl(config),
        },
      ],
    };
  }

  /**
   * Generate AI API key reminder item
   */
  private generateAIApiKeyItem(config: ScaffoldConfig): ChecklistItem {
    const provider = config.aiProvider || 'anthropic';
    const keyName = this.getApiKeyName(provider);
    const docsUrl = this.getApiKeyDocsUrl(provider);

    return {
      id: 'ai-api-key',
      title: 'Add AI API Key',
      description: `AI features require a ${provider} API key. Add the ${keyName} environment variable to your deployment.`,
      required: true,
      links: [
        {
          text: 'Get API Key',
          url: docsUrl,
        },
      ],
    };
  }

  /**
   * Generate custom domain setup item with platform-specific instructions
   */
  private generateCustomDomainItem(platform: string): ChecklistItem {
    const domainInstructions = this.getDomainSetupInstructions(platform);
    
    return {
      id: 'custom-domain',
      title: 'Add Custom Domain (Optional)',
      description: domainInstructions.description,
      required: false,
      links: [
        {
          text: 'Platform Documentation',
          url: this.getDomainDocsUrl(platform),
        },
        {
          text: 'DNS Configuration Guide',
          url: domainInstructions.dnsGuideUrl,
        },
      ],
    };
  }

  /**
   * Get platform-specific domain setup instructions
   */
  private getDomainSetupInstructions(platform: string): {
    description: string;
    dnsGuideUrl: string;
  } {
    const instructions: Record<string, { description: string; dnsGuideUrl: string }> = {
      vercel: {
        description: `To add a custom domain to Vercel:
1. Go to your project settings in Vercel Dashboard
2. Navigate to the "Domains" section
3. Add your domain (e.g., example.com or www.example.com)
4. Configure DNS records:
   - For root domain: Add A record pointing to 76.76.21.21
   - For www subdomain: Add CNAME record pointing to cname.vercel-dns.com
5. Wait for DNS propagation (can take up to 48 hours)
6. Vercel will automatically provision SSL certificate`,
        dnsGuideUrl: 'https://vercel.com/docs/concepts/projects/domains/add-a-domain',
      },
      railway: {
        description: `To add a custom domain to Railway:
1. Go to your service settings in Railway Dashboard
2. Navigate to the "Domains" section
3. Click "Add Custom Domain"
4. Enter your domain name
5. Configure DNS records at your domain registrar:
   - Add CNAME record pointing to the provided Railway domain
   - Or add A record if using root domain
6. Wait for DNS propagation
7. Railway will automatically provision SSL certificate via Let's Encrypt`,
        dnsGuideUrl: 'https://docs.railway.app/deploy/custom-domains',
      },
      render: {
        description: `To add a custom domain to Render:
1. Go to your service dashboard in Render
2. Navigate to the "Settings" tab
3. Scroll to "Custom Domains" section
4. Click "Add Custom Domain"
5. Enter your domain name
6. Configure DNS records:
   - For root domain: Add A record pointing to the provided IP
   - For subdomain: Add CNAME record pointing to your Render service URL
7. Wait for DNS propagation
8. Render will automatically provision SSL certificate via Let's Encrypt`,
        dnsGuideUrl: 'https://render.com/docs/custom-domains',
      },
    };

    return (
      instructions[platform] || {
        description: 'Configure a custom domain for your application. Check your platform documentation for specific instructions.',
        dnsGuideUrl: '#',
      }
    );
  }

  /**
   * Generate SSL certificate information item
   */
  private generateSSLCertificateItem(platform: string): ChecklistItem {
    const sslInfo = this.getSSLCertificateInfo(platform);

    return {
      id: 'ssl-certificate',
      title: 'SSL Certificate (Automatic)',
      description: sslInfo.description,
      required: false,
      links: sslInfo.links,
    };
  }

  /**
   * Get SSL certificate information for platform
   */
  private getSSLCertificateInfo(platform: string): {
    description: string;
    links: { text: string; url: string }[];
  } {
    const sslInfo: Record<
      string,
      { description: string; links: { text: string; url: string }[] }
    > = {
      vercel: {
        description:
          'Vercel automatically provisions and renews SSL certificates for all domains (both platform subdomains and custom domains) using Let\'s Encrypt. HTTPS is enabled by default with automatic HTTP to HTTPS redirects.',
        links: [
          {
            text: 'SSL Documentation',
            url: 'https://vercel.com/docs/concepts/edge-network/encryption',
          },
        ],
      },
      railway: {
        description:
          'Railway automatically provisions SSL certificates via Let\'s Encrypt for all services. Certificates are automatically renewed before expiration. HTTPS is enforced by default.',
        links: [
          {
            text: 'SSL Documentation',
            url: 'https://docs.railway.app/deploy/deployments#ssl-certificates',
          },
        ],
      },
      render: {
        description:
          'Render automatically provisions and manages SSL certificates using Let\'s Encrypt for all services. Certificates are automatically renewed. HTTPS is enabled by default with automatic redirects from HTTP.',
        links: [
          {
            text: 'SSL Documentation',
            url: 'https://render.com/docs/tls',
          },
        ],
      },
    };

    return (
      sslInfo[platform] || {
        description:
          'SSL certificates are automatically provisioned and managed by the platform.',
        links: [],
      }
    );
  }

  /**
   * Generate test application item
   */
  private generateTestApplicationItem(deployment: Deployment): ChecklistItem {
    return {
      id: 'test-app',
      title: 'Test Your Application',
      description:
        'Visit your deployed application and verify that all features work correctly.',
      required: true,
      action: {
        text: 'Open Application',
        url: deployment.deploymentUrl || '#',
      },
    };
  }

  /**
   * Get the migration command based on database configuration
   */
  private getMigrationCommand(config: ScaffoldConfig): string {
    if (config.database.includes('prisma')) {
      return 'npx prisma migrate deploy';
    }
    if (config.database.includes('drizzle')) {
      return 'npm run db:migrate';
    }
    if (config.database === 'supabase') {
      return 'npx supabase db push';
    }
    if (config.database === 'mongodb') {
      return '# MongoDB migrations are handled automatically';
    }
    return 'npm run migrate';
  }

  /**
   * Get migration documentation URL
   */
  private getMigrationDocsUrl(config: ScaffoldConfig): string {
    if (config.database.includes('prisma')) {
      return 'https://www.prisma.io/docs/concepts/components/prisma-migrate';
    }
    if (config.database.includes('drizzle')) {
      return 'https://orm.drizzle.team/docs/migrations';
    }
    if (config.database === 'supabase') {
      return 'https://supabase.com/docs/guides/cli/local-development#database-migrations';
    }
    if (config.database === 'mongodb') {
      return 'https://www.mongodb.com/docs/manual/core/schema-validation/';
    }
    return '#';
  }

  /**
   * Get API key environment variable name
   */
  private getApiKeyName(provider: string): string {
    const keyNames: Record<string, string> = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      'aws-bedrock': 'AWS_BEDROCK_API_KEY',
      gemini: 'GEMINI_API_KEY',
    };
    return keyNames[provider] || 'API_KEY';
  }

  /**
   * Get API key documentation URL
   */
  private getApiKeyDocsUrl(provider: string): string {
    const urls: Record<string, string> = {
      anthropic: 'https://console.anthropic.com/settings/keys',
      openai: 'https://platform.openai.com/api-keys',
      'aws-bedrock': 'https://console.aws.amazon.com/bedrock/',
      gemini: 'https://makersuite.google.com/app/apikey',
    };
    return urls[provider] || '#';
  }

  /**
   * Get custom domain documentation URL
   */
  private getDomainDocsUrl(platform: string): string {
    const urls: Record<string, string> = {
      vercel: 'https://vercel.com/docs/concepts/projects/custom-domains',
      railway: 'https://docs.railway.app/deploy/custom-domains',
      render: 'https://render.com/docs/custom-domains',
    };
    return urls[platform] || '#';
  }
}
