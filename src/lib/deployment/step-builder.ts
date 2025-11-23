import {
  Platform,
  DeploymentStep,
  DeploymentSubstep,
  CommandSnippet,
  ExternalLink,
  DeploymentRequirements,
  EnvironmentVariable,
} from '@/types/deployment-guides';

/**
 * StepBuilder
 * 
 * Builds deployment steps based on platform and requirements.
 * Generates platform-specific instructions for CLI installation,
 * repository setup, environment variables, database configuration,
 * build settings, and deployment commands.
 */
export class StepBuilder {
  /**
   * Build complete deployment steps for a platform and requirements
   * 
   * @param platform - The deployment platform
   * @param requirements - Analyzed deployment requirements
   * @param repositoryUrl - Optional GitHub repository URL if already created
   * @returns Array of deployment steps
   * 
   * Requirement 1.6: Skip repository creation steps if repo exists and pre-fill URLs
   */
  buildSteps(
    platform: Platform,
    requirements: DeploymentRequirements,
    repositoryUrl?: string | null
  ): DeploymentStep[] {
    const steps: DeploymentStep[] = [];
    let order = 1;

    // Prerequisites
    steps.push(this.buildPrerequisitesStep(platform, requirements, order++));

    // CLI installation (if applicable)
    if (this.platformHasCLI(platform)) {
      steps.push(this.buildCLIInstallStep(platform, order++));
    }

    // Repository setup - skip if repository URL is provided
    // Requirement 1.6: Skip repository creation steps if repo exists
    if (!repositoryUrl) {
      steps.push(this.buildRepositoryStep(order++));
    } else {
      // Add a simplified step acknowledging the existing repository
      steps.push(this.buildExistingRepositoryStep(repositoryUrl, order++));
    }

    // Platform-specific setup
    const platformSteps = this.buildPlatformSetupSteps(platform, requirements, order);
    steps.push(...platformSteps);
    order += platformSteps.length;

    // Environment variables
    if (requirements.environmentVariables.length > 0) {
      steps.push(
        this.buildEnvironmentVariablesStep(
          platform,
          requirements.environmentVariables,
          order++
        )
      );
    }

    // Database setup
    if (requirements.requiresDatabase) {
      steps.push(
        this.buildDatabaseStep(platform, requirements.databaseType || 'Database', order++)
      );
    }

    // Build configuration
    steps.push(this.buildBuildConfigStep(platform, requirements, order++));

    // Deploy
    steps.push(this.buildDeployStep(platform, order++));

    // Verify deployment
    steps.push(this.buildVerificationStep(order++));

    return steps;
  }

