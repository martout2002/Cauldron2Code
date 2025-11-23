# Deployment Guides Documentation

## Overview

Deployment Guides provide interactive, step-by-step instructions for deploying your generated project to popular hosting platforms. Unlike automated deployment, guides are **educational** - they teach you how deployment works while giving you full control over the process.

## Table of Contents

- [User Guide](#user-guide)
  - [Accessing Deployment Guides](#accessing-deployment-guides)
  - [Choosing a Platform](#choosing-a-platform)
  - [Following a Guide](#following-a-guide)
  - [View Modes](#view-modes)
  - [Progress Tracking](#progress-tracking)
  - [Exporting Guides](#exporting-guides)
- [Developer Guide](#developer-guide)
  - [Architecture Overview](#architecture-overview)
  - [Adding a New Platform](#adding-a-new-platform)
  - [Customizing Step Generation](#customizing-step-generation)
  - [Adding New Configuration Detectors](#adding-new-configuration-detectors)
  - [Extending Troubleshooting](#extending-troubleshooting)
- [API Reference](#api-reference)
- [Testing](#testing)

---

## User Guide

### Accessing Deployment Guides

After generating a scaffold, you'll see three options:

1. **Download ZIP** - Download your project files
2. **Create GitHub Repository** - Push to GitHub
3. **View Deployment Guides** - Access step-by-step deployment instructions

Click "View Deployment Guides" to start.

### Choosing a Platform

The platform selector shows five hosting platforms:

| Platform | Best For | Free Tier | Database Support |
|----------|----------|-----------|------------------|
| **Vercel** | Next.js, frontend frameworks | ✅ 100 build minutes/month | ✅ Postgres |
| **Railway** | Full-stack apps, monorepos | ✅ $5 credit | ✅ Postgres, MySQL, Redis |
| **Render** | Simple deployments | ✅ 750 hours/month | ✅ Postgres |
| **Netlify** | Static sites, JAMstack | ✅ 300 build minutes/month | ❌ |
| **AWS Amplify** | AWS ecosystem | ✅ 1000 build minutes/month | ✅ DynamoDB |

**Not sure which to choose?** Click "Compare Platforms" to see a detailed comparison with recommendations based on your project configuration.

### Following a Guide

Each guide is tailored to your specific project configuration and includes:

#### 1. Prerequisites
- Required tools (Node.js, Git, CLI tools)
- Account setup instructions
- Links to sign up for services

#### 2. Step-by-Step Instructions
- Numbered steps in logical order
- Detailed explanations for each step
- Command snippets with copy buttons
- Code examples with syntax highlighting
- External documentation links

#### 3. Environment Variables
- List of required variables for your configuration
- Description and example for each variable
- Links to obtain API keys and secrets
- Platform-specific commands to set variables

#### 4. Database Setup
- Database provisioning instructions (if your project uses a database)
- Connection string configuration
- Migration commands

#### 5. Post-Deployment Checklist
- OAuth callback URL configuration
- Database migrations
- Application testing
- Custom domain setup (optional)
- Monitoring setup (optional)

#### 6. Troubleshooting
- Common issues and solutions
- Platform status page links
- Community resource links

### View Modes

Deployment guides support two view modes:

#### Quick Start Mode
- Shows only essential commands
- Minimal explanations
- Perfect for experienced developers
- Faster to scan and execute

#### Detailed Guide Mode
- Full explanations and context
- Additional notes and warnings
- Best practices and tips
- Perfect for learning

Toggle between modes anytime without losing progress.

### Progress Tracking

Your progress is automatically saved:

- ✅ Check off completed steps
- 📊 See progress percentage
- 💾 Progress persists across page refreshes
- 🔖 Bookmark guides to return later
- 🔄 Clear progress to start fresh

### Exporting Guides

Save guides for offline reference:

- **Export as Markdown**: Download a `.md` file
- **Print Guide**: Print or save as PDF

---

## Developer Guide

### Architecture Overview

The deployment guides system consists of several key components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Platform   │  │  Deployment  │  │    Guide     │      │
│  │   Selector   │  │    Guide     │  │   Export     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Generation Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Guide     │  │     Step     │  │  Checklist   │      │
│  │  Generator   │  │   Builder    │  │  Generator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │Configuration │  │Troubleshooting│                        │
│  │   Analyzer   │  │   Builder    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Content Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Platform   │  │ Architecture │  │ Environment  │      │
│  │ Definitions  │  │   Diagrams   │  │  Detector    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Guide     │  │    Local     │                        │
│  │   Progress   │  │   Storage    │                        │
│  │   Manager    │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Adding a New Platform

To add support for a new hosting platform:

#### Step 1: Add Platform Definition

Edit `src/lib/deployment/platforms.ts`:

```typescript
export const PLATFORMS: Platform[] = [
  // ... existing platforms
  {
    id: 'your-platform',
    name: 'Your Platform',
    description: 'Best for X, Y, and Z',
    logo: '/icons/platforms/your-platform.svg',
    bestFor: ['Feature 1', 'Feature 2', 'Feature 3'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '500/month free',
      easeOfUse: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
    },
    documentationUrl: 'https://docs.yourplatform.com',
    pricingUrl: 'https://yourplatform.com/pricing',
  },
];
```

#### Step 2: Add Platform Logo

Add an SVG logo to `public/icons/platforms/your-platform.svg`.

**Requirements:**
- SVG format
- Optimized for web (< 10KB)
- Viewbox: `0 0 24 24` or similar
- Monochrome or brand colors

#### Step 3: Implement Platform-Specific Steps

Edit `src/lib/deployment/step-builder.ts`:

```typescript
private buildPlatformSetupSteps(
  platform: Platform,
  requirements: DeploymentRequirements
): DeploymentStep[] {
  switch (platform.id) {
    case 'your-platform':
      return this.buildYourPlatformSteps(requirements);
    // ... other cases
  }
}

private buildYourPlatformSteps(
  requirements: DeploymentRequirements
): DeploymentStep[] {
  const steps: DeploymentStep[] = [];

  // Add CLI installation step
  steps.push({
    id: 'install-cli',
    title: 'Install Your Platform CLI',
    description: 'Install the CLI tool to deploy from your terminal',
    order: 1,
    required: true,
    commands: [{
      id: 'install-cli-cmd',
      command: 'npm install -g @yourplatform/cli',
      description: 'Install CLI globally',
      language: 'bash',
    }],
    externalLinks: [{
      text: 'CLI Documentation',
      url: 'https://docs.yourplatform.com/cli',
      type: 'documentation',
    }],
  });

  // Add authentication step
  steps.push({
    id: 'login',
    title: 'Authenticate with Your Platform',
    description: 'Log in to your account',
    order: 2,
    required: true,
    commands: [{
      id: 'login-cmd',
      command: 'yourplatform login',
      description: 'Opens browser for authentication',
      language: 'bash',
    }],
  });

  // Add project initialization
  steps.push({
    id: 'init-project',
    title: 'Initialize Project',
    description: 'Set up your project for deployment',
    order: 3,
    required: true,
    commands: [{
      id: 'init-cmd',
      command: 'yourplatform init',
      description: 'Initialize project configuration',
      language: 'bash',
    }],
  });

  // Add deployment step
  steps.push({
    id: 'deploy',
    title: 'Deploy Your Application',
    description: 'Deploy to production',
    order: 4,
    required: true,
    commands: [{
      id: 'deploy-cmd',
      command: 'yourplatform deploy --prod',
      description: 'Deploy to production environment',
      language: 'bash',
    }],
  });

  return steps;
}
```

#### Step 4: Add Environment Variable Commands

Edit the `getEnvVarCommand` method in `step-builder.ts`:

```typescript
private getEnvVarCommand(
  platform: Platform,
  envVar: EnvironmentVariable
): CommandSnippet[] {
  switch (platform.id) {
    case 'your-platform':
      return [{
        id: `yourplatform-env-${envVar.key}`,
        command: `yourplatform env set ${envVar.key}=<value>`,
        description: 'Set environment variable',
        language: 'bash',
        placeholders: [{
          key: '<value>',
          description: envVar.howToGet,
          example: envVar.example || '',
        }],
      }];
    // ... other cases
  }
}
```

#### Step 5: Add Troubleshooting Resources

Edit `src/lib/deployment/troubleshooting-builder.ts`:

```typescript
private getCommunityLinks(platform: Platform): ExternalLink[] {
  switch (platform.id) {
    case 'your-platform':
      return [
        {
          text: 'Your Platform Community',
          url: 'https://community.yourplatform.com',
          type: 'documentation',
        },
        {
          text: 'Your Platform Discord',
          url: 'https://discord.gg/yourplatform',
          type: 'documentation',
        },
        {
          text: 'Your Platform Support',
          url: 'https://yourplatform.com/support',
          type: 'documentation',
        },
      ];
    // ... other cases
  }
}

private getPlatformStatusUrl(platform: Platform): string {
  const statusUrls: Record<string, string> = {
    'your-platform': 'https://status.yourplatform.com',
    // ... other platforms
  };
  return statusUrls[platform.id] || `https://status.${platform.id}.com`;
}
```

#### Step 6: Test Your Platform

1. Generate a test scaffold
2. Navigate to deployment guides
3. Select your new platform
4. Verify all steps appear correctly
5. Test command copy functionality
6. Check all external links work
7. Test progress tracking
8. Export guide and verify formatting

### Customizing Step Generation

The `StepBuilder` class generates steps based on project configuration. You can customize step generation by:

#### Adding Configuration-Specific Steps

```typescript
// In step-builder.ts
private buildSteps(
  platform: Platform,
  requirements: DeploymentRequirements
): DeploymentStep[] {
  const steps: DeploymentStep[] = [];

  // ... existing steps

  // Add custom step based on configuration
  if (requirements.requiresRedis) {
    steps.push(this.buildRedisSetupStep(platform));
  }

  if (requirements.isMonorepo) {
    steps.push(...this.buildMonorepoSteps(platform, requirements));
  }

  return steps;
}

private buildRedisSetupStep(platform: Platform): DeploymentStep {
  return {
    id: 'redis-setup',
    title: 'Set Up Redis',
    description: 'Configure Redis for caching and sessions',
    order: 7,
    required: true,
    substeps: [
      {
        id: 'redis-provision',
        title: 'Provision Redis instance',
        description: 'Create a Redis database',
        commands: this.getRedisProvisionCommand(platform),
      },
      {
        id: 'redis-connect',
        title: 'Configure connection',
        description: 'Add REDIS_URL to environment variables',
      },
    ],
  };
}
```

#### Customizing Command Generation

```typescript
// Generate platform-specific commands
private getRedisProvisionCommand(platform: Platform): CommandSnippet[] {
  switch (platform.id) {
    case 'railway':
      return [{
        id: 'railway-redis',
        command: 'railway add redis',
        description: 'Add Redis to your Railway project',
        language: 'bash',
      }];
    case 'render':
      // Render requires manual setup via dashboard
      return [];
    default:
      return [];
  }
}
```

### Adding New Configuration Detectors

The `ConfigurationAnalyzer` detects what features your project uses. To add new detection:

#### Step 1: Update DeploymentRequirements Type

Edit `src/types/deployment-guides.ts`:

```typescript
export interface DeploymentRequirements {
  // ... existing fields
  requiresNewFeature: boolean;
  newFeatureConfig?: string;
}
```

#### Step 2: Add Detection Logic

Edit `src/lib/deployment/configuration-analyzer.ts`:

```typescript
analyze(config: ScaffoldConfig): DeploymentRequirements {
  return {
    // ... existing detections
    requiresNewFeature: this.detectNewFeature(config),
    newFeatureConfig: this.getNewFeatureConfig(config),
  };
}

private detectNewFeature(config: ScaffoldConfig): boolean {
  // Add your detection logic
  return config.extras?.newFeature === true;
}

private getNewFeatureConfig(config: ScaffoldConfig): string | undefined {
  if (!this.detectNewFeature(config)) return undefined;
  return config.extras?.newFeatureType || 'default';
}
```

#### Step 3: Add Environment Variables

Edit the `detectEnvironmentVariables` method:

```typescript
private detectEnvironmentVariables(config: ScaffoldConfig): EnvironmentVariable[] {
  const vars: EnvironmentVariable[] = [];

  // ... existing variables

  if (this.detectNewFeature(config)) {
    vars.push({
      key: 'NEW_FEATURE_API_KEY',
      description: 'API key for new feature',
      required: true,
      sensitive: true,
      example: 'nf_xxxxxxxxxxxxx',
      howToGet: 'Get from New Feature Dashboard',
      link: 'https://dashboard.newfeature.com/api-keys',
    });
  }

  return vars;
}
```

#### Step 4: Generate Feature-Specific Steps

Edit `src/lib/deployment/step-builder.ts`:

```typescript
private buildSteps(
  platform: Platform,
  requirements: DeploymentRequirements
): DeploymentStep[] {
  const steps: DeploymentStep[] = [];

  // ... existing steps

  if (requirements.requiresNewFeature) {
    steps.push(this.buildNewFeatureStep(platform, requirements));
  }

  return steps;
}

private buildNewFeatureStep(
  platform: Platform,
  requirements: DeploymentRequirements
): DeploymentStep {
  return {
    id: 'new-feature-setup',
    title: 'Configure New Feature',
    description: 'Set up the new feature integration',
    order: 8,
    required: true,
    substeps: [
      {
        id: 'new-feature-account',
        title: 'Create account',
        description: 'Sign up for New Feature service',
        externalLinks: [{
          text: 'Sign up for New Feature',
          url: 'https://newfeature.com/signup',
          type: 'service',
        }],
      },
      {
        id: 'new-feature-api-key',
        title: 'Get API key',
        description: 'Generate an API key from the dashboard',
      },
      {
        id: 'new-feature-env-var',
        title: 'Add to environment variables',
        description: 'Set NEW_FEATURE_API_KEY in your deployment platform',
      },
    ],
  };
}
```

### Extending Troubleshooting

Add new troubleshooting issues in `src/lib/deployment/troubleshooting-builder.ts`:

```typescript
private buildCommonIssues(
  platform: Platform,
  requirements: DeploymentRequirements
): TroubleshootingIssue[] {
  const issues: TroubleshootingIssue[] = [
    // ... existing issues
  ];

  // Add feature-specific troubleshooting
  if (requirements.requiresNewFeature) {
    issues.push({
      title: 'New Feature Connection Errors',
      symptoms: [
        'New Feature API returns 401 errors',
        'Feature not working in production',
      ],
      causes: [
        'Missing or incorrect NEW_FEATURE_API_KEY',
        'API key not activated',
        'Rate limit exceeded',
      ],
      solutions: [
        'Verify NEW_FEATURE_API_KEY is set correctly',
        'Check API key is activated in dashboard',
        'Review rate limits in New Feature documentation',
        'Ensure API key has correct permissions',
      ],
      relatedLinks: [
        {
          text: 'New Feature API Documentation',
          url: 'https://docs.newfeature.com/api',
          type: 'documentation',
        },
        {
          text: 'Troubleshooting Guide',
          url: 'https://docs.newfeature.com/troubleshooting',
          type: 'documentation',
        },
      ],
    });
  }

  return issues;
}
```

---

## API Reference

### Core Classes

#### GuideGenerator

Orchestrates guide generation.

```typescript
class GuideGenerator {
  generateGuide(
    platform: Platform,
    scaffoldConfig: ScaffoldConfig
  ): DeploymentGuide;
}
```

#### ConfigurationAnalyzer

Analyzes scaffold configuration to determine deployment requirements.

```typescript
class ConfigurationAnalyzer {
  analyze(config: ScaffoldConfig): DeploymentRequirements;
}
```

#### StepBuilder

Builds deployment steps based on platform and requirements.

```typescript
class StepBuilder {
  buildSteps(
    platform: Platform,
    requirements: DeploymentRequirements
  ): DeploymentStep[];
}
```

#### ChecklistGenerator

Generates post-deployment checklist items.

```typescript
class ChecklistGenerator {
  generate(
    platform: Platform,
    requirements: DeploymentRequirements,
    config: ScaffoldConfig
  ): ChecklistItem[];
}
```

#### TroubleshootingBuilder

Builds troubleshooting section with common issues.

```typescript
class TroubleshootingBuilder {
  build(
    platform: Platform,
    requirements: DeploymentRequirements
  ): TroubleshootingSection;
}
```

#### GuideProgressManager

Manages guide progress persistence.

```typescript
class GuideProgressManager {
  saveProgress(guideId: string, progress: GuideProgress): void;
  loadProgress(guideId: string): GuideProgress | null;
  markStepComplete(guideId: string, stepId: string): void;
  markChecklistItemComplete(guideId: string, itemId: string): void;
  setViewMode(guideId: string, mode: 'quick-start' | 'detailed'): void;
  clearProgress(guideId: string): void;
}
```

#### GuideExporter

Exports guides to different formats.

```typescript
class GuideExporter {
  exportAsMarkdown(guide: DeploymentGuide): string;
}
```

### Key Types

See `src/types/deployment-guides.ts` for complete type definitions:

- `Platform` - Platform definition
- `DeploymentGuide` - Complete guide structure
- `DeploymentStep` - Individual step
- `DeploymentSubstep` - Nested substep
- `CommandSnippet` - Terminal command
- `CodeSnippet` - Code example
- `ChecklistItem` - Post-deployment task
- `TroubleshootingIssue` - Common problem and solutions
- `EnvironmentVariable` - Environment variable definition
- `DeploymentRequirements` - Detected project requirements

---

## Testing

### Running Tests

```bash
# Run all deployment guide tests
bun test src/lib/deployment
bun test src/components/guides

# Run specific test files
bun test src/lib/deployment/__test-guide-generator.ts
bun test src/components/guides/__test-deployment-guide.tsx
```

### Test Coverage

The deployment guides feature includes comprehensive tests:

- **Unit Tests**: Core logic (analyzers, builders, generators)
- **Component Tests**: UI components (steps, checklists, commands)
- **Integration Tests**: End-to-end guide generation
- **Accessibility Tests**: Keyboard navigation, screen readers

### Manual Testing Checklist

When adding new features, test:

- [ ] Platform selector displays correctly
- [ ] Platform comparison shows accurate data
- [ ] Guide generates with correct steps for configuration
- [ ] Commands have working copy buttons
- [ ] External links open in new tabs
- [ ] Progress tracking persists across refreshes
- [ ] View mode toggle works correctly
- [ ] Checklist items can be checked/unchecked
- [ ] Export as Markdown produces valid output
- [ ] Print functionality works
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces content correctly
- [ ] All external links are valid and current

---

## Best Practices

### Writing Step Descriptions

- **Be specific**: "Install Vercel CLI" not "Install CLI"
- **Use active voice**: "Run the command" not "The command should be run"
- **Explain why**: Help users understand the purpose
- **Keep it concise**: One or two sentences per step

### Command Snippets

- **Use placeholders**: `<your-project-name>` for user-specific values
- **Provide examples**: Show what a real value looks like
- **Add descriptions**: Explain what the command does
- **Test commands**: Verify they work before adding

### External Links

- **Link to official docs**: Use platform's official documentation
- **Keep links current**: Verify links periodically
- **Use descriptive text**: "Vercel CLI Documentation" not "Click here"
- **Open in new tabs**: Set `type: 'documentation'` or `type: 'service'`

### Troubleshooting

- **List symptoms first**: Help users identify the issue
- **Explain causes**: Help users understand why it happened
- **Provide solutions**: Give step-by-step fixes
- **Link to resources**: Official docs, status pages, community

---

## Contributing

We welcome contributions to deployment guides! Here's how you can help:

### Adding Platform Support

See [Adding a New Platform](#adding-a-new-platform) above.

### Improving Existing Guides

- Test guides with real deployments
- Report issues or outdated information
- Suggest additional steps or clarifications
- Add troubleshooting for new issues

### Updating Documentation

- Fix typos or unclear explanations
- Add examples or screenshots
- Update external links
- Improve code comments

### Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cauldron2code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cauldron2code/discussions)
- **Documentation**: This file and inline code comments

---

## License

MIT License - See [LICENSE](./LICENSE) for details.
