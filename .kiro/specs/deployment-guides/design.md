# Deployment Guides Technical Design

## Overview

The Deployment Guides feature provides comprehensive, step-by-step deployment instructions tailored to each user's generated project configuration. Instead of automating deployment, this feature educates users on how to deploy their projects themselves, giving them full control and understanding of the deployment process. The system generates contextual guides based on the scaffold configuration and presents them in an interactive, easy-to-follow format.

## Architecture

```mermaid
graph TB
    A[Generation Complete] --> B[Deployment Options UI]
    B --> C[Platform Selector]
    C --> D[Guide Generator]
    D --> E[Configuration Analyzer]
    E --> F[Step Builder]
    F --> G[Guide Renderer]
    G --> H[Interactive Guide UI]
    H --> I[Progress Tracker]
    I --> J[Local Storage]
```

### Architecture Layers

1. **Presentation Layer**: Platform selector and interactive guide UI
2. **Generation Layer**: Guide generation based on scaffold configuration
3. **Content Layer**: Platform-specific templates and step definitions
4. **Persistence Layer**: Progress tracking in browser storage

## Technology Stack

### No New Dependencies Required

The feature uses existing Next.js, React, and TypeScript infrastructure. All functionality can be built with:
- React components for UI
- TypeScript for type safety
- Local Storage API for progress persistence
- Markdown rendering for guide content (if needed)

## Data Models

### Platform Definition

```typescript
interface Platform {
  id: 'vercel' | 'railway' | 'render' | 'netlify' | 'aws-amplify';
  name: string;
  description: string;
  logo: string;
  bestFor: string[];
  features: PlatformFeatures;
  documentationUrl: string;
  pricingUrl: string;
}

interface PlatformFeatures {
  freeTi
er: boolean;
  databaseSupport: boolean;
  customDomains: boolean;
  buildMinutes: string;
  easeOfUse: 'beginner' | 'intermediate' | 'advanced';
}
```

### Deployment Guide

```typescript
interface DeploymentGuide {
  id: string;
  platform: Platform;
  scaffoldConfig: ScaffoldConfig;
  steps: DeploymentStep[];
  postDeploymentChecklist: ChecklistItem[];
  troubleshooting: TroubleshootingSection;
  estimatedTime: string;
}
```

### Deployment Step

```typescript
interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  order: number;
  required: boolean;
  substeps?: DeploymentSubstep[];
  commands?: CommandSnippet[];
  codeSnippets?: CodeSnippet[];
  externalLinks?: ExternalLink[];
  notes?: string[];
  warnings?: string[];
}
```

### Deployment Substep

```typescript
interface DeploymentSubstep {
  id: string;
  title: string;
  description: string;
  commands?: CommandSnippet[];
  externalLinks?: ExternalLink[];
}
```

### Command Snippet

```typescript
interface CommandSnippet {
  id: string;
  command: string;
  description: string;
  language: 'bash' | 'powershell' | 'cmd';
  placeholders?: Placeholder[];
}

interface Placeholder {
  key: string;
  description: string;
  example: string;
  actualValue?: string; // Pre-filled if known
}
```

### Code Snippet

```typescript
interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  filename?: string;
  description?: string;
}
```

### External Link

```typescript
interface ExternalLink {
  text: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'service' | 'status';
}
```

### Checklist Item

```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  commands?: CommandSnippet[];
  externalLinks?: ExternalLink[];
  completed: boolean;
}
```


### Troubleshooting Section

```typescript
interface TroubleshootingSection {
  commonIssues: TroubleshootingIssue[];
  platformStatusUrl: string;
  communityLinks: ExternalLink[];
}

interface TroubleshootingIssue {
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  relatedLinks?: ExternalLink[];
}
```

### Guide Progress

```typescript
interface GuideProgress {
  guideId: string;
  completedSteps: string[]; // Array of step IDs
  completedChecklistItems: string[]; // Array of checklist item IDs
  lastUpdated: Date;
  viewMode: 'quick-start' | 'detailed';
}
```

