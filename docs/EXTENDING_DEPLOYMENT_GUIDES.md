# Extending Deployment Guides

A comprehensive guide for developers who want to extend or customize the deployment guides system.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Common Extension Patterns](#common-extension-patterns)
- [Advanced Customization](#advanced-customization)
- [Testing Your Extensions](#testing-your-extensions)
- [Best Practices](#best-practices)

## Quick Start

### Adding a Simple Platform

The fastest way to add a new platform is to follow this checklist:

1. ✅ Add platform definition to `src/lib/deployment/platforms.ts`
2. ✅ Add platform logo to `public/icons/platforms/`
3. ✅ Implement platform steps in `src/lib/deployment/step-builder.ts`
4. ✅ Add environment variable commands
5. ✅ Add troubleshooting resources
6. ✅ Test with a real deployment

**Time estimate**: 2-4 hours for a basic platform

### Adding a Configuration Detector

To detect a new project feature:

1. ✅ Update `DeploymentRequirements` type
2. ✅ Add detection logic to `ConfigurationAnalyzer`
3. ✅ Add environment variables if needed
4. ✅ Generate feature-specific steps in `StepBuilder`
5. ✅ Add troubleshooting for the feature

**Time estimate**: 1-2 hours

## Architecture Deep Dive

### Data Flow

```
ScaffoldConfig (user's project)
    ↓
ConfigurationAnalyzer.analyze()
    ↓
DeploymentRequirements (what's needed)
    ↓
StepBuilder.buildSteps()
    ↓
DeploymentStep[] (how to deploy)
    ↓
GuideGenerator.generateGuide()
    ↓
DeploymentGuide (complete guide)
    ↓
DeploymentGuide component (UI)
```

### Key Classes and Their Responsibilities

#### ConfigurationAnalyzer
**Purpose**: Understand what the user's project needs

**Input**: `ScaffoldConfig` (from wizard)
**Output**: `DeploymentRequirements` (analyzed needs)

**Key Methods**:
- `analyze()` - Main entry point
- `detectDatabase()` - Check if database is needed
- `detectAuth()` - Check if auth is configured
- `detectEnvironmentVariables()` - Find all required env vars

**When to extend**: Adding support for new project features

#### StepBuilder
**Purpose**: Generate deployment instructions

**Input**: `Platform` + `DeploymentRequirements`
**Output**: `DeploymentStep[]` (ordered instructions)

**Key Methods**:
- `buildSteps()` - Orchestrates step generation
- `buildPlatformSetupSteps()` - Platform-specific steps
- `buildEnvironmentVariablesStep()` - Env var configuration
- `buildDatabaseStep()` - Database setup

**When to extend**: Adding new platforms or customizing steps

#### ChecklistGenerator
**Purpose**: Create post-deployment tasks

**Input**: `Platform` + `DeploymentRequirements` + `ScaffoldConfig`
**Output**: `ChecklistItem[]` (things to do after deploy)

**Key Methods**:
- `generate()` - Creates checklist
- `getMigrationCommand()` - Database migration commands

**When to extend**: Adding new post-deployment tasks

#### TroubleshootingBuilder
**Purpose**: Help users solve common problems

**Input**: `Platform` + `DeploymentRequirements`
**Output**: `TroubleshootingSection` (issues and solutions)

**Key Methods**:
- `build()` - Creates troubleshooting section
- `buildCommonIssues()` - Platform-agnostic issues
- `getCommunityLinks()` - Platform support resources

**When to extend**: Adding new troubleshooting scenarios

#### GuideGenerator
**Purpose**: Orchestrate guide creation

**Input**: `Platform` + `ScaffoldConfig`
**Output**: `DeploymentGuide` (complete guide)

**Key Methods**:
- `generateGuide()` - Main entry point
- `estimateDeploymentTime()` - Calculate time estimate

**When to extend**: Rarely needed; this is the coordinator

### Type System

All types are defined in `src/types/deployment-guides.ts`:

```typescript
// Core types
Platform          // Hosting platform definition
DeploymentGuide   // Complete guide structure
DeploymentStep    // Individual instruction
CommandSnippet    // Terminal command
ChecklistItem     // Post-deployment task

// Analysis types
DeploymentRequirements  // What the project needs
EnvironmentVariable     // Env var definition

// UI types
GuideProgress     // User's progress through guide
```

## Common Extension Patterns

### Pattern 1: Adding Platform Support

**Use case**: You want to add Fly.io, DigitalOcean App Platform, or another host

**Steps**:

1. **Define the platform**:
```typescript
// src/lib/deployment/platforms.ts
{
  id: 'flyio',
  name: 'Fly.io',
  description: 'Best for global edge deployment',
  logo: '/icons/platforms/flyio.svg',
  bestFor: ['Edge deployment', 'Global apps', 'WebSockets'],
  features: {
    freeTier: true,
    databaseSupport: true,
    customDomains: true,
    buildMinutes: 'Unlimited',
    easeOfUse: 'intermediate',
  },
  documentationUrl: 'https://fly.io/docs',
  pricingUrl: 'https://fly.io/pricing',
}
```

2. **Implement platform steps**:
```typescript
// src/lib/deployment/step-builder.ts
private buildPlatformSetupSteps(
  platform: Platform,
  requirements: DeploymentRequirements,
  order: number
): DeploymentStep[] {
  switch (platform.id) {
    case 'flyio':
      return this.buildFlyioSteps(requirements, order);
    // ... other cases
  }
}

private buildFlyioSteps(
  requirements: DeploymentRequirements,
  order: number
): DeploymentStep[] {
  return [
    {
      id: 'flyio-login',
      title: 'Authenticate with Fly.io',
      description: 'Log in to your Fly.io account',
      order: order++,
      required: true,
      commands: [{
        id: 'flyio-login-cmd',
        command: 'flyctl auth login',
        description: 'Opens browser for authentication',
        language: 'bash',
      }],
    },
    {
      id: 'flyio-launch',
      title: 'Launch Application',
      description: 'Initialize and configure your app',
      order: order++,
      required: true,
      commands: [{
        id: 'flyio-launch-cmd',
        command: 'flyctl launch',
        description: 'Interactive setup wizard',
        language: 'bash',
      }],
      notes: [
        'Choose a unique app name',
        'Select a region close to your users',
        'Fly.io will detect your framework automatically',
      ],
    },
    // Add more steps...
  ];
}
```

3. **Add environment variable support**:
```typescript
// src/lib/deployment/step-builder.ts
private getEnvVarCommand(
  platform: Platform,
  envVar: EnvironmentVariable
): CommandSnippet[] {
  switch (platform.id) {
    case 'flyio':
      return [{
        id: `flyio-env-${envVar.key}`,
        command: `flyctl secrets set ${envVar.key}=<value>`,
        description: 'Set secret environment variable',
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

4. **Add troubleshooting**:
```typescript
// src/lib/deployment/troubleshooting-builder.ts
private getCommunityLinks(platform: Platform): ExternalLink[] {
  switch (platform.id) {
    case 'flyio':
      return [
        {
          text: 'Fly.io Community',
          url: 'https://community.fly.io',
          type: 'documentation',
        },
        {
          text: 'Fly.io Discord',
          url: 'https://fly.io/discord',
          type: 'documentation',
        },
      ];
    // ... other cases
  }
}
```

### Pattern 2: Adding Feature Detection

**Use case**: You want to detect and configure a new feature (e.g., Stripe, SendGrid, Twilio)

**Steps**:

1. **Extend requirements type**:
```typescript
// src/types/deployment-guides.ts
export interface DeploymentRequirements {
  // ... existing fields
  requiresPayments: boolean;
  paymentProvider?: 'stripe' | 'paypal';
}
```

2. **Add detection logic**:
```typescript
// src/lib/deployment/configuration-analyzer.ts
analyze(config: ScaffoldConfig): DeploymentRequirements {
  return {
    // ... existing fields
    requiresPayments: this.detectPayments(config),
    paymentProvider: this.getPaymentProvider(config),
  };
}

private detectPayments(config: ScaffoldConfig): boolean {
  return config.extras?.payments === true;
}

private getPaymentProvider(config: ScaffoldConfig): string | undefined {
  return config.extras?.paymentProvider;
}
```

3. **Add environment variables**:
```typescript
// src/lib/deployment/configuration-analyzer.ts
detectEnvironmentVariables(config: ScaffoldConfig): EnvironmentVariable[] {
  const vars: EnvironmentVariable[] = [];
  
  // ... existing variables
  
  if (this.detectPayments(config)) {
    vars.push(...this.getPaymentEnvVars(config.extras?.paymentProvider));
  }
  
  return vars;
}

private getPaymentEnvVars(provider?: string): EnvironmentVariable[] {
  if (provider === 'stripe') {
    return [
      {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret key for server-side operations',
        required: true,
        sensitive: true,
        example: 'sk_test_...',
        howToGet: 'Get from Stripe Dashboard',
        link: 'https://dashboard.stripe.com/apikeys',
      },
      {
        key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe publishable key for client-side',
        required: true,
        sensitive: false,
        example: 'pk_test_...',
        howToGet: 'Get from Stripe Dashboard',
        link: 'https://dashboard.stripe.com/apikeys',
      },
    ];
  }
  return [];
}
```

4. **Generate feature-specific steps**:
```typescript
// src/lib/deployment/step-builder.ts
buildSteps(
  platform: Platform,
  requirements: DeploymentRequirements,
  repositoryUrl?: string | null
): DeploymentStep[] {
  const steps: DeploymentStep[] = [];
  let order = 1;
  
  // ... existing steps
  
  if (requirements.requiresPayments) {
    steps.push(this.buildPaymentSetupStep(requirements, order++));
  }
  
  return steps;
}

private buildPaymentSetupStep(
  requirements: DeploymentRequirements,
  order: number
): DeploymentStep {
  const provider = requirements.paymentProvider || 'stripe';
  
  return {
    id: 'payment-setup',
    title: `Configure ${provider} Payments`,
    description: `Set up ${provider} for payment processing`,
    order,
    required: true,
    substeps: [
      {
        id: 'payment-account',
        title: `Create ${provider} account`,
        description: 'Sign up for a payment processing account',
        externalLinks: [{
          text: `Sign up for ${provider}`,
          url: `https://${provider}.com/register`,
          type: 'service',
        }],
      },
      {
        id: 'payment-keys',
        title: 'Get API keys',
        description: 'Generate API keys from the dashboard',
        externalLinks: [{
          text: `${provider} Dashboard`,
          url: `https://dashboard.${provider}.com`,
          type: 'service',
        }],
      },
      {
        id: 'payment-env-vars',
        title: 'Add to environment variables',
        description: 'Configure API keys in your deployment platform',
      },
    ],
    notes: [
      'Use test keys during development',
      'Switch to live keys only when ready for production',
      'Keep secret keys secure and never commit them',
    ],
  };
}
```

5. **Add to checklist**:
```typescript
// src/lib/deployment/checklist-generator.ts
generate(
  platform: Platform,
  requirements: DeploymentRequirements,
  config: ScaffoldConfig
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  
  // ... existing items
  
  if (requirements.requiresPayments) {
    items.push({
      id: 'test-payments',
      title: 'Test Payment Flow',
      description: 'Verify payment processing works in production',
      required: true,
      completed: false,
      notes: [
        'Use test card numbers first',
        'Verify webhooks are received',
        'Check payment confirmation emails',
      ],
    });
  }
  
  return items;
}
```

### Pattern 3: Adding Custom Troubleshooting

**Use case**: You want to add troubleshooting for a specific scenario

**Steps**:

```typescript
// src/lib/deployment/troubleshooting-builder.ts
private buildCommonIssues(
  platform: Platform,
  requirements: DeploymentRequirements
): TroubleshootingIssue[] {
  const issues: TroubleshootingIssue[] = [
    // ... existing issues
  ];
  
  // Add feature-specific troubleshooting
  if (requirements.requiresPayments) {
    issues.push({
      title: 'Payment Webhook Failures',
      symptoms: [
        'Webhooks not received',
        'Payment status not updating',
        'Webhook signature verification fails',
      ],
      causes: [
        'Incorrect webhook URL configured',
        'Webhook signing secret not set',
        'Firewall blocking webhook requests',
        'Application not handling webhook events',
      ],
      solutions: [
        'Verify webhook URL in payment provider dashboard',
        'Ensure WEBHOOK_SECRET environment variable is set',
        'Check application logs for webhook errors',
        'Test webhooks using provider\'s testing tools',
        'Verify webhook endpoint is publicly accessible',
      ],
      relatedLinks: [
        {
          text: 'Stripe Webhook Guide',
          url: 'https://stripe.com/docs/webhooks',
          type: 'documentation',
        },
        {
          text: 'Testing Webhooks',
          url: 'https://stripe.com/docs/webhooks/test',
          type: 'documentation',
        },
      ],
    });
  }
  
  return issues;
}
```

## Advanced Customization

### Custom Step Ordering

By default, steps follow this order:
1. Prerequisites
2. CLI Installation
3. Repository Setup
4. Platform Setup
5. Environment Variables
6. Database
7. Build Config
8. Deploy
9. Verification

To customize:

```typescript
// src/lib/deployment/step-builder.ts
buildSteps(
  platform: Platform,
  requirements: DeploymentRequirements,
  repositoryUrl?: string | null
): DeploymentStep[] {
  const steps: DeploymentStep[] = [];
  let order = 1;
  
  // Custom ordering logic
  if (requirements.requiresDatabase && platform.id === 'railway') {
    // For Railway, set up database before environment variables
    steps.push(this.buildDatabaseStep(platform, requirements.databaseType!, order++));
    steps.push(this.buildEnvironmentVariablesStep(platform, requirements.environmentVariables, order++));
  } else {
    // Standard order
    steps.push(this.buildEnvironmentVariablesStep(platform, requirements.environmentVariables, order++));
    if (requirements.requiresDatabase) {
      steps.push(this.buildDatabaseStep(platform, requirements.databaseType!, order++));
    }
  }
  
  return steps;
}
```

### Conditional Substeps

Add substeps that only appear for certain configurations:

```typescript
private buildDatabaseStep(
  platform: Platform,
  databaseType: string,
  order: number
): DeploymentStep {
  const substeps: DeploymentSubstep[] = [
    // ... base substeps
  ];
  
  // Add platform-specific substeps
  if (platform.id === 'railway' && databaseType === 'PostgreSQL') {
    substeps.push({
      id: 'railway-postgres-plugin',
      title: 'Add PostgreSQL plugin',
      description: 'Railway can provision a PostgreSQL database for you',
      commands: [{
        id: 'railway-add-postgres',
        command: 'railway add postgres',
        description: 'Add PostgreSQL to your project',
        language: 'bash',
      }],
    });
  }
  
  return {
    id: 'database-setup',
    title: `Set Up ${databaseType} Database`,
    description: '...',
    order,
    required: true,
    substeps,
  };
}
```

### Dynamic Command Generation

Generate commands based on actual project values:

```typescript
private buildDeployStep(
  platform: Platform,
  order: number,
  projectName?: string
): DeploymentStep {
  const command = projectName
    ? `${platform.id} deploy --name ${projectName}`
    : `${platform.id} deploy`;
  
  return {
    id: 'deploy',
    title: 'Deploy Your Application',
    description: 'Deploy to production',
    order,
    required: true,
    commands: [{
      id: 'deploy-cmd',
      command,
      description: 'Deploy to production environment',
      language: 'bash',
      placeholders: projectName ? [] : [{
        key: '--name',
        description: 'Optional: specify a project name',
        example: '--name my-app',
      }],
    }],
  };
}
```

## Testing Your Extensions

### Unit Tests

Test your analyzer logic:

```typescript
// src/lib/deployment/__test-my-feature.ts
import { ConfigurationAnalyzer } from './configuration-analyzer';
import { ScaffoldConfig } from '@/types';

describe('ConfigurationAnalyzer - My Feature', () => {
  const analyzer = new ConfigurationAnalyzer();
  
  it('should detect my feature when enabled', () => {
    const config: ScaffoldConfig = {
      // ... base config
      extras: {
        myFeature: true,
      },
    };
    
    const requirements = analyzer.analyze(config);
    expect(requirements.requiresMyFeature).toBe(true);
  });
  
  it('should generate correct environment variables', () => {
    const config: ScaffoldConfig = {
      // ... config with feature
    };
    
    const vars = analyzer.detectEnvironmentVariables(config);
    const myFeatureVar = vars.find(v => v.key === 'MY_FEATURE_API_KEY');
    
    expect(myFeatureVar).toBeDefined();
    expect(myFeatureVar?.required).toBe(true);
  });
});
```

### Integration Tests

Test complete guide generation:

```typescript
// src/lib/deployment/__test-my-platform.ts
import { GuideGenerator } from './guide-generator';
import { PLATFORMS } from './platforms';

describe('GuideGenerator - My Platform', () => {
  const generator = new GuideGenerator();
  const myPlatform = PLATFORMS.find(p => p.id === 'my-platform')!;
  
  it('should generate complete guide for my platform', () => {
    const config: ScaffoldConfig = {
      // ... test config
    };
    
    const guide = generator.generateGuide(myPlatform, config);
    
    expect(guide.steps.length).toBeGreaterThan(0);
    expect(guide.platform.id).toBe('my-platform');
    expect(guide.postDeploymentChecklist.length).toBeGreaterThan(0);
  });
});
```

### Manual Testing

1. **Generate a test scaffold** with your feature enabled
2. **Navigate to deployment guides**
3. **Select your platform**
4. **Verify**:
   - All steps appear in correct order
   - Commands are correct and copyable
   - External links work
   - Progress tracking works
   - Export functionality works

## Best Practices

### DO ✅

- **Keep steps focused**: One clear objective per step
- **Provide context**: Explain why each step is needed
- **Use consistent terminology**: Match platform's official docs
- **Test commands**: Verify every command works
- **Link to official docs**: Don't duplicate documentation
- **Handle errors gracefully**: Provide troubleshooting
- **Consider all configurations**: Test with different setups
- **Update external links**: Verify links periodically

### DON'T ❌

- **Don't assume knowledge**: Explain technical terms
- **Don't skip error cases**: Add troubleshooting
- **Don't hardcode values**: Use placeholders
- **Don't duplicate content**: Reference existing docs
- **Don't forget accessibility**: Support keyboard navigation
- **Don't ignore edge cases**: Handle monorepos, custom configs
- **Don't break existing guides**: Test thoroughly

### Code Style

```typescript
// ✅ Good: Clear, descriptive names
private buildDatabaseSetupStep(
  platform: Platform,
  databaseType: string,
  order: number
): DeploymentStep {
  // ...
}

// ❌ Bad: Unclear abbreviations
private bldDbStep(p: Platform, dt: string, o: number): DeploymentStep {
  // ...
}

// ✅ Good: Documented complex logic
/**
 * Generate environment variable commands for the platform.
 * 
 * Different platforms use different CLI commands:
 * - Vercel: `vercel env add KEY`
 * - Railway: `railway variables set KEY=value`
 * - Render: Set via dashboard (no CLI command)
 */
private getEnvVarCommand(platform: Platform, envVar: EnvironmentVariable): CommandSnippet[] {
  // ...
}

// ✅ Good: Type-safe with proper types
const substeps: DeploymentSubstep[] = [];

// ❌ Bad: Using any
const substeps: any[] = [];
```

## Getting Help

- **Documentation**: Read [DEPLOYMENT_GUIDES.md](../DEPLOYMENT_GUIDES.md)
- **Code Examples**: Look at existing platform implementations
- **Issues**: Search GitHub issues for similar problems
- **Discussions**: Ask in GitHub Discussions
- **Code Review**: Submit a draft PR for feedback

## Contributing Your Extensions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b add-flyio-platform`
3. **Make your changes**
4. **Add tests**
5. **Update documentation**
6. **Submit a pull request**

Include in your PR:
- Description of what you added
- Why it's useful
- Screenshots (for UI changes)
- Test results
- Updated documentation

---

**Happy extending! 🚀**