  /**
   * Build prerequisites step
   */
  buildPrerequisitesStep(
    platform: Platform,
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep {
    const prerequisites: string[] = [
      'Node.js 18+ installed',
      'Git installed',
      `${platform.name} account (free tier available)`,
    ];

    if (!this.platformHasCLI(platform)) {
      prerequisites.push('GitHub account (for repository connection)');
    }

    const description = `Before deploying to ${platform.name}, ensure you have the following:

${prerequisites.map(p => `• ${p}`).join('\n')}`;

    return {
      id: 'prerequisites',
      title: 'Prerequisites',
      description,
      order,
      required: true,
      externalLinks: [
        {
          text: `Sign up for ${platform.name}`,
          url: platform.pricingUrl,
          type: 'service',
        },
        {
          text: 'Install Node.js',
          url: 'https://nodejs.org',
          type: 'documentation',
        },
        {
          text: 'Install Git',
          url: 'https://git-scm.com/downloads',
          type: 'documentation',
        },
      ],
    };
  }

  /**
   * Build CLI installation step
   */
  buildCLIInstallStep(platform: Platform, order: number): DeploymentStep {
    const cliCommands = this.getCLIInstallCommands(platform);

    return {
      id: 'cli-install',
      title: `Install ${platform.name} CLI`,
      description: `Install the ${platform.name} command-line interface to deploy from your terminal.`,
      order,
      required: true,
      commands: cliCommands,
      externalLinks: [
        {
          text: `${platform.name} CLI Documentation`,
          url: `${platform.documentationUrl}/cli`,
          type: 'documentation',
        },
      ],
    };
  }

  /**
   * Build repository setup step
   */
  buildRepositoryStep(order: number): DeploymentStep {
    return {
      id: 'repository-setup',
      title: 'Prepare Your Repository',
      description:
        'Ensure your project is in a Git repository and pushed to GitHub, GitLab, or Bitbucket.',
      order,
      required: true,
      substeps: [
        {
          id: 'init-git',
          title: 'Initialize Git repository (if not already done)',
          description: 'Create a Git repository in your project directory',
          commands: [
            {
              id: 'git-init',
              command: 'git init',
              description: 'Initialize Git repository',
              language: 'bash',
            },
            {
              id: 'git-add',
              command: 'git add .',
              description: 'Stage all files',
              language: 'bash',
            },
            {
              id: 'git-commit',
              command: 'git commit -m "Initial commit"',
              description: 'Create initial commit',
              language: 'bash',
            },
          ],
        },
        {
          id: 'create-remote',
          title: 'Create a remote repository',
          description:
            'Create a new repository on GitHub, GitLab, or Bitbucket and push your code',
          externalLinks: [
            {
              text: 'Create GitHub Repository',
              url: 'https://github.com/new',
              type: 'service',
            },
          ],
        },
        {
          id: 'push-code',
          title: 'Push your code',
          description: 'Push your local repository to the remote',
          commands: [
            {
              id: 'git-remote',
              command: 'git remote add origin <your-repository-url>',
              description: 'Add remote repository',
              language: 'bash',
              placeholders: [
                {
                  key: '<your-repository-url>',
                  description: 'Your Git repository URL',
                  example: 'https://github.com/username/repo.git',
                },
              ],
            },
            {
              id: 'git-push',
              command: 'git push -u origin main',
              description: 'Push to remote repository',
              language: 'bash',
            },
          ],
        },
      ],
      notes: [
        'Make sure your .env file is in .gitignore to avoid committing secrets',
        'You can use the Cauldron2Code GitHub integration to create a repository automatically',
      ],
    };
  }

  /**
   * Build existing repository step (when repository URL is provided)
   * 
   * Requirement 1.6: Skip repository creation steps if repo exists
   */
  buildExistingRepositoryStep(repositoryUrl: string, order: number): DeploymentStep {
    return {
      id: 'existing-repository',
      title: 'Your Repository is Ready',
      description: `Your code has already been pushed to GitHub. You can proceed with connecting it to your deployment platform.`,
      order,
      required: true,
      externalLinks: [
        {
          text: 'View Your Repository',
          url: repositoryUrl,
          type: 'service',
        },
      ],
      notes: [
        `Repository: ${repositoryUrl}`,
        'Your code is already version controlled and ready for deployment',
      ],
    };
  }

  /**
   * Check if platform has a CLI
   */
  private platformHasCLI(platform: Platform): boolean {
    return ['vercel', 'railway'].includes(platform.id);
  }

  /**
   * Get CLI installation commands for a platform
   */
  private getCLIInstallCommands(platform: Platform): CommandSnippet[] {
    switch (platform.id) {
      case 'vercel':
        return [
          {
            id: 'vercel-cli-install',
            command: 'npm install -g vercel',
            description: 'Install Vercel CLI globally',
            language: 'bash',
          },
        ];
      case 'railway':
        return [
          {
            id: 'railway-cli-install',
            command: 'npm install -g @railway/cli',
            description: 'Install Railway CLI globally',
            language: 'bash',
          },
        ];
      default:
        return [];
    }
  }

  /**
   * Build platform-specific setup steps
   */
  buildPlatformSetupSteps(
    platform: Platform,
    requirements: DeploymentRequirements,
    startOrder: number
  ): DeploymentStep[] {
    switch (platform.id) {
      case 'vercel':
        return this.buildVercelSetupSteps(requirements, startOrder);
      case 'railway':
        return this.buildRailwaySetupSteps(requirements, startOrder);
      case 'render':
        return this.buildRenderSetupSteps(requirements, startOrder);
      case 'netlify':
        return this.buildNetlifySetupSteps(requirements, startOrder);
      case 'aws-amplify':
        return this.buildAWSAmplifySetupSteps(requirements, startOrder);
      default:
        return [];
    }
  }

  /**
   * Build Vercel-specific setup steps
   */
  private buildVercelSetupSteps(
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    return [
      {
        id: 'vercel-login',
        title: 'Login to Vercel',
        description: 'Authenticate with your Vercel account using the CLI',
        order,
        required: true,
        commands: [
          {
            id: 'vercel-login-cmd',
            command: 'vercel login',
            description: 'Opens browser for authentication',
            language: 'bash',
          },
        ],
        notes: [
          'This will open your browser to complete authentication',
          'You only need to do this once per machine',
        ],
      },
    ];
  }

  /**
   * Build Railway-specific setup steps
   */
  private buildRailwaySetupSteps(
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    return [
      {
        id: 'railway-login',
        title: 'Login to Railway',
        description: 'Authenticate with your Railway account using the CLI',
        order,
        required: true,
        commands: [
          {
            id: 'railway-login-cmd',
            command: 'railway login',
            description: 'Opens browser for authentication',
            language: 'bash',
          },
        ],
        notes: [
          'This will open your browser to complete authentication',
          'You only need to do this once per machine',
        ],
      },
      {
        id: 'railway-init',
        title: 'Initialize Railway Project',
        description: 'Create a new Railway project or link to an existing one',
        order: order + 1,
        required: true,
        commands: [
          {
            id: 'railway-init-cmd',
            command: 'railway init',
            description: 'Initialize Railway project',
            language: 'bash',
          },
        ],
        notes: [
          'Follow the prompts to create a new project or select an existing one',
          'This links your local directory to a Railway project',
        ],
      },
    ];
  }

  /**
   * Build Render-specific setup steps
   */
  private buildRenderSetupSteps(
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    return [
      {
        id: 'render-dashboard',
        title: 'Create New Web Service',
        description: 'Set up your application on Render using the dashboard',
        order,
        required: true,
        substeps: [
          {
            id: 'render-new-service',
            title: 'Navigate to Render Dashboard',
            description: 'Go to your Render dashboard and click "New +" then select "Web Service"',
            externalLinks: [
              {
                text: 'Render Dashboard',
                url: 'https://dashboard.render.com',
                type: 'service',
              },
            ],
          },
          {
            id: 'render-connect-repo',
            title: 'Connect Your Repository',
            description:
              'Connect your GitHub, GitLab, or Bitbucket account and select your repository',
          },
          {
            id: 'render-configure',
            title: 'Configure Service Settings',
            description: `Set the following:
• Name: Your application name
• Region: Choose closest to your users
• Branch: main (or your default branch)
• Build Command: Will be configured in next steps
• Start Command: Will be configured in next steps`,
          },
        ],
        notes: [
          'Render automatically detects many frameworks and suggests build commands',
          'You can modify these settings later if needed',
        ],
      },
    ];
  }

  /**
   * Build Netlify-specific setup steps
   */
  private buildNetlifySetupSteps(
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    return [
      {
        id: 'netlify-dashboard',
        title: 'Create New Site',
        description: 'Set up your application on Netlify using the dashboard',
        order,
        required: true,
        substeps: [
          {
            id: 'netlify-new-site',
            title: 'Navigate to Netlify Dashboard',
            description: 'Go to your Netlify dashboard and click "Add new site" then "Import an existing project"',
            externalLinks: [
              {
                text: 'Netlify Dashboard',
                url: 'https://app.netlify.com',
                type: 'service',
              },
            ],
          },
          {
            id: 'netlify-connect-repo',
            title: 'Connect Your Repository',
            description:
              'Connect your Git provider (GitHub, GitLab, or Bitbucket) and select your repository',
          },
          {
            id: 'netlify-configure',
            title: 'Configure Build Settings',
            description: `Netlify will auto-detect your framework. Verify:
• Branch to deploy: main
• Build command: Will be configured in next steps
• Publish directory: Will be configured in next steps`,
          },
        ],
        notes: [
          'Netlify has excellent auto-detection for popular frameworks',
          'For static sites, this is one of the easiest platforms to use',
        ],
      },
    ];
  }

  /**
   * Build AWS Amplify-specific setup steps
   */
  private buildAWSAmplifySetupSteps(
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    return [
      {
        id: 'amplify-console',
        title: 'Create New App in Amplify Console',
        description: 'Set up your application on AWS Amplify using the console',
        order,
        required: true,
        substeps: [
          {
            id: 'amplify-navigate',
            title: 'Navigate to AWS Amplify Console',
            description: 'Go to the AWS Amplify Console and click "New app" then "Host web app"',
            externalLinks: [
              {
                text: 'AWS Amplify Console',
                url: 'https://console.aws.amazon.com/amplify',
                type: 'service',
              },
            ],
          },
          {
            id: 'amplify-connect-repo',
            title: 'Connect Your Repository',
            description:
              'Select your Git provider (GitHub, GitLab, Bitbucket, or AWS CodeCommit) and authorize access',
          },
          {
            id: 'amplify-select-repo',
            title: 'Select Repository and Branch',
            description: 'Choose your repository and the branch you want to deploy (usually main)',
          },
          {
            id: 'amplify-configure',
            title: 'Configure Build Settings',
            description: `AWS Amplify will auto-detect your framework. Review:
• App name: Your application name
• Environment: production
• Build settings: Will be configured in next steps`,
          },
        ],
        notes: [
          'AWS Amplify integrates well with other AWS services',
          'Consider using AWS Amplify if you plan to use other AWS services',
        ],
        warnings: [
          'AWS Amplify requires an AWS account with billing enabled',
        ],
      },
    ];
  }

  /**
   * Build environment variables configuration step
   */
  buildEnvironmentVariablesStep(
    platform: Platform,
    vars: EnvironmentVariable[],
    order: number
  ): DeploymentStep {
    const substeps: DeploymentSubstep[] = vars.map((envVar, index) => {
      const commands = this.getEnvVarCommands(platform, envVar);
      const externalLinks: ExternalLink[] = [];

      if (envVar.link) {
        externalLinks.push({
          text: 'Get your key',
          url: envVar.link,
          type: 'service',
        });
      }

      return {
        id: `env-var-${index}`,
        title: `Set ${envVar.key}`,
        description: `${envVar.description}${envVar.example ? `\n\nExample: \`${envVar.example}\`` : ''}\n\nHow to get: ${envVar.howToGet}`,
        commands,
        externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
      };
    });

    const requiredCount = vars.filter(v => v.required).length;
    const optionalCount = vars.length - requiredCount;

    return {
      id: 'environment-variables',
      title: 'Configure Environment Variables',
      description: `Set up the required environment variables for your application. You need to configure ${requiredCount} required variable${requiredCount !== 1 ? 's' : ''}${optionalCount > 0 ? ` and ${optionalCount} optional variable${optionalCount !== 1 ? 's' : ''}` : ''}.

${this.getEnvVarInstructions(platform)}`,
      order,
      required: true,
      substeps,
      notes: [
        'Keep your environment variables secure and never commit them to your repository',
        'Most platforms allow you to set environment variables through their dashboard as well',
        'Environment variables will be available to your application at runtime',
      ],
      warnings: [
        'Never share API keys or secrets publicly',
        'Use different values for development and production environments',
      ],
    };
  }

  /**
   * Get platform-specific environment variable instructions
   */
  private getEnvVarInstructions(platform: Platform): string {
    switch (platform.id) {
      case 'vercel':
        return 'You can set environment variables using the Vercel CLI or through the Vercel dashboard under Project Settings → Environment Variables.';
      case 'railway':
        return 'You can set environment variables using the Railway CLI or through the Railway dashboard under your project\'s Variables tab.';
      case 'render':
        return 'Set environment variables in the Render dashboard under your service\'s Environment tab.';
      case 'netlify':
        return 'Set environment variables in the Netlify dashboard under Site settings → Environment variables.';
      case 'aws-amplify':
        return 'Set environment variables in the AWS Amplify Console under App settings → Environment variables.';
      default:
        return 'Set environment variables through your platform\'s dashboard or CLI.';
    }
  }

  /**
   * Get platform-specific commands for setting environment variables
   */
  private getEnvVarCommands(
    platform: Platform,
    envVar: EnvironmentVariable
  ): CommandSnippet[] {
    const commands: CommandSnippet[] = [];

    switch (platform.id) {
      case 'vercel':
        commands.push({
          id: `vercel-env-${envVar.key}`,
          command: `vercel env add ${envVar.key}`,
          description: 'Add environment variable via CLI (you will be prompted for the value)',
          language: 'bash',
        });
        break;

      case 'railway':
        commands.push({
          id: `railway-env-${envVar.key}`,
          command: `railway variables set ${envVar.key}=<value>`,
          description: 'Set environment variable via CLI',
          language: 'bash',
          placeholders: [
            {
              key: '<value>',
              description: envVar.howToGet,
              example: envVar.example || '',
            },
          ],
        });
        break;

      default:
        // For platforms without CLI, provide dashboard instructions
        break;
    }

    return commands;
  }

  /**
   * Build database setup step
   */
  buildDatabaseStep(
    platform: Platform,
    databaseType: string,
    order: number
  ): DeploymentStep {
    const platformSupportsDB = platform.features.databaseSupport;

    return {
      id: 'database-setup',
      title: `Set Up ${databaseType} Database`,
      description: platformSupportsDB
        ? `${platform.name} ${this.getPlatformDatabaseSupport(platform, databaseType)}`
        : `Set up a ${databaseType} database using an external service. ${platform.name} does not provide built-in database hosting.`,
      order,
      required: true,
      substeps: platformSupportsDB
        ? this.getPlatformDatabaseSteps(platform, databaseType)
        : this.getExternalDatabaseSteps(databaseType),
      externalLinks: this.getDatabaseLinks(platform, databaseType),
      notes: [
        'Make sure to save your database connection string securely',
        'Test the database connection before deploying your application',
      ],
    };
  }

  /**
   * Get platform database support description
   */
  private getPlatformDatabaseSupport(platform: Platform, databaseType: string): string {
    switch (platform.id) {
      case 'vercel':
        return 'integrates with various database providers. You can use Vercel Postgres or connect to external databases.';
      case 'railway':
        return 'can provision PostgreSQL, MySQL, MongoDB, and Redis databases directly in your project.';
      case 'render':
        return 'can provision PostgreSQL databases directly in your project.';
      default:
        return 'supports database connections.';
    }
  }

  /**
   * Get platform-specific database provisioning steps
   */
  private getPlatformDatabaseSteps(
    platform: Platform,
    databaseType: string
  ): DeploymentSubstep[] {
    switch (platform.id) {
      case 'railway':
        return [
          {
            id: 'railway-db-provision',
            title: 'Provision Database on Railway',
            description: `Railway can provision a ${databaseType} database for you:

1. In your Railway project dashboard, click "New"
2. Select "Database" then choose "${databaseType}"
3. Railway will automatically provision the database
4. The DATABASE_URL will be automatically available to your application`,
            externalLinks: [
              {
                text: 'Railway Database Documentation',
                url: 'https://docs.railway.app/databases/postgresql',
                type: 'documentation',
              },
            ],
          },
          {
            id: 'railway-db-connect',
            title: 'Database Connection',
            description:
              'Railway automatically injects the DATABASE_URL environment variable. No manual configuration needed!',
          },
        ];

      case 'render':
        return [
          {
            id: 'render-db-provision',
            title: 'Create PostgreSQL Database on Render',
            description: `Create a PostgreSQL database on Render:

1. In your Render dashboard, click "New +" then "PostgreSQL"
2. Choose a name for your database
3. Select the free tier or your preferred plan
4. Click "Create Database"
5. Copy the "Internal Database URL" from the database info page`,
            externalLinks: [
              {
                text: 'Render PostgreSQL Documentation',
                url: 'https://render.com/docs/databases',
                type: 'documentation',
              },
            ],
          },
          {
            id: 'render-db-connect',
            title: 'Connect Database to Your Service',
            description:
              'Add the DATABASE_URL environment variable to your web service with the Internal Database URL you copied',
          },
        ];

      case 'vercel':
        return [
          {
            id: 'vercel-db-options',
            title: 'Choose Database Option',
            description: `Vercel offers several database options:

• Vercel Postgres (recommended for PostgreSQL)
• Connect to external providers (Supabase, PlanetScale, MongoDB Atlas, etc.)`,
          },
          {
            id: 'vercel-postgres',
            title: 'Option 1: Use Vercel Postgres',
            description: `To use Vercel Postgres:

1. Go to your project in Vercel dashboard
2. Navigate to Storage tab
3. Click "Create Database" and select "Postgres"
4. Follow the prompts to create your database
5. Vercel will automatically add the connection string to your environment variables`,
            externalLinks: [
              {
                text: 'Vercel Postgres Documentation',
                url: 'https://vercel.com/docs/storage/vercel-postgres',
                type: 'documentation',
              },
            ],
          },
          {
            id: 'vercel-external',
            title: 'Option 2: Use External Database',
            description:
              'If using an external database provider, add the DATABASE_URL to your environment variables in the Vercel dashboard',
          },
        ];

      default:
        return this.getExternalDatabaseSteps(databaseType);
    }
  }

  /**
   * Get external database service steps
   */
  private getExternalDatabaseSteps(databaseType: string): DeploymentSubstep[] {
    const steps: DeploymentSubstep[] = [
      {
        id: 'external-db-choose',
        title: 'Choose a Database Provider',
        description: this.getDatabaseProviderRecommendations(databaseType),
        externalLinks: this.getExternalDatabaseLinks(databaseType),
      },
      {
        id: 'external-db-create',
        title: 'Create a Database',
        description:
          'Sign up for your chosen provider and create a new database instance. Most providers offer free tiers.',
      },
      {
        id: 'external-db-connection',
        title: 'Get Connection String',
        description:
          'Copy the connection string from your database provider. This usually looks like a URL with credentials.',
      },
      {
        id: 'external-db-configure',
        title: 'Add to Environment Variables',
        description:
          'Add the connection string as DATABASE_URL (or MONGODB_URI for MongoDB) in your deployment platform\'s environment variables',
      },
    ];

    return steps;
  }

  /**
   * Get database provider recommendations
   */
  private getDatabaseProviderRecommendations(databaseType: string): string {
    if (databaseType.includes('PostgreSQL')) {
      return `Recommended PostgreSQL providers:

• **Supabase** - Great free tier, includes auth and storage
• **Neon** - Serverless PostgreSQL with generous free tier
• **PlanetScale** - MySQL-compatible, excellent developer experience
• **Railway** - Simple setup, includes PostgreSQL
• **ElephantSQL** - Dedicated PostgreSQL hosting`;
    }

    if (databaseType.includes('MongoDB')) {
      return `Recommended MongoDB providers:

• **MongoDB Atlas** - Official MongoDB cloud service with free tier
• **Railway** - Simple MongoDB hosting`;
    }

    if (databaseType.includes('MySQL')) {
      return `Recommended MySQL providers:

• **PlanetScale** - Serverless MySQL with excellent free tier
• **Railway** - Simple MySQL hosting`;
    }

    return 'Choose a database provider that offers a free tier and good documentation.';
  }

  /**
   * Get external database service links
   */
  private getExternalDatabaseLinks(databaseType: string): ExternalLink[] {
    const links: ExternalLink[] = [];

    if (databaseType.includes('PostgreSQL')) {
      links.push(
        {
          text: 'Supabase',
          url: 'https://supabase.com',
          type: 'service',
        },
        {
          text: 'Neon',
          url: 'https://neon.tech',
          type: 'service',
        },
        {
          text: 'Railway',
          url: 'https://railway.app',
          type: 'service',
        }
      );
    }

    if (databaseType.includes('MongoDB')) {
      links.push({
        text: 'MongoDB Atlas',
        url: 'https://www.mongodb.com/cloud/atlas',
        type: 'service',
      });
    }

    if (databaseType.includes('MySQL')) {
      links.push({
        text: 'PlanetScale',
        url: 'https://planetscale.com',
        type: 'service',
      });
    }

    return links;
  }

  /**
   * Get database documentation links
   */
  private getDatabaseLinks(platform: Platform, databaseType: string): ExternalLink[] {
    const links: ExternalLink[] = [];

    if (platform.features.databaseSupport) {
      links.push({
        text: `${platform.name} Database Documentation`,
        url: `${platform.documentationUrl}/databases`,
        type: 'documentation',
      });
    }

    return links;
  }

  /**
   * Build build configuration step
   */
  buildBuildConfigStep(
    platform: Platform,
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep {
    const buildCommand = this.getBuildCommand(requirements.framework);
    const startCommand = this.getStartCommand(requirements.framework);
    const outputDirectory = this.getOutputDirectory(requirements.framework);

    return {
      id: 'build-configuration',
      title: 'Configure Build Settings',
      description: `Configure how ${platform.name} should build and run your application.`,
      order,
      required: true,
      substeps: this.getBuildConfigSubsteps(
        platform,
        requirements,
        buildCommand,
        startCommand,
        outputDirectory
      ),
      notes: [
        'Most platforms auto-detect these settings for popular frameworks',
        'You can always modify these settings later in your platform dashboard',
      ],
    };
  }

  /**
   * Get build configuration substeps
   */
  private getBuildConfigSubsteps(
    platform: Platform,
    requirements: DeploymentRequirements,
    buildCommand: string,
    startCommand: string,
    outputDirectory: string
  ): DeploymentSubstep[] {
    const substeps: DeploymentSubstep[] = [];

    if (['vercel', 'railway'].includes(platform.id)) {
      // CLI-based platforms
      substeps.push({
        id: 'build-config-auto',
        title: 'Automatic Detection',
        description: `${platform.name} will automatically detect your ${requirements.framework} project and configure build settings. The following will be used:

• Build Command: \`${buildCommand}\`
• Start Command: \`${startCommand}\`${outputDirectory ? `\n• Output Directory: \`${outputDirectory}\`` : ''}`,
      });
    } else {
      // Dashboard-based platforms
      substeps.push({
        id: 'build-config-manual',
        title: 'Set Build Configuration',
        description: `In your ${platform.name} dashboard, configure the following settings:

• **Build Command**: \`${buildCommand}\`
• **Start Command**: \`${startCommand}\`${outputDirectory ? `\n• **Publish Directory**: \`${outputDirectory}\`` : ''}

${platform.name} may auto-detect these for ${requirements.framework} projects.`,
      });
    }

    // Add Node.js version configuration
    substeps.push({
      id: 'build-config-node',
      title: 'Set Node.js Version (Optional)',
      description: `Ensure your platform uses the same Node.js version as your local environment. You can specify this in your package.json:`,
      commands: [
        {
          id: 'node-version-example',
          command: `{
  "engines": {
    "node": ">=18.0.0"
  }
}`,
          description: 'Add to your package.json',
          language: 'bash',
        },
      ],
    });

    return substeps;
  }

  /**
   * Get build command for framework
   */
  private getBuildCommand(framework: string): string {
    const commands: Record<string, string> = {
      'Next.js': 'npm run build',
      'React': 'npm run build',
      'Vue': 'npm run build',
      'Angular': 'npm run build',
      'Svelte': 'npm run build',
    };

    return commands[framework] || 'npm run build';
  }

  /**
   * Get start command for framework
   */
  private getStartCommand(framework: string): string {
    const commands: Record<string, string> = {
      'Next.js': 'npm run start',
      'React': 'npm run start',
      'Vue': 'npm run start',
      'Angular': 'npm run start',
      'Svelte': 'npm run start',
    };

    return commands[framework] || 'npm run start';
  }

  /**
   * Get output directory for framework
   */
  private getOutputDirectory(framework: string): string {
    const directories: Record<string, string> = {
      'Next.js': '.next',
      'React': 'build',
      'Vue': 'dist',
      'Angular': 'dist',
      'Svelte': 'public',
    };

    return directories[framework] || 'dist';
  }

  /**
   * Build deploy step
   */
  buildDeployStep(platform: Platform, order: number): DeploymentStep {
    return {
      id: 'deploy',
      title: 'Deploy Your Application',
      description: `Deploy your application to ${platform.name}.`,
      order,
      required: true,
      substeps: this.getDeploySubsteps(platform),
      notes: [
        'The first deployment may take a few minutes',
        'Subsequent deployments are usually faster',
        'You will receive a URL where your application is deployed',
      ],
    };
  }

  /**
   * Get deployment substeps for platform
   */
  private getDeploySubsteps(platform: Platform): DeploymentSubstep[] {
    switch (platform.id) {
      case 'vercel':
        return [
          {
            id: 'vercel-deploy',
            title: 'Deploy with Vercel CLI',
            description: 'Run the deploy command from your project directory',
            commands: [
              {
                id: 'vercel-deploy-cmd',
                command: 'vercel --prod',
                description: 'Deploy to production',
                language: 'bash',
              },
            ],
          },
          {
            id: 'vercel-deploy-result',
            title: 'Get Deployment URL',
            description:
              'Vercel will provide a production URL (e.g., your-app.vercel.app). Save this URL for configuring OAuth callbacks and other services.',
          },
        ];

      case 'railway':
        return [
          {
            id: 'railway-deploy',
            title: 'Deploy with Railway CLI',
            description: 'Run the deploy command from your project directory',
            commands: [
              {
                id: 'railway-deploy-cmd',
                command: 'railway up',
                description: 'Deploy to Railway',
                language: 'bash',
              },
            ],
          },
          {
            id: 'railway-deploy-result',
            title: 'Get Deployment URL',
            description:
              'Railway will provide a deployment URL. You can also set up a custom domain in the Railway dashboard.',
          },
        ];

      case 'render':
        return [
          {
            id: 'render-deploy',
            title: 'Deploy from Dashboard',
            description: `After configuring all settings in the Render dashboard:

1. Review your configuration
2. Click "Create Web Service"
3. Render will automatically build and deploy your application
4. Monitor the build logs in the dashboard`,
          },
          {
            id: 'render-deploy-result',
            title: 'Get Deployment URL',
            description:
              'Once deployed, Render will provide a URL (e.g., your-app.onrender.com). You can set up a custom domain in the settings.',
          },
        ];

      case 'netlify':
        return [
          {
            id: 'netlify-deploy',
            title: 'Deploy from Dashboard',
            description: `After configuring all settings in the Netlify dashboard:

1. Review your configuration
2. Click "Deploy site"
3. Netlify will automatically build and deploy your application
4. Monitor the build logs in the dashboard`,
          },
          {
            id: 'netlify-deploy-result',
            title: 'Get Deployment URL',
            description:
              'Once deployed, Netlify will provide a URL (e.g., your-app.netlify.app). You can set up a custom domain in the settings.',
          },
        ];

      case 'aws-amplify':
        return [
          {
            id: 'amplify-deploy',
            title: 'Deploy from Console',
            description: `After configuring all settings in the AWS Amplify Console:

1. Review your configuration
2. Click "Save and deploy"
3. AWS Amplify will automatically build and deploy your application
4. Monitor the build logs in the console`,
          },
          {
            id: 'amplify-deploy-result',
            title: 'Get Deployment URL',
            description:
              'Once deployed, AWS Amplify will provide a URL (e.g., main.xxxxx.amplifyapp.com). You can set up a custom domain in the settings.',
          },
        ];

      default:
        return [];
    }
  }

  /**
   * Build verification step
   */
  buildVerificationStep(order: number): DeploymentStep {
    return {
      id: 'verification',
      title: 'Verify Deployment',
      description: 'Test your deployed application to ensure everything works correctly.',
      order,
      required: true,
      substeps: [
        {
          id: 'verify-access',
          title: 'Access Your Application',
          description:
            'Open the deployment URL in your browser and verify the application loads correctly',
        },
        {
          id: 'verify-functionality',
          title: 'Test Core Functionality',
          description: `Test the main features of your application:

• Navigation works correctly
• Pages load without errors
• Forms submit successfully
• Authentication works (if applicable)
• Database connections work (if applicable)`,
        },
        {
          id: 'verify-console',
          title: 'Check Browser Console',
          description:
            'Open browser developer tools (F12) and check for any errors in the console',
        },
        {
          id: 'verify-logs',
          title: 'Check Platform Logs',
          description:
            'Review deployment logs in your platform dashboard for any warnings or errors',
        },
      ],
      notes: [
        'If you encounter issues, check the troubleshooting section below',
        'Most platforms provide detailed logs to help diagnose problems',
      ],
    };
  }

  /**
   * Build monorepo-specific deployment steps
   * These steps are added when the project is a monorepo
   */
  buildMonorepoSteps(
    platform: Platform,
    requirements: DeploymentRequirements,
    order: number
  ): DeploymentStep[] {
    if (!requirements.isMonorepo) {
      return [];
    }

    return [
      {
        id: 'monorepo-overview',
        title: 'Monorepo Deployment Strategy',
        description: `Your project is a monorepo with multiple services. You'll need to deploy each service separately.

**Typical monorepo structure:**
• Frontend application (e.g., Next.js, React)
• Backend API (e.g., Express, Fastify)
• Shared packages/libraries

Each service should be deployed as a separate application on ${platform.name}.`,
        order,
        required: true,
        notes: [
          'Deploy services in order of dependencies (backend first, then frontend)',
          'Each service will have its own deployment URL',
          'Configure environment variables to connect services',
        ],
      },
      {
        id: 'monorepo-backend',
        title: 'Deploy Backend Service',
        description: this.getMonorepoBackendInstructions(platform),
        order: order + 1,
        required: true,
        substeps: this.getMonorepoBackendSubsteps(platform),
      },
      {
        id: 'monorepo-frontend',
        title: 'Deploy Frontend Service',
        description: this.getMonorepoFrontendInstructions(platform),
        order: order + 2,
        required: true,
        substeps: this.getMonorepoFrontendSubsteps(platform),
      },
      {
        id: 'monorepo-connect',
        title: 'Connect Services',
        description: 'Configure your frontend to communicate with your backend API.',
        order: order + 3,
        required: true,
        substeps: [
          {
            id: 'monorepo-backend-url',
            title: 'Get Backend URL',
            description:
              'Copy the deployment URL of your backend service (e.g., https://your-api.railway.app)',
          },
          {
            id: 'monorepo-frontend-env',
            title: 'Configure Frontend Environment Variable',
            description: `Add the backend URL as an environment variable in your frontend deployment:

• Variable name: \`NEXT_PUBLIC_API_URL\` (or similar)
• Value: Your backend deployment URL

This allows your frontend to make API calls to your backend.`,
          },
          {
            id: 'monorepo-cors',
            title: 'Configure CORS',
            description: `Ensure your backend allows requests from your frontend domain. Update your backend CORS configuration to include your frontend URL.`,
          },
        ],
        notes: [
          'Use environment variables to avoid hardcoding URLs',
          'Test the connection between services after deployment',
        ],
      },
    ];
  }

  /**
   * Get monorepo backend deployment instructions
   */
  private getMonorepoBackendInstructions(platform: Platform): string {
    switch (platform.id) {
      case 'vercel':
        return `Deploy your backend service to Vercel. Note that Vercel is optimized for frontend frameworks, so consider using Railway or Render for your backend if you need long-running processes.`;
      case 'railway':
        return `Railway is excellent for backend services. Deploy your backend API as a separate service.`;
      case 'render':
        return `Render supports backend services well. Deploy your backend API as a Web Service.`;
      default:
        return `Deploy your backend service first, as your frontend will need to connect to it.`;
    }
  }

  /**
   * Get monorepo backend deployment substeps
   */
  private getMonorepoBackendSubsteps(platform: Platform): DeploymentSubstep[] {
    const substeps: DeploymentSubstep[] = [
      {
        id: 'monorepo-backend-root',
        title: 'Set Root Directory',
        description: `Configure ${platform.name} to use your backend directory as the root:

• Root Directory: \`apps/backend\` (or your backend path)
• Build Command: \`npm run build\`
• Start Command: \`npm run start\``,
      },
    ];

    if (platform.id === 'railway') {
      substeps.push({
        id: 'monorepo-backend-railway',
        title: 'Deploy Backend to Railway',
        description: `From your project root, deploy the backend:

1. Create a new Railway service
2. Connect your repository
3. Set the root directory to your backend folder
4. Railway will detect and deploy your backend`,
        commands: [
          {
            id: 'railway-backend-deploy',
            command: 'railway up --service backend',
            description: 'Deploy backend service',
            language: 'bash',
          },
        ],
      });
    }

    return substeps;
  }

  /**
   * Get monorepo frontend deployment instructions
   */
  private getMonorepoFrontendInstructions(platform: Platform): string {
    return `Deploy your frontend application after the backend is running. The frontend will connect to the backend API using environment variables.`;
  }

  /**
   * Get monorepo frontend deployment substeps
   */
  private getMonorepoFrontendSubsteps(platform: Platform): DeploymentSubstep[] {
    const substeps: DeploymentSubstep[] = [
      {
        id: 'monorepo-frontend-root',
        title: 'Set Root Directory',
        description: `Configure ${platform.name} to use your frontend directory as the root:

• Root Directory: \`apps/frontend\` (or your frontend path)
• Build Command: \`npm run build\`
• Start Command: \`npm run start\``,
      },
    ];

    if (platform.id === 'vercel') {
      substeps.push({
        id: 'monorepo-frontend-vercel',
        title: 'Deploy Frontend to Vercel',
        description: `Vercel has excellent monorepo support:

1. Import your repository in Vercel
2. Vercel will auto-detect your framework
3. Set the root directory to your frontend folder
4. Configure environment variables (including API URL)
5. Deploy`,
        commands: [
          {
            id: 'vercel-frontend-deploy',
            command: 'vercel --prod',
            description: 'Deploy frontend to production',
            language: 'bash',
          },
        ],
      });
    } else if (platform.id === 'railway') {
      substeps.push({
        id: 'monorepo-frontend-railway',
        title: 'Deploy Frontend to Railway',
        description: `Deploy the frontend as a separate service:

1. Create a new Railway service
2. Connect the same repository
3. Set the root directory to your frontend folder
4. Configure environment variables (including API URL)
5. Railway will detect and deploy your frontend`,
        commands: [
          {
            id: 'railway-frontend-deploy',
            command: 'railway up --service frontend',
            description: 'Deploy frontend service',
            language: 'bash',
          },
        ],
      });
    }

    return substeps;
  }
}