## Component Structure

### Pages

```
app/
├── guides/
│   ├── page.tsx                    # Platform selector
│   └── [platform]/
│       └── [configId]/
│           └── page.tsx            # Deployment guide display
```

### Key Components

```
components/
├── guides/
│   ├── PlatformSelector.tsx        # Grid of platform options
│   ├── PlatformCard.tsx            # Individual platform card
│   ├── PlatformComparison.tsx      # Comparison table
│   ├── DeploymentGuide.tsx         # Main guide container
│   ├── GuideStep.tsx               # Individual step display
│   ├── GuideProgress.tsx           # Progress indicator
│   ├── CommandBlock.tsx            # Command with copy button
│   ├── CodeBlock.tsx               # Code snippet with copy
│   ├── ChecklistSection.tsx        # Post-deployment checklist
│   ├── TroubleshootingSection.tsx  # Common issues
│   ├── ViewModeToggle.tsx          # Quick start vs detailed
│   └── GuideExport.tsx             # Print/export functionality
```


## Guide Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant GuideGenerator
    participant ConfigAnalyzer
    participant StepBuilder
    participant Storage
    
    User->>UI: Complete scaffold generation
    UI->>User: Show "View Deployment Guides"
    User->>UI: Click "View Deployment Guides"
    UI->>User: Display platform selector
    User->>UI: Select platform (e.g., Vercel)
    UI->>GuideGenerator: Generate guide for platform + config
    GuideGenerator->>ConfigAnalyzer: Analyze scaffold config
    ConfigAnalyzer-->>GuideGenerator: Return required features
    GuideGenerator->>StepBuilder: Build steps for features
    StepBuilder-->>GuideGenerator: Return step list
    GuideGenerator-->>UI: Return complete guide
    UI->>Storage: Load saved progress
    Storage-->>UI: Return completed steps
    UI->>User: Display interactive guide
    User->>UI: Mark step complete
    UI->>Storage: Save progress
    User->>UI: Copy command
    UI->>User: Show "Copied!" confirmation
```

## Platform-Specific Guide Templates

### Vercel Guide Structure

```typescript
const vercelGuideTemplate = {
  prerequisites: [
    'Node.js installed',
    'Git installed',
    'Vercel account (free)',
    'GitHub repository created',
  ],
  steps: [
    {
      title: 'Install Vercel CLI',
      commands: ['npm install -g vercel'],
    },
    {
      title: 'Navigate to Project',
      commands: ['cd your-project-name'],
    },
    {
      title: 'Login to Vercel',
      commands: ['vercel login'],
    },
    {
      title: 'Deploy Project',
      commands: ['vercel --prod'],
    },
    // Dynamic steps based on config
  ],
};
```


### Railway Guide Structure

```typescript
const railwayGuideTemplate = {
  prerequisites: [
    'Railway account (free)',
    'GitHub repository created',
  ],
  steps: [
    {
      title: 'Install Railway CLI',
      commands: ['npm install -g @railway/cli'],
    },
    {
      title: 'Login to Railway',
      commands: ['railway login'],
    },
    {
      title: 'Initialize Project',
      commands: ['railway init'],
    },
    {
      title: 'Link GitHub Repository',
      description: 'Connect your GitHub repo in Railway dashboard',
    },
    {
      title: 'Deploy',
      commands: ['railway up'],
    },
    // Dynamic steps for database, env vars, etc.
  ],
};
```

### Render Guide Structure

```typescript
const renderGuideTemplate = {
  prerequisites: [
    'Render account (free)',
    'GitHub repository created',
  ],
  steps: [
    {
      title: 'Create New Web Service',
      description: 'Go to Render dashboard and click "New +" → "Web Service"',
    },
    {
      title: 'Connect Repository',
      description: 'Connect your GitHub account and select the repository',
    },
    {
      title: 'Configure Build Settings',
      // Dynamic based on framework
    },
    {
      title: 'Set Environment Variables',
      // Dynamic based on config
    },
    {
      title: 'Deploy',
      description: 'Click "Create Web Service" to start deployment',
    },
  ],
};
```


## Configuration Analyzer

```typescript
class ConfigurationAnalyzer {
  analyze(config: ScaffoldConfig): DeploymentRequirements {
    return {
      requiresDatabase: config.database !== 'none',
      databaseType: this.getDatabaseType(config.database),
      requiresAuth: config.auth !== 'none',
      authProvider: config.auth,
      requiresAI: config.aiTemplate !== 'none',
      requiresRedis: config.extras.redis,
      isMonorepo: config.projectStructure === 'fullstack-monorepo',
      framework: config.frontendFramework,
      buildTool: config.buildTool,
      environmentVariables: this.detectEnvironmentVariables(config),
    };
  }

