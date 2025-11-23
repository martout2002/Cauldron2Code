import {
  Platform,
  TroubleshootingSection,
  TroubleshootingIssue,
  ExternalLink,
  DeploymentRequirements,
} from '@/types/deployment-guides';

/**
 * TroubleshootingBuilder
 * 
 * Builds troubleshooting sections for deployment guides.
 * Generates common issues, solutions, and helpful links based on
 * platform and project requirements.
 */
export class TroubleshootingBuilder {
  /**
   * Build complete troubleshooting section for a platform and requirements
   */
  buildTroubleshootingSection(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingSection {
    const commonIssues: TroubleshootingIssue[] = [];

    // Always include build fails issue
    commonIssues.push(this.buildBuildFailsIssue(platform, requirements));

    // Always include application won't start issue
    commonIssues.push(this.buildApplicationWontStartIssue(platform, requirements));

    // Add database connection errors if database is required
    if (requirements.requiresDatabase) {
      commonIssues.push(this.buildDatabaseConnectionIssue(platform, requirements));
    }

    // Always include environment variable issues
    commonIssues.push(this.buildEnvironmentVariableIssue(platform, requirements));

    return {
      commonIssues,
      platformStatusUrl: this.getPlatformStatusUrl(platform),
      communityLinks: this.getCommunityLinks(platform),
    };
  }

  /**
   * Build "Build Fails" troubleshooting issue
   */
  private buildBuildFailsIssue(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingIssue {
    const symptoms = [
      'Build process exits with error code',
      'Dependencies fail to install',
      'TypeScript compilation errors',
      'Build command not found',
      'Out of memory errors during build',
    ];

    const causes = [
      'Missing or incorrect environment variables during build',
      'Node.js version mismatch between local and deployment',
      'Missing dependencies in package.json',
      'Incorrect build command configuration',
      'Build requires more memory than allocated',
      'TypeScript errors that were ignored locally',
    ];

    const solutions = [
      `Check that all required build-time environment variables are set in ${platform.name}`,
      'Verify Node.js version matches your local environment (add "engines" field to package.json)',
      'Run "npm install" or "yarn install" locally to verify all dependencies are listed',
      `Review build logs in ${platform.name} dashboard for specific error messages`,
      'Ensure your build command in platform settings matches your package.json scripts',
      'Fix any TypeScript errors shown in the build logs',
      'For memory issues, consider upgrading your plan or optimizing your build process',
    ];

    // Add framework-specific solutions
    if (requirements.framework === 'Next.js') {
      solutions.push(
        'For Next.js, ensure NEXTAUTH_URL and other build-time variables are set',
        'Check that your next.config.js is properly configured'
      );
    }

    const relatedLinks: ExternalLink[] = [
      {
        text: `${platform.name} Build Documentation`,
        url: `${platform.documentationUrl}/builds`,
        type: 'documentation',
      },
      {
        text: 'Node.js Version Management',
        url: 'https://nodejs.org/en/download',
        type: 'documentation',
      },
    ];

    return {
      title: 'Build Fails',
      symptoms,
      causes,
      solutions,
      relatedLinks,
    };
  }

  /**
   * Build "Application Won't Start" troubleshooting issue
   */
  private buildApplicationWontStartIssue(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingIssue {
    const symptoms = [
      'Deployment succeeds but application shows error page',
      '502 Bad Gateway or 503 Service Unavailable errors',
      'Application crashes immediately after starting',
      'Health check failures',
      'Application logs show startup errors',
    ];

    const causes = [
      'Incorrect start command configuration',
      'Application not listening on the correct port',
      'Missing runtime environment variables',
      'Database connection failures preventing startup',
      'Uncaught exceptions during application initialization',
      'Dependencies missing or incompatible in production',
    ];

    const solutions = [
      `Verify your start command in ${platform.name} settings matches your package.json`,
      'Ensure your application listens on the PORT environment variable provided by the platform',
      'Check that all runtime environment variables are correctly set',
      `Review application logs in ${platform.name} dashboard for specific error messages`,
      'Test your start command locally: npm run start',
      'Verify database connection string is correct and database is accessible',
      'Check for any missing peer dependencies or production-only issues',
    ];

    // Add platform-specific solutions
    if (platform.id === 'vercel') {
      solutions.push(
        'For Vercel, ensure your application exports properly for serverless functions',
        'Check that your application is compatible with Vercel\'s serverless architecture'
      );
    } else if (platform.id === 'railway') {
      solutions.push(
        'Railway automatically provides PORT environment variable - ensure your app uses it',
        'Check Railway logs for detailed error messages'
      );
    } else if (platform.id === 'render') {
      solutions.push(
        'Render requires your app to listen on 0.0.0.0, not localhost',
        'Ensure your start command is correct in Render dashboard'
      );
    }

    // Add framework-specific solutions
    if (requirements.framework === 'Next.js') {
      solutions.push(
        'For Next.js, ensure you\'re using "npm run start" not "npm run dev"',
        'Verify your Next.js build completed successfully'
      );
    }

    const relatedLinks: ExternalLink[] = [
      {
        text: `${platform.name} Deployment Documentation`,
        url: `${platform.documentationUrl}/deployments`,
        type: 'documentation',
      },
      {
        text: `${platform.name} Logs and Debugging`,
        url: `${platform.documentationUrl}/logs`,
        type: 'documentation',
      },
    ];

    return {
      title: 'Application Won\'t Start',
      symptoms,
      causes,
      solutions,
      relatedLinks,
    };
  }

  /**
   * Build "Database Connection Errors" troubleshooting issue
   */
  private buildDatabaseConnectionIssue(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingIssue {
    const symptoms = [
      'Application fails to connect to database',
      'Connection timeout errors',
      'Authentication failed errors',
      'SSL/TLS connection errors',
      'Database queries fail or hang',
    ];

    const causes = [
      'Incorrect DATABASE_URL or connection string',
      'Database not accessible from deployment platform',
      'Missing or incorrect SSL/TLS configuration',
      'Database credentials expired or incorrect',
      'Firewall rules blocking connection',
      'Connection pool exhausted',
      'Database server is down or unreachable',
    ];

    const solutions = [
      'Verify DATABASE_URL environment variable is correctly set',
      'Check that your database allows connections from your deployment platform',
      'For PostgreSQL, try adding "?sslmode=require" to your connection string',
      'Verify database credentials are correct and not expired',
      'Check database provider\'s firewall/whitelist settings',
      'Review database connection logs for specific error messages',
      'Test database connection using a database client with the same connection string',
      'Ensure your database service is running and accessible',
    ];

    // Add database-specific solutions
    if (requirements.databaseType?.includes('PostgreSQL')) {
      solutions.push(
        'For PostgreSQL, ensure SSL is properly configured',
        'Check if your connection string includes the correct database name',
        'Verify PostgreSQL version compatibility'
      );
    } else if (requirements.databaseType?.includes('MongoDB')) {
      solutions.push(
        'For MongoDB, ensure your connection string includes authentication database',
        'Check MongoDB Atlas IP whitelist if using Atlas',
        'Verify MongoDB connection string format: mongodb+srv://...'
      );
    } else if (requirements.databaseType?.includes('MySQL')) {
      solutions.push(
        'For MySQL, check SSL certificate configuration',
        'Verify MySQL version compatibility with your ORM'
      );
    }

    // Add platform-specific solutions
    if (platform.id === 'vercel') {
      solutions.push(
        'Vercel Serverless Functions have connection limits - consider using connection pooling',
        'For Vercel, use Vercel Postgres or a serverless-compatible database'
      );
    } else if (platform.id === 'railway') {
      solutions.push(
        'Railway databases are accessible via private network - use internal connection string',
        'Check Railway service variables for auto-generated DATABASE_URL'
      );
    } else if (platform.id === 'render') {
      solutions.push(
        'Use Render\'s Internal Database URL for services in the same region',
        'Render PostgreSQL requires SSL connections'
      );
    }

    const relatedLinks: ExternalLink[] = [
      {
        text: `${platform.name} Database Documentation`,
        url: `${platform.documentationUrl}/databases`,
        type: 'documentation',
      },
    ];

    // Add database provider links
    if (requirements.databaseType?.includes('PostgreSQL')) {
      relatedLinks.push(
        {
          text: 'PostgreSQL Connection Strings',
          url: 'https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING',
          type: 'documentation',
        },
        {
          text: 'Supabase Connection Issues',
          url: 'https://supabase.com/docs/guides/database/connecting-to-postgres',
          type: 'documentation',
        }
      );
    } else if (requirements.databaseType?.includes('MongoDB')) {
      relatedLinks.push({
        text: 'MongoDB Connection Troubleshooting',
        url: 'https://www.mongodb.com/docs/manual/reference/connection-string/',
        type: 'documentation',
      });
    }

    return {
      title: 'Database Connection Errors',
      symptoms,
      causes,
      solutions,
      relatedLinks,
    };
  }

  /**
   * Build "Environment Variable Issues" troubleshooting issue
   */
  private buildEnvironmentVariableIssue(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingIssue {
    const symptoms = [
      'Application works locally but fails in production',
      'Features that require API keys don\'t work',
      'Undefined or null values for configuration',
      'Authentication or external service integration fails',
      'Application shows "missing environment variable" errors',
    ];

    const causes = [
      'Environment variables not set in deployment platform',
      'Typos in environment variable names',
      'Environment variables set but not exposed to application',
      'Using wrong environment variable prefix (e.g., missing NEXT_PUBLIC_)',
      'Environment variables not redeployed after changes',
      'Quotes or special characters in values causing parsing issues',
    ];

    const solutions = [
      `Verify all required environment variables are set in ${platform.name} dashboard`,
      'Check for typos in variable names - they are case-sensitive',
      'For client-side variables in Next.js, ensure they start with NEXT_PUBLIC_',
      `After adding/changing environment variables, redeploy your application on ${platform.name}`,
      'Remove quotes around environment variable values unless specifically needed',
      'Check for special characters that might need escaping',
      'Use platform\'s CLI or dashboard to list all set environment variables',
      'Verify environment variables are set for the correct environment (production vs preview)',
    ];

    // Add framework-specific solutions
    if (requirements.framework === 'Next.js') {
      solutions.push(
        'Next.js requires NEXT_PUBLIC_ prefix for client-side environment variables',
        'Server-side variables don\'t need the prefix but won\'t be available in browser',
        'Restart your development server after changing .env files locally'
      );
    }

    // Add auth-specific solutions
    if (requirements.requiresAuth) {
      solutions.push(
        'For authentication, ensure callback URLs match your deployment URL',
        'Verify OAuth client IDs and secrets are correctly set',
        'Check that NEXTAUTH_URL or similar variables point to your deployment URL'
      );
    }

    // Add platform-specific solutions
    if (platform.id === 'vercel') {
      solutions.push(
        'Vercel requires redeployment after environment variable changes',
        'Use Vercel CLI "vercel env pull" to sync environment variables locally',
        'Check environment variable scope (Production, Preview, Development)'
      );
    } else if (platform.id === 'railway') {
      solutions.push(
        'Railway automatically redeploys when environment variables change',
        'Use "railway variables" command to list all variables',
        'Railway provides some variables automatically (PORT, DATABASE_URL)'
      );
    } else if (platform.id === 'render') {
      solutions.push(
        'Render requires manual redeployment after environment variable changes',
        'Check that variables are set in the correct service',
        'Render provides some variables automatically (PORT, RENDER)'
      );
    }

    const relatedLinks: ExternalLink[] = [
      {
        text: `${platform.name} Environment Variables Documentation`,
        url: `${platform.documentationUrl}/environment-variables`,
        type: 'documentation',
      },
    ];

    // Add framework-specific links
    if (requirements.framework === 'Next.js') {
      relatedLinks.push({
        text: 'Next.js Environment Variables',
        url: 'https://nextjs.org/docs/basic-features/environment-variables',
        type: 'documentation',
      });
    }

    return {
      title: 'Environment Variable Issues',
      symptoms,
      causes,
      solutions,
      relatedLinks,
    };
  }

  /**
   * Get platform status page URL
   */
  private getPlatformStatusUrl(platform: Platform): string {
    const statusUrls: Record<string, string> = {
      vercel: 'https://www.vercel-status.com',
      railway: 'https://status.railway.app',
      render: 'https://status.render.com',
      netlify: 'https://www.netlifystatus.com',
      'aws-amplify': 'https://status.aws.amazon.com',
    };

    return statusUrls[platform.id] || `https://status.${platform.id}.com`;
  }

  /**
   * Get community and support links for platform
   */
  private getCommunityLinks(platform: Platform): ExternalLink[] {
    const links: ExternalLink[] = [];

    // Platform-specific community links
    switch (platform.id) {
      case 'vercel':
        links.push(
          {
            text: 'Vercel Community',
            url: 'https://github.com/vercel/vercel/discussions',
            type: 'documentation',
          },
          {
            text: 'Vercel Discord',
            url: 'https://vercel.com/discord',
            type: 'documentation',
          },
          {
            text: 'Vercel Support',
            url: 'https://vercel.com/support',
            type: 'documentation',
          }
        );
        break;

      case 'railway':
        links.push(
          {
            text: 'Railway Discord',
            url: 'https://discord.gg/railway',
            type: 'documentation',
          },
          {
            text: 'Railway Community Forum',
            url: 'https://help.railway.app',
            type: 'documentation',
          },
          {
            text: 'Railway Feedback',
            url: 'https://feedback.railway.app',
            type: 'documentation',
          }
        );
        break;

      case 'render':
        links.push(
          {
            text: 'Render Community',
            url: 'https://community.render.com',
            type: 'documentation',
          },
          {
            text: 'Render Discord',
            url: 'https://discord.gg/render',
            type: 'documentation',
          },
          {
            text: 'Render Support',
            url: 'https://render.com/support',
            type: 'documentation',
          }
        );
        break;

      case 'netlify':
        links.push(
          {
            text: 'Netlify Community',
            url: 'https://answers.netlify.com',
            type: 'documentation',
          },
          {
            text: 'Netlify Support',
            url: 'https://www.netlify.com/support',
            type: 'documentation',
          }
        );
        break;

      case 'aws-amplify':
        links.push(
          {
            text: 'AWS Amplify Discord',
            url: 'https://discord.gg/amplify',
            type: 'documentation',
          },
          {
            text: 'AWS Amplify GitHub Discussions',
            url: 'https://github.com/aws-amplify/amplify-js/discussions',
            type: 'documentation',
          },
          {
            text: 'AWS Support',
            url: 'https://aws.amazon.com/support',
            type: 'documentation',
          }
        );
        break;
    }

    // Add general helpful resources
    links.push(
      {
        text: 'Stack Overflow',
        url: `https://stackoverflow.com/questions/tagged/${platform.id}`,
        type: 'documentation',
      }
    );

    return links;
  }
}