  private detectEnvironmentVariables(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];

    if (config.database !== 'none') {
      vars.push({
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        required: true,
        example: 'postgresql://user:password@host:5432/dbname',
        howToGet: 'Create a database on your platform or use a service like Supabase',
      });
    }

    if (config.auth === 'nextauth') {
      vars.push(
        {
          key: 'NEXTAUTH_SECRET',
          description: 'Secret for NextAuth.js session encryption',
          required: true,
          example: 'generated-secret-key',
          howToGet: 'Generate with: openssl rand -base64 32',
        },
        {
          key: 'NEXTAUTH_URL',
          description: 'Canonical URL of your site',
          required: true,
          example: 'https://your-app.vercel.app',
          howToGet: 'Use your deployment URL',
        }
      );
    }

    if (config.auth === 'clerk') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          description: 'Clerk publishable key',
          required: true,
          howToGet: 'Get from Clerk dashboard',
          link: 'https://dashboard.clerk.com',
        },
        {
          key: 'CLERK_SECRET_KEY',
          description: 'Clerk secret key',
          required: true,
          howToGet: 'Get from Clerk dashboard',
          link: 'https://dashboard.clerk.com',
        }
      );
    }

    if (config.aiTemplate && config.aiTemplate !== 'none') {
      vars.push({
        key: 'ANTHROPIC_API_KEY',
        description: 'Anthropic API key for AI features',
        required: true,
        example: 'sk-ant-...',
        howToGet: 'Get from Anthropic Console',
        link: 'https://console.anthropic.com/settings/keys',
      });
    }

    return vars;
  }

  private getDatabaseType(database: string): string {
    if (database.includes('postgres')) return 'PostgreSQL';
    if (database.includes('mysql')) return 'MySQL';
    if (database.includes('mongodb')) return 'MongoDB';
    return 'Database';
  }
}

interface DeploymentRequirements {
  requiresDatabase: boolean;
  databaseType?: string;
  requiresAuth: boolean;
  authProvider?: string;
  requiresAI: boolean;
  requiresRedis: boolean;
  isMonorepo: boolean;
  framework: string;
  buildTool: string;
  environmentVariables: EnvironmentVariable[];
}

interface EnvironmentVariable {
  key: string;
  description: string;
  required: boolean;
  example?: string;
  howToGet: string;
  link?: string;
}
```


## Step Builder

```typescript
class StepBuilder {
  buildSteps(
    platform: Platform,
    requirements: DeploymentRequirements
  ): DeploymentStep[] {
    const steps: DeploymentStep[] = [];

    // Prerequisites
    steps.push(this.buildPrerequisitesStep(platform));

    // CLI installation (if applicable)
    if (this.platformHasCLI(platform)) {
      steps.push(this.buildCLIInstallStep(platform));
    }

    // Repository setup
    steps.push(this.buildRepositoryStep());

    // Platform-specific setup
    steps.push(...this.buildPlatformSetupSteps(platform, requirements));

    // Environment variables
    if (requirements.environmentVariables.length > 0) {
      steps.push(this.buildEnvironmentVariablesStep(
        platform,
        requirements.environmentVariables
      ));
    }

    // Database setup
    if (requirements.requiresDatabase) {
      steps.push(this.buildDatabaseStep(platform, requirements.databaseType));
    }

    // Build configuration
    steps.push(this.buildBuildConfigStep(platform, requirements));

    // Deploy
    steps.push(this.buildDeployStep(platform));

    // Verify deployment
    steps.push(this.buildVerificationStep());

    return steps;
  }

  private buildEnvironmentVariablesStep(
    platform: Platform,
    vars: EnvironmentVariable[]
  ): DeploymentStep {
    const substeps = vars.map((envVar, index) => ({
      id: `env-var-${index}`,
      title: `Set ${envVar.key}`,
      description: envVar.description,
      commands: this.getEnvVarCommand(platform, envVar),
      externalLinks: envVar.link ? [{
        text: 'Get your key',
        url: envVar.link,
        type: 'service' as const,
      }] : [],
    }));

    return {
      id: 'environment-variables',
      title: 'Configure Environment Variables',
      description: 'Set up the required environment variables for your application',
      order: 5,
      required: true,
      substeps,
      notes: [
        'Keep your environment variables secure',
        'Never commit secrets to your repository',
      ],
    };
  }

  private getEnvVarCommand(
    platform: Platform,
    envVar: EnvironmentVariable
  ): CommandSnippet[] {
    switch (platform.id) {
      case 'vercel':
        return [{
          id: `vercel-env-${envVar.key}`,
          command: `vercel env add ${envVar.key}`,
          description: 'Add environment variable via CLI',
          language: 'bash',
        }];
      case 'railway':
        return [{
          id: `railway-env-${envVar.key}`,
          command: `railway variables set ${envVar.key}=<value>`,
          description: 'Set environment variable',
          language: 'bash',
          placeholders: [{
            key: '<value>',
            description: envVar.howToGet,
            example: envVar.example || '',
          }],
        }];
      default:
        return [];
    }
  }

  private buildDatabaseStep(
    platform: Platform,
    databaseType: string
  ): DeploymentStep {
    const platformSupportsDB = platform.features.databaseSupport;

    return {
      id: 'database-setup',
      title: `Set Up ${databaseType} Database`,
      description: platformSupportsDB
        ? `${platform.name} can provision a ${databaseType} database for you`
        : `Set up a ${databaseType} database using an external service`,
      order: 6,
      required: true,
      substeps: platformSupportsDB
        ? this.getPlatformDatabaseSteps(platform, databaseType)
        : this.getExternalDatabaseSteps(databaseType),
      externalLinks: this.getDatabaseLinks(platform, databaseType),
    };
  }

  private getPlatformDatabaseSteps(
    platform: Platform,
    databaseType: string
  ): DeploymentSubstep[] {
    // Platform-specific database provisioning steps
    return [];
  }

  private getExternalDatabaseSteps(databaseType: string): DeploymentSubstep[] {
    return [
      {
        id: 'external-db-1',
        title: 'Choose a database provider',
        description: 'Recommended: Supabase (PostgreSQL), PlanetScale (MySQL), MongoDB Atlas',
        externalLinks: [
          { text: 'Supabase', url: 'https://supabase.com', type: 'service' },
          { text: 'PlanetScale', url: 'https://planetscale.com', type: 'service' },
          { text: 'MongoDB Atlas', url: 'https://www.mongodb.com/cloud/atlas', type: 'service' },
        ],
      },
      {
        id: 'external-db-2',
        title: 'Create a database',
        description: 'Follow your provider\'s instructions to create a new database',
      },
      {
        id: 'external-db-3',
        title: 'Get connection string',
        description: 'Copy the connection string from your database provider',
      },
      {
        id: 'external-db-4',
        title: 'Add to environment variables',
        description: 'Set DATABASE_URL in your deployment platform',
      },
    ];
  }

  private getDatabaseLinks(
    platform: Platform,
    databaseType: string
  ): ExternalLink[] {
    return [
      {
        text: `${platform.name} Database Documentation`,
        url: `${platform.documentationUrl}/databases`,
        type: 'documentation',
      },
    ];
  }
}
```


## Guide Generator

```typescript
class GuideGenerator {
  private configAnalyzer: ConfigurationAnalyzer;
  private stepBuilder: StepBuilder;
  private checklistGenerator: ChecklistGenerator;

  generateGuide(
    platform: Platform,
    scaffoldConfig: ScaffoldConfig
  ): DeploymentGuide {
    // Analyze configuration
    const requirements = this.configAnalyzer.analyze(scaffoldConfig);

    // Build steps
    const steps = this.stepBuilder.buildSteps(platform, requirements);

    // Generate post-deployment checklist
    const checklist = this.checklistGenerator.generate(
      platform,
      requirements,
      scaffoldConfig
    );

    // Generate troubleshooting section
    const troubleshooting = this.buildTroubleshooting(platform, requirements);

    // Estimate time
    const estimatedTime = this.estimateDeploymentTime(steps);

    return {
      id: `${platform.id}-${Date.now()}`,
      platform,
      scaffoldConfig,
      steps,
      postDeploymentChecklist: checklist,
      troubleshooting,
      estimatedTime,
    };
  }

  private buildTroubleshooting(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingSection {
    const commonIssues: TroubleshootingIssue[] = [
      {
        title: 'Build Fails',
        symptoms: ['Build process exits with error', 'Dependencies not found'],
        causes: [
          'Missing environment variables',
          'Incorrect Node.js version',
          'Missing dependencies in package.json',
        ],
        solutions: [
          'Check that all required environment variables are set',
          'Verify Node.js version matches your local environment',
          'Run npm install locally to verify dependencies',
        ],
        relatedLinks: [{
          text: `${platform.name} Build Documentation`,
          url: `${platform.documentationUrl}/builds`,
          type: 'documentation',
        }],
      },
      {
        title: 'Application Won\'t Start',
        symptoms: ['Deployment succeeds but app shows error', '502/503 errors'],
        causes: [
          'Incorrect start command',
          'Port configuration issues',
          'Database connection failures',
        ],
        solutions: [
          'Verify your start command in platform settings',
          'Ensure your app listens on the PORT environment variable',
          'Check DATABASE_URL is correctly set',
        ],
      },
    ];

    if (requirements.requiresDatabase) {
      commonIssues.push({
        title: 'Database Connection Errors',
        symptoms: ['Cannot connect to database', 'Connection timeout'],
        causes: [
          'Incorrect DATABASE_URL',
          'Database not accessible from platform',
          'SSL/TLS configuration issues',
        ],
        solutions: [
          'Verify DATABASE_URL format is correct',
          'Check database allows connections from your platform',
          'Add ?sslmode=require to connection string if needed',
        ],
        relatedLinks: [{
          text: 'Database Connection Guide',
          url: `${platform.documentationUrl}/databases/connection`,
          type: 'documentation',
        }],
      });
    }

    return {
      commonIssues,
      platformStatusUrl: `https://status.${platform.id}.com`,
      communityLinks: [
        {
          text: `${platform.name} Community`,
          url: `${platform.documentationUrl}/community`,
          type: 'documentation',
        },
      ],
    };
  }

  private estimateDeploymentTime(steps: DeploymentStep[]): string {
    const baseTime = 10; // Base 10 minutes
    const additionalTime = steps.length * 2; // 2 minutes per step
    const total = baseTime + additionalTime;
    return `${total}-${total + 10} minutes`;
  }
}
```


## Checklist Generator

```typescript
class ChecklistGenerator {
  generate(
    platform: Platform,
    requirements: DeploymentRequirements,
    config: ScaffoldConfig
  ): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    // OAuth callbacks
    if (requirements.requiresAuth && requirements.authProvider === 'nextauth') {
      items.push({
        id: 'oauth-callbacks',
        title: 'Update OAuth Callback URLs',
        description: 'Add your deployment URL to OAuth provider settings',
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
      });
    }

    // Database migrations
    if (requirements.requiresDatabase) {
      const migrationCommand = this.getMigrationCommand(config.database);
      items.push({
        id: 'database-migrations',
        title: 'Run Database Migrations',
        description: 'Initialize your database schema',
        required: true,
        commands: migrationCommand ? [{
          id: 'migration-cmd',
          command: migrationCommand,
          description: 'Run this in your project directory',
          language: 'bash',
        }] : [],
        completed: false,
      });
    }

    // Test application
    items.push({
      id: 'test-application',
      title: 'Test Your Deployed Application',
      description: 'Visit your deployment URL and verify everything works',
      required: true,
      completed: false,
    });

    // Custom domain
    if (platform.features.customDomains) {
      items.push({
        id: 'custom-domain',
        title: 'Add Custom Domain (Optional)',
        description: 'Configure a custom domain for your application',
        required: false,
        externalLinks: [{
          text: `${platform.name} Custom Domains`,
          url: `${platform.documentationUrl}/domains`,
          type: 'documentation',
        }],
        completed: false,
      });
    }

    // Monitoring
    items.push({
      id: 'setup-monitoring',
      title: 'Set Up Monitoring (Optional)',
      description: 'Add error tracking and performance monitoring',
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
      ],
      completed: false,
    });

    return items;
  }

  private getMigrationCommand(database: string): string | null {
    if (database.includes('prisma')) return 'npx prisma migrate deploy';
    if (database.includes('drizzle')) return 'npm run db:migrate';
    return null;
  }
}
```


## Progress Persistence

```typescript
class GuideProgressManager {
  private storageKey = 'deployment-guide-progress';

  saveProgress(guideId: string, progress: GuideProgress): void {
    const allProgress = this.getAllProgress();
    allProgress[guideId] = {
      ...progress,
      lastUpdated: new Date(),
    };
    localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
  }

  loadProgress(guideId: string): GuideProgress | null {
    const allProgress = this.getAllProgress();
    return allProgress[guideId] || null;
  }

  markStepComplete(guideId: string, stepId: string): void {
    const progress = this.loadProgress(guideId) || {
      guideId,
      completedSteps: [],
      completedChecklistItems: [],
      lastUpdated: new Date(),
      viewMode: 'detailed',
    };

    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
      this.saveProgress(guideId, progress);
    }
  }

  markChecklistItemComplete(guideId: string, itemId: string): void {
    const progress = this.loadProgress(guideId) || {
      guideId,
      completedSteps: [],
      completedChecklistItems: [],
      lastUpdated: new Date(),
      viewMode: 'detailed',
    };

    if (!progress.completedChecklistItems.includes(itemId)) {
      progress.completedChecklistItems.push(itemId);
      this.saveProgress(guideId, progress);
    }
  }

  setViewMode(guideId: string, mode: 'quick-start' | 'detailed'): void {
    const progress = this.loadProgress(guideId) || {
      guideId,
      completedSteps: [],
      completedChecklistItems: [],
      lastUpdated: new Date(),
      viewMode: mode,
    };

    progress.viewMode = mode;
    this.saveProgress(guideId, progress);
  }

  private getAllProgress(): Record<string, GuideProgress> {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  clearProgress(guideId: string): void {
    const allProgress = this.getAllProgress();
    delete allProgress[guideId];
    localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
  }
}
```

## Platform Definitions

```typescript
const PLATFORMS: Platform[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Best for Next.js and frontend frameworks',
    logo: '/icons/platforms/vercel.svg',
    bestFor: ['Next.js', 'React', 'Vue', 'Svelte'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '100/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://vercel.com/docs',
    pricingUrl: 'https://vercel.com/pricing',
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Best for full-stack apps with databases',
    logo: '/icons/platforms/railway.svg',
    bestFor: ['Full-stack', 'Databases', 'Monorepos'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '$5 free credit',
      easeOfUse: 'intermediate',
    },
    documentationUrl: 'https://docs.railway.app',
    pricingUrl: 'https://railway.app/pricing',
  },
  {
    id: 'render',
    name: 'Render',
    description: 'Best for simple deployments with databases',
    logo: '/icons/platforms/render.svg',
    bestFor: ['Web services', 'Static sites', 'Databases'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '750 hours/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://render.com/docs',
    pricingUrl: 'https://render.com/pricing',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Best for static sites and JAMstack',
    logo: '/icons/platforms/netlify.svg',
    bestFor: ['Static sites', 'JAMstack', 'Serverless functions'],
    features: {
      freeTier: true,
      databaseSupport: false,
      customDomains: true,
      buildMinutes: '300 minutes/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://docs.netlify.com',
    pricingUrl: 'https://www.netlify.com/pricing',
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    description: 'Best for AWS ecosystem integration',
    logo: '/icons/platforms/aws.svg',
    bestFor: ['AWS services', 'Full-stack', 'Mobile backends'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '1000 minutes/month free',
      easeOfUse: 'advanced',
    },
    documentationUrl: 'https://docs.amplify.aws',
    pricingUrl: 'https://aws.amazon.com/amplify/pricing',
  },
];
```


## UI Component Examples

### PlatformSelector Component

```typescript
export function PlatformSelector({ onSelectPlatform }: Props) {
  const [showComparison, setShowComparison] = useState(false);

  if (showComparison) {
    return <PlatformComparison onBack={() => setShowComparison(false)} />;
  }

  return (
    <div className="platform-selector">
      <h2>Choose Your Deployment Platform</h2>
      <button onClick={() => setShowComparison(true)}>
        Compare Platforms
      </button>
      <div className="platform-grid">
        {PLATFORMS.map(platform => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onClick={() => onSelectPlatform(platform)}
          />
        ))}
      </div>
    </div>
  );
}
```

### DeploymentGuide Component

```typescript
export function DeploymentGuide({ guide, progress }: Props) {
  const [viewMode, setViewMode] = useState<'quick-start' | 'detailed'>(
    progress?.viewMode || 'detailed'
  );

  return (
    <div className="deployment-guide">
      <header>
        <h1>Deploy to {guide.platform.name}</h1>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        <GuideProgress
          completed={progress?.completedSteps.length || 0}
          total={guide.steps.length}
        />
      </header>

      <div className="estimated-time">
        Estimated time: {guide.estimatedTime}
      </div>

      <div className="steps">
        {guide.steps.map(step => (
          <GuideStep
            key={step.id}
            step={step}
            completed={progress?.completedSteps.includes(step.id)}
            viewMode={viewMode}
            onToggleComplete={() => handleToggleStep(step.id)}
          />
        ))}
      </div>

      <ChecklistSection
        items={guide.postDeploymentChecklist}
        completedItems={progress?.completedChecklistItems || []}
        onToggleItem={handleToggleChecklistItem}
      />

      <TroubleshootingSection troubleshooting={guide.troubleshooting} />
    </div>
  );
}
```

### GuideStep Component

```typescript
export function GuideStep({ step, completed, viewMode, onToggleComplete }: Props) {
  const [expanded, setExpanded] = useState(!completed);

  return (
    <div className={`guide-step ${completed ? 'completed' : ''}`}>
      <div className="step-header" onClick={() => setExpanded(!expanded)}>
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggleComplete}
          onClick={(e) => e.stopPropagation()}
        />
        <h3>{step.title}</h3>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="step-content">
          <p>{step.description}</p>

          {step.commands && step.commands.map(cmd => (
            <CommandBlock key={cmd.id} command={cmd} />
          ))}

          {step.codeSnippets && step.codeSnippets.map(snippet => (
            <CodeBlock key={snippet.id} snippet={snippet} />
          ))}

          {viewMode === 'detailed' && step.notes && (
            <div className="notes">
              {step.notes.map((note, i) => (
                <p key={i} className="note">💡 {note}</p>
              ))}
            </div>
          )}

          {step.warnings && (
            <div className="warnings">
              {step.warnings.map((warning, i) => (
                <p key={i} className="warning">⚠️ {warning}</p>
              ))}
            </div>
          )}

          {step.externalLinks && (
            <div className="external-links">
              {step.externalLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener">
                  {link.text} →
                </a>
              ))}
            </div>
          )}

          {step.substeps && (
            <div className="substeps">
              {step.substeps.map(substep => (
                <div key={substep.id} className="substep">
                  <h4>{substep.title}</h4>
                  <p>{substep.description}</p>
                  {substep.commands && substep.commands.map(cmd => (
                    <CommandBlock key={cmd.id} command={cmd} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### CommandBlock Component

```typescript
export function CommandBlock({ command }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="command-block">
      {command.description && (
        <p className="command-description">{command.description}</p>
      )}
      <div className="command-container">
        <pre>
          <code className={`language-${command.language}`}>
            {command.command}
          </code>
        </pre>
        <button onClick={handleCopy} className="copy-button">
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      {command.placeholders && (
        <div className="placeholders">
          <p>Replace the following placeholders:</p>
          <ul>
            {command.placeholders.map(p => (
              <li key={p.key}>
                <code>{p.key}</code>: {p.description}
                {p.example && <span className="example"> (e.g., {p.example})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Export Functionality

```typescript
class GuideExporter {
  exportAsMarkdown(guide: DeploymentGuide): string {
    let markdown = `# Deploy to ${guide.platform.name}\n\n`;
    markdown += `Estimated time: ${guide.estimatedTime}\n\n`;
    markdown += `## Prerequisites\n\n`;
    
    // Add steps
    guide.steps.forEach((step, index) => {
      markdown += `## ${index + 1}. ${step.title}\n\n`;
      markdown += `${step.description}\n\n`;
      
      if (step.commands) {
        step.commands.forEach(cmd => {
          markdown += `\`\`\`${cmd.language}\n${cmd.command}\n\`\`\`\n\n`;
        });
      }
      
      if (step.substeps) {
        step.substeps.forEach(substep => {
          markdown += `### ${substep.title}\n\n`;
          markdown += `${substep.description}\n\n`;
        });
      }
    });
    
    // Add checklist
    markdown += `## Post-Deployment Checklist\n\n`;
    guide.postDeploymentChecklist.forEach(item => {
      markdown += `- [ ] ${item.title}\n`;
      markdown += `  ${item.description}\n\n`;
    });
    
    return markdown;
  }

  downloadMarkdown(guide: DeploymentGuide): void {
    const markdown = this.exportAsMarkdown(guide);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deploy-to-${guide.platform.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printGuide(): void {
    window.print();
  }
}
```

## Error Handling

```typescript
class GuideErrorHandler {
  handleGenerationError(error: Error): void {
    console.error('Failed to generate guide:', error);
    // Show user-friendly error message
    // Offer to download scaffold instead
  }

  handleProgressSaveError(error: Error): void {
    console.error('Failed to save progress:', error);
    // Continue without saving, show warning
  }

  handleExportError(error: Error): void {
    console.error('Failed to export guide:', error);
    // Show error message, offer alternative export methods
  }
}
```

## Testing Strategy

- Unit tests for ConfigurationAnalyzer to ensure correct feature detection
- Unit tests for StepBuilder to verify correct steps are generated
- Unit tests for GuideProgressManager to ensure progress persistence works
- Integration tests for full guide generation flow
- Visual regression tests for UI components
- Accessibility tests for keyboard navigation and screen readers
- Manual testing of guides with real deployments to verify accuracy

## Performance Considerations

- Guide generation happens client-side, no server load
- Progress stored in localStorage, no database needed
- Platform definitions are static, can be cached
- Images optimized and lazy-loaded
- Code syntax highlighting loaded on demand

## Future Enhancements

- Video tutorials embedded in guides
- Interactive terminal simulator for practicing commands
- Integration with GitHub to auto-detect repository
- Platform recommendation based on project configuration
- Community-contributed platform guides
- Multi-language support for guides
- AI-powered troubleshooting assistant
